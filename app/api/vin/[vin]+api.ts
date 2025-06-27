export async function GET(request: Request, { vin }: { vin: string }) {
  console.log(`[VIN API] Processing request for VIN: ${vin}`);
  
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  
  // Check if all required credentials are present
  if (!SECRET_KEY || !USERNAME || !PASSWORD) {
    console.error('[VIN API] Missing credentials:', {
      hasSecretKey: !!SECRET_KEY,
      hasUsername: !!USERNAME,
      hasPassword: !!PASSWORD
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'API credentials not configured',
      message: 'VDP API credentials (secret_key, username, password) are missing from environment variables'
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
    
    // Prepare authentication payload - ensure clean data
    const authPayload = {
      secret_key: SECRET_KEY.trim(),
      username: USERNAME.trim(),
      password: PASSWORD.trim()
    };
    
    console.log('[VIN API] Authentication payload prepared (credentials masked)');
    
    // Step 1: Get authentication token with proper headers
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN/1.0'
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
        response: errorText.substring(0, 500)
      });
      
      let errorMessage = 'Failed to authenticate with VIN service';
      
      // Parse error response if possible
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use status-based error messages
        switch (tokenResponse.status) {
          case 401:
            errorMessage = 'Invalid API credentials. Please check your secret key, username, and password.';
            break;
          case 403:
            errorMessage = 'Access forbidden. Please verify your account has API access enabled.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          default:
            errorMessage = `Authentication failed with status ${tokenResponse.status}`;
        }
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
    
    // Step 2: Get VIN report with proper Bearer token format
    const reportUrl = `https://api.vindata.com/v1/products/vind/reports/${vin.toUpperCase()}?force=false`;
    
    console.log(`[VIN API] Making request to: ${reportUrl}`);
    console.log(`[VIN API] Using Bearer token: ${authToken.substring(0, 20)}...`);
    
    const vinResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN/1.0'
      }
    });

    console.log(`[VIN API] Report response status: ${vinResponse.status}`);
    console.log(`[VIN API] Report response headers:`, Object.fromEntries(vinResponse.headers.entries()));

    if (!vinResponse.ok) {
      const errorText = await vinResponse.text();
      console.error(`[VIN API] Report request failed:`, {
        status: vinResponse.status,
        statusText: vinResponse.statusText,
        response: errorText.substring(0, 500)
      });

      let errorMessage = 'Failed to get VIN report';
      
      // Parse error response if possible
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use status-based error messages
        switch (vinResponse.status) {
          case 401:
            errorMessage = 'Authentication token expired or invalid. Please try again.';
            break;
          case 403:
            errorMessage = 'Access forbidden. Your account may not have access to this VIN.';
            break;
          case 404:
            errorMessage = 'VIN not found in database. Please verify the VIN is correct.';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please wait before making another request.';
            break;
          default:
            errorMessage = `VIN report request failed with status ${vinResponse.status}`;
        }
      }

      return new Response(JSON.stringify({
        success: false,
        error: `API Error: ${vinResponse.status}`,
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
      errorMessage = 'Network connection error. Please check your internet connection.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Network error',
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