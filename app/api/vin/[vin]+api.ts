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

  // Validate VIN characters (no I, O, Q allowed)
  const invalidChars = /[IOQ]/i;
  const validChars = /^[A-HJ-NPR-Z0-9]+$/i;
  
  if (invalidChars.test(vin) || !validChars.test(vin)) {
    console.error(`[VIN API] Invalid VIN characters: ${vin}`);
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid VIN format',
      message: 'VIN contains invalid characters (I, O, Q not allowed)'
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
    
    // Prepare authentication payload with exact credentials
    const authPayload = {
      secret_key: SECRET_KEY.trim(),
      username: USERNAME.trim(),
      password: PASSWORD.trim() // This should be "Smooth1one.23"
    };
    
    console.log('[VIN API] Authentication payload:', {
      secret_key: authPayload.secret_key,
      username: authPayload.username,
      password: authPayload.password // Full password for debugging
    });
    
    // Step 1: Get authentication token with proper headers
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN-App/1.0',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(authPayload)
    });

    console.log(`[VIN API] Token request headers sent:`, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SmartVIN-App/1.0'
    });
    
    console.log(`[VIN API] Token response status: ${tokenResponse.status}`);
    console.log(`[VIN API] Token response headers:`, Object.fromEntries(tokenResponse.headers.entries()));

    // Get response text for debugging
    const responseText = await tokenResponse.text();
    console.log(`[VIN API] Raw token response:`, responseText);

    if (!tokenResponse.ok) {
      let errorMessage = 'Failed to authenticate with VIN service';
      let errorData = null;
      
      try {
        errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.log('[VIN API] Could not parse error response as JSON');
      }
      
      console.error(`[VIN API] Authentication failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: responseText,
        errorData,
        requestPayload: authPayload
      });
      
      if (tokenResponse.status === 401 || tokenResponse.status === 403) {
        errorMessage = 'Invalid credentials. Please verify your VIN Data API credentials are correct.';
      } else if (tokenResponse.status === 429) {
        errorMessage = 'Too many authentication requests. Please wait a moment and try again.';
      } else if (tokenResponse.status === 400) {
        errorMessage = 'Invalid request format. Please check your credentials format.';
      }

      return new Response(JSON.stringify({
        success: false,
        error: `Authentication Error: ${tokenResponse.status}`,
        message: errorMessage,
        debug: {
          status: tokenResponse.status,
          response: responseText,
          requestPayload: authPayload
        }
      }), {
        status: tokenResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      console.error('[VIN API] Failed to parse token response:', responseText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response format',
        message: 'Received invalid response from authentication service'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('[VIN API] Token response parsed:', {
      hasToken: !!tokenData.token,
      expiresIn: tokenData.expires_in,
      tokenPreview: tokenData.token ? `${tokenData.token.substring(0, 20)}...` : 'NONE'
    });
    
    const authToken = tokenData.token;

    if (!authToken) {
      console.error('[VIN API] No token in response:', tokenData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication failed',
        message: 'No authentication token received from VIN service',
        debug: tokenData
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('[VIN API] Step 2: Requesting VIN report...');
    
    // Step 2: Get VIN report using force=true with proper Authorization header
    const reportUrl = `https://api.vindata.com/v1/products/vind/reports/${vin.toUpperCase()}?force=true`;
    console.log(`[VIN API] Report URL: ${reportUrl}`);
    
    const vinResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN-App/1.0',
        'Cache-Control': 'no-cache'
      }
    });

    console.log(`[VIN API] Report request headers sent:`, {
      'Authorization': `Bearer ${authToken.substring(0, 20)}...`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SmartVIN-App/1.0'
    });

    console.log(`[VIN API] Report response status: ${vinResponse.status}`);
    console.log(`[VIN API] Report response headers:`, Object.fromEntries(vinResponse.headers.entries()));

    // Get response text for debugging
    const reportResponseText = await vinResponse.text();
    console.log(`[VIN API] Raw report response:`, reportResponseText);

    if (!vinResponse.ok) {
      let errorMessage = `API Error: ${vinResponse.status}`;
      let errorData = null;
      
      try {
        errorData = JSON.parse(reportResponseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.log('[VIN API] Could not parse report error response as JSON');
        
        // Provide descriptive error messages based on status code
        if (vinResponse.status >= 500) {
          errorMessage = 'The VIN service is temporarily unavailable. Please try again later.';
        } else if (vinResponse.status >= 400 && vinResponse.status < 500) {
          if (vinResponse.status === 404) {
            errorMessage = 'No vehicle data found for this VIN number.';
          } else if (vinResponse.status === 401 || vinResponse.status === 403) {
            errorMessage = 'Authentication failed with the VIN service. Token may have expired.';
          } else if (vinResponse.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else {
            errorMessage = 'Invalid request. Please check the VIN number and try again.';
          }
        }
      }
      
      console.error(`[VIN API] Report request failed:`, {
        status: vinResponse.status,
        statusText: vinResponse.statusText,
        response: reportResponseText,
        errorData,
        authTokenUsed: authToken ? `${authToken.substring(0, 20)}...` : 'NONE'
      });

      return new Response(JSON.stringify({
        success: false,
        error: `API Error: ${vinResponse.status}`,
        message: errorMessage,
        debug: {
          status: vinResponse.status,
          response: reportResponseText,
          authTokenPresent: !!authToken
        }
      }), {
        status: vinResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let reportData;
    try {
      reportData = JSON.parse(reportResponseText);
    } catch (e) {
      console.error('[VIN API] Failed to parse report response:', reportResponseText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response format',
        message: 'Received invalid response from VIN service'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('[VIN API] Report data received:', {
      hasData: !!reportData,
      keys: Object.keys(reportData || {}),
      vin: reportData?.vin,
      year: reportData?.year,
      make: reportData?.make,
      model: reportData?.model
    });
    
    // The API returns a report with an HTML link and vehicle data
    if (!reportData) {
      console.error('[VIN API] Empty report data');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response',
        message: 'No vehicle report generated for this VIN'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Transform the report data to our expected format
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
      // Additional fields from the VIN Data API
      htmlLink: reportData.html_link,
      reportId: reportData.id,
      reportDate: reportData.created_at
    };

    console.log('[VIN API] Successfully processed VIN:', vin);
    console.log('[VIN API] Final vehicle data:', {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: vehicleData.trim,
      hasHtmlLink: !!vehicleData.htmlLink,
      hasBasicData: !!(vehicleData.year && vehicleData.make && vehicleData.model)
    });

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
      errorMessage = 'Network connection error. Please check your internet connection and try again.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Network error',
      message: errorMessage,
      debug: {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle OPTIONS requests for CORS
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