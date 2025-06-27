export async function GET(request: Request, { vin }: { vin: string }) {
  console.log(`[VIN API] Processing request for VIN: ${vin}`);
  
  // Access environment variables with explicit checks
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  const PRODUCT_GROUP = process.env.EXPO_PUBLIC_VDP_PRODUCT_GROUP;
  
  // Log environment variable status (without exposing sensitive data)
  console.log('[VIN API] Environment variables status:', {
    SECRET_KEY: SECRET_KEY ? `Present (${SECRET_KEY.length} chars, starts with: ${SECRET_KEY.substring(0, 3)}...)` : 'MISSING',
    USERNAME: USERNAME ? `Present: ${USERNAME}` : 'MISSING',
    PASSWORD: PASSWORD ? `Present (${PASSWORD.length} chars)` : 'MISSING',
    PRODUCT_GROUP: PRODUCT_GROUP ? `Present: ${PRODUCT_GROUP}` : 'MISSING'
  });
  
  // Check if all required credentials are present and not placeholder values
  if (!SECRET_KEY || !USERNAME || !PASSWORD || !PRODUCT_GROUP) {
    console.error('[VIN API] Missing required environment variables');
    return new Response(JSON.stringify({
      success: false,
      error: 'API credentials not configured',
      message: 'Required environment variables are missing. Please check your .env file contains: EXPO_PUBLIC_VDP_API_KEY, EXPO_PUBLIC_VDP_USERNAME, EXPO_PUBLIC_VDP_PASSWORD, EXPO_PUBLIC_VDP_PRODUCT_GROUP'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Check for placeholder values
  const placeholderValues = [
    'your_secret_key_here',
    'your_username_here', 
    'your_password_here',
    'your_product_group_here',
    'vind' // default placeholder
  ];
  
  if (placeholderValues.includes(SECRET_KEY) || 
      placeholderValues.includes(USERNAME) || 
      placeholderValues.includes(PASSWORD)) {
    console.error('[VIN API] Placeholder values detected in environment variables');
    return new Response(JSON.stringify({
      success: false,
      error: 'Placeholder credentials detected',
      message: 'Environment variables contain placeholder values. Please update your .env file with actual VIN Data API credentials from your dashboard at https://vindata.com/dashboard'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Validate VIN format
  if (!vin || vin.length !== 17) {
    console.error(`[VIN API] Invalid VIN length: ${vin?.length}`);
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid VIN format',
      message: 'VIN must be 17 characters long'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    console.log('[VIN API] Step 1: Authenticating with VIN Data API...');
    
    // Prepare authentication payload - ensure we're using actual values
    const authPayload = {
      secret_key: SECRET_KEY.trim(),
      username: USERNAME.trim(),
      password: PASSWORD.trim()
    };
    
    // Verify payload contains actual values (not placeholders)
    console.log('[VIN API] Authentication payload verification:', {
      secret_key_length: authPayload.secret_key.length,
      secret_key_preview: authPayload.secret_key.substring(0, 8) + '...',
      username: authPayload.username,
      password_length: authPayload.password.length,
      password_preview: authPayload.password.substring(0, 3) + '...',
      all_fields_present: !!(authPayload.secret_key && authPayload.username && authPayload.password)
    });
    
    // Double-check we're not sending placeholder values
    if (authPayload.secret_key.includes('your_secret_key') || 
        authPayload.username.includes('your_username') ||
        authPayload.password.includes('your_password')) {
      throw new Error('Placeholder values detected in authentication payload');
    }
    
    // Step 1: Get authentication token
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'SmartVIN-App/1.0'
      },
      body: JSON.stringify(authPayload)
    });
    
    console.log(`[VIN API] Token response status: ${tokenResponse.status}`);
    console.log(`[VIN API] Token response headers:`, Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[VIN API] Authentication failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        responseBody: errorText,
        requestPayload: {
          secret_key: authPayload.secret_key.substring(0, 8) + '...',
          username: authPayload.username,
          password: '***HIDDEN***'
        }
      });
      
      let errorMessage = `Authentication failed with status ${tokenResponse.status}`;
      
      // Parse error response for more details
      try {
        const parsedError = JSON.parse(errorText);
        if (parsedError.message) {
          errorMessage = `Authentication failed: ${parsedError.message}`;
        } else if (parsedError.error) {
          errorMessage = `Authentication failed: ${parsedError.error}`;
        }
      } catch (parseError) {
        if (errorText && errorText.trim()) {
          errorMessage = `Authentication failed: ${errorText}`;
        }
      }
      
      // Add specific guidance based on status code
      if (tokenResponse.status === 403) {
        errorMessage += `

TROUBLESHOOTING STEPS:
1. Verify your VIN Data credentials at: https://vindata.com/dashboard
2. Check that your API key (secret_key) is correct and active
3. Ensure your username and password are exactly as shown in your dashboard
4. Verify your account has API access enabled
5. Make sure you're using the correct credentials (not test/demo credentials)

Current request details:
- Secret Key: ${authPayload.secret_key.substring(0, 8)}... (${authPayload.secret_key.length} characters)
- Username: ${authPayload.username}
- Password: ***PRESENT*** (${authPayload.password.length} characters)`;
      } else if (tokenResponse.status === 401) {
        errorMessage += `

AUTHENTICATION ERROR:
Your credentials appear to be invalid. Please:
1. Double-check your secret key, username, and password
2. Ensure there are no extra spaces or special characters
3. Verify your account is active at https://vindata.com/dashboard`;
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: `Authentication Error: ${tokenResponse.status}`,
        message: errorMessage
      }), {
        status: tokenResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('[VIN API] Token response received:', {
      hasToken: !!tokenData.token,
      tokenLength: tokenData.token?.length || 0,
      tokenPreview: tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'NO_TOKEN',
      expiresIn: tokenData.expires_in
    });

    const authToken = tokenData.token;

    if (!authToken) {
      console.error('[VIN API] No token in response:', tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication failed',
        message: 'No authentication token received from VIN service. Please check your credentials.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('[VIN API] Step 2: Requesting VIN report...');
    
    // Step 2: Get VIN report using POST method with product group
    const reportUrl = `https://api.vindata.com/v1/products/${PRODUCT_GROUP.trim()}/reports/${vin.toUpperCase()}?force=true`;
    
    console.log(`[VIN API] Making POST request to: ${reportUrl}`);
    console.log(`[VIN API] Using product group: "${PRODUCT_GROUP.trim()}"`);
    console.log(`[VIN API] Using Bearer token: ${authToken.substring(0, 20)}...`);
    
    const vinResponse = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'SmartVIN-App/1.0'
      }
    });

    console.log(`[VIN API] Report response status: ${vinResponse.status}`);
    console.log(`[VIN API] Report response headers:`, Object.fromEntries(vinResponse.headers.entries()));

    if (!vinResponse.ok) {
      const errorText = await vinResponse.text();
      console.error(`[VIN API] Report request failed:`, {
        status: vinResponse.status,
        statusText: vinResponse.statusText,
        responseBody: errorText,
        requestUrl: reportUrl
      });

      let errorMessage = `VIN report request failed with status ${vinResponse.status}`;
      
      // Parse error response for more details
      try {
        const parsedError = JSON.parse(errorText);
        if (parsedError.message) {
          errorMessage = `VIN report failed: ${parsedError.message}`;
        } else if (parsedError.error) {
          errorMessage = `VIN report failed: ${parsedError.error}`;
        }
      } catch (parseError) {
        if (errorText && errorText.trim()) {
          errorMessage = `VIN report failed: ${errorText}`;
        }
      }
      
      // Add specific guidance based on status code
      switch (vinResponse.status) {
        case 400:
          if (errorText.toLowerCase().includes('product group') || errorText.toLowerCase().includes('no suitable')) {
            errorMessage = `PRODUCT GROUP ERROR: The product group "${PRODUCT_GROUP}" is not valid for your account.

SOLUTION:
1. Log in to your VIN Data dashboard: https://vindata.com/dashboard
2. Navigate to "Products" or "API Access" section
3. Find your available product groups
4. Update EXPO_PUBLIC_VDP_PRODUCT_GROUP in your .env file with the exact name
5. Common product groups: 'vin', 'vehicle', 'decode', 'basic', 'premium', 'vind'
6. Restart your development server

If unsure, contact VIN Data support for your correct product group name.`;
          } else {
            errorMessage += ` - Bad request. Please verify your product group "${PRODUCT_GROUP}" and VIN "${vin}" are correct.`;
          }
          break;
        case 401:
          errorMessage += ' - Authentication token expired or invalid. Please try again.';
          break;
        case 403:
          errorMessage += ` - Access forbidden. Your account may not have access to product group "${PRODUCT_GROUP}" or this VIN.`;
          break;
        case 404:
          errorMessage += ` - VIN "${vin}" not found in database. Please verify the VIN is correct.`;
          break;
        case 429:
          errorMessage += ' - Rate limit exceeded. Please wait before making another request.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage += ' - VIN Data service is temporarily unavailable. Please try again later.';
          break;
      }

      return new Response(JSON.stringify({
        success: false,
        error: `VIN Report Error: ${vinResponse.status}`,
        message: errorMessage
      }), {
        status: vinResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const reportData = await vinResponse.json();
    
    console.log('[VIN API] Report data received successfully:', {
      hasData: !!reportData,
      dataKeys: Object.keys(reportData || {}),
      vin: reportData?.vin,
      year: reportData?.year,
      make: reportData?.make,
      model: reportData?.model
    });
    
    // Transform the report data to match our interface
    const vehicleData = {
      vin: vin.toUpperCase(),
      year: parseInt(reportData.year) || 0,
      make: reportData.make || '',
      model: reportData.model || '',
      trim: reportData.trim || '',
      engine: reportData.engine || '',
      transmission: reportData.transmission || '',
      drivetrain: reportData.drivetrain || reportData.drive_type || '',
      bodyStyle: reportData.body_style || reportData.bodyStyle || '',
      fuelType: reportData.fuel_type || reportData.fuelType || 'Gasoline',
      doors: parseInt(reportData.doors) || 4,
      cylinders: parseInt(reportData.cylinders) || 0,
      displacement: reportData.displacement || '',
      horsepower: parseInt(reportData.horsepower) || 0,
      torque: parseInt(reportData.torque) || 0,
      cityMpg: parseInt(reportData.city_mpg) || 0,
      highwayMpg: parseInt(reportData.highway_mpg) || 0,
      combinedMpg: parseInt(reportData.combined_mpg) || 0,
      msrp: parseInt(reportData.msrp) || 0,
      category: reportData.category || '',
      manufacturerCode: reportData.manufacturer_code || '',
      plantCountry: reportData.plant_country || '',
      plantCompany: reportData.plant_company || '',
      plantState: reportData.plant_state || '',
      plantCity: reportData.plant_city || '',
      htmlLink: reportData.html_link,
      reportId: reportData.id,
      reportDate: reportData.created_at
    };

    console.log('[VIN API] Successfully processed VIN:', vin);

    return new Response(JSON.stringify({
      success: true,
      data: vehicleData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('[VIN API] Unexpected error:', error);
    
    let errorMessage = 'An unexpected error occurred while processing the VIN request';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network connection error. Please check your internet connection and try again.';
    } else if (error instanceof Error) {
      errorMessage = `Service error: ${error.message}`;
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Service Error',
      message: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}