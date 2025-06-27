export async function GET(request: Request, { vin }: { vin: string }) {
  console.log(`[VIN API] Processing request for VIN: ${vin}`);
  
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  const PRODUCT_GROUP = process.env.EXPO_PUBLIC_VDP_PRODUCT_GROUP;
  
  // Check if all required credentials are present
  if (!SECRET_KEY || !USERNAME || !PASSWORD || !PRODUCT_GROUP) {
    console.error('[VIN API] Missing credentials:', {
      hasSecretKey: !!SECRET_KEY,
      hasUsername: !!USERNAME,
      hasPassword: !!PASSWORD,
      hasProductGroup: !!PRODUCT_GROUP
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'API credentials not configured',
      message: 'VDP API credentials (secret_key, username, password, product_group) are missing from environment variables'
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
    
    // Prepare authentication payload - ensure clean data and correct parameter names
    const authPayload = {
      secret_key: SECRET_KEY.trim(),
      username: USERNAME.trim(),
      password: PASSWORD.trim()
    };
    
    console.log('[VIN API] Authentication payload prepared with parameters:', Object.keys(authPayload));
    
    // Step 1: Get authentication token
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });
    
    console.log(`[VIN API] Token response status: ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[VIN API] Authentication failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: errorText.substring(0, 500),
        sentPayload: {
          secret_key: SECRET_KEY ? `${SECRET_KEY.substring(0, 10)}...` : 'MISSING',
          username: USERNAME || 'MISSING',
          password: PASSWORD ? '***' : 'MISSING'
        }
      });
      
      let errorMessage = `Authentication failed with status ${tokenResponse.status}: ${tokenResponse.statusText}`;
      
      // Try to parse error response for more details
      try {
        const parsedError = JSON.parse(errorText);
        if (parsedError.message) {
          errorMessage = `Authentication failed (${tokenResponse.status}): ${parsedError.message}`;
        } else if (parsedError.error) {
          errorMessage = `Authentication failed (${tokenResponse.status}): ${parsedError.error}`;
        }
      } catch (parseError) {
        if (errorText && errorText.trim()) {
          errorMessage = `Authentication failed (${tokenResponse.status}): ${errorText.substring(0, 200)}`;
        }
      }
      
      // Add specific guidance for 403 errors
      if (tokenResponse.status === 403) {
        errorMessage += `

CREDENTIAL VERIFICATION REQUIRED:
1. Log in to your VIN Data dashboard: https://vindata.com/dashboard
2. Navigate to the API section
3. Verify your Secret Key (API Key) is correct
4. Ensure your username and password are exactly as shown in the dashboard
5. Check that your account is active and has API access
6. Update your .env file with the correct credentials
7. Restart the development server

Current credential status:
- Secret Key: ${SECRET_KEY ? 'Present' : 'MISSING'}
- Username: ${USERNAME ? 'Present' : 'MISSING'}  
- Password: ${PASSWORD ? 'Present' : 'MISSING'}`;
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
      tokenType: typeof tokenData.token,
      expiresIn: tokenData.expires_in
    });

    const authToken = tokenData.token;

    if (!authToken) {
      console.error('[VIN API] No token in response:', tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication failed',
        message: 'No authentication token received from VIN service'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('[VIN API] Step 2: Requesting VIN report...');
    
    // Step 2: Get VIN report using POST method with product group parameter
    const reportUrl = `https://api.vindata.com/v1/products/${PRODUCT_GROUP.trim()}/reports/${vin.toUpperCase()}?force=true`;
    
    console.log(`[VIN API] Making POST request to: ${reportUrl}`);
    console.log(`[VIN API] Using Bearer token: ${authToken.substring(0, 20)}...`);
    console.log(`[VIN API] Using product group: ${PRODUCT_GROUP.trim()}`);
    
    const vinResponse = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log(`[VIN API] Report response status: ${vinResponse.status}`);

    if (!vinResponse.ok) {
      const errorText = await vinResponse.text();
      console.error(`[VIN API] Report request failed:`, {
        status: vinResponse.status,
        statusText: vinResponse.statusText,
        response: errorText.substring(0, 500)
      });

      let errorMessage = `VIN report request failed with status ${vinResponse.status}: ${vinResponse.statusText}`;
      
      // Try to parse error response for more details
      try {
        const parsedError = JSON.parse(errorText);
        if (parsedError.message) {
          errorMessage = `VIN report failed (${vinResponse.status}): ${parsedError.message}`;
        } else if (parsedError.error) {
          errorMessage = `VIN report failed (${vinResponse.status}): ${parsedError.error}`;
        }
      } catch (parseError) {
        if (errorText && errorText.trim()) {
          errorMessage = `VIN report failed (${vinResponse.status}): ${errorText.substring(0, 200)}`;
        }
      }
      
      // Add specific status-based guidance with enhanced product group help
      switch (vinResponse.status) {
        case 400:
          if (errorText.includes('No suitable product group found') || errorText.includes('product group')) {
            errorMessage = `PRODUCT GROUP ERROR: The product group '${PRODUCT_GROUP}' is not valid for your VIN Data account.

SOLUTION STEPS:
1. Log in to your VIN Data dashboard: https://vindata.com/dashboard
2. Navigate to the "Products" or "API Access" section
3. Find your available product groups (might be: 'vin', 'vehicle', 'decode', 'basic', 'premium', etc.)
4. Update your .env file with the EXACT product group name from your dashboard
5. Restart the development server

If you're unsure about your product group, contact VIN Data support or try these common alternatives: 'vin', 'vehicle', 'decode', 'basic', 'premium'`;
          } else {
            errorMessage += ` - Please check your product group setting (${PRODUCT_GROUP}). Log in to your VIN Data dashboard to verify the correct product group name.`;
          }
          break;
        case 401:
          errorMessage += ' - Authentication token may have expired. Please try again';
          break;
        case 403:
          errorMessage += ` - Access forbidden. Your account may not have access to the '${PRODUCT_GROUP}' product group or this specific VIN. Check your VIN Data dashboard for available product groups and account permissions.`;
          break;
        case 404:
          errorMessage += ' - VIN not found in database. Please verify the VIN is correct';
          break;
        case 405:
          errorMessage += ' - Method not allowed. The API endpoint may have changed';
          break;
        case 429:
          errorMessage += ' - Rate limit exceeded. Please wait before making another request';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage += ' - VIN service is temporarily unavailable. Please try again later';
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
      vin: reportData.vin,
      year: reportData.year,
      make: reportData.make,
      model: reportData.model
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
    console.error('[VIN API] Proxy Error:', error);
    
    let errorMessage = 'Failed to connect to VIN service';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network connection error. Please check your internet connection and try again';
    } else if (error instanceof Error) {
      errorMessage = `VIN service error: ${error.message}`;
    } else {
      errorMessage = 'An unexpected error occurred while processing the VIN request';
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Network/Service Error',
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