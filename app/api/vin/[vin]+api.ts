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
    
    // Step 1: Get authentication token
    // Based on docs: https://vdpvin.docs.apiary.io/#reference/0/authentication/get-token
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        secret_key: SECRET_KEY,
        username: USERNAME,
        password: PASSWORD
      })
    });

    console.log(`[VIN API] Token response status: ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      let errorMessage = 'Failed to authenticate with VIN service';
      let errorDetails = '';
      
      try {
        const errorData = await tokenResponse.json();
        errorDetails = JSON.stringify(errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorDetails = `Status: ${tokenResponse.status} ${tokenResponse.statusText}`;
      }
      
      console.error(`[VIN API] Authentication failed:`, errorDetails);
      
      if (tokenResponse.status === 401 || tokenResponse.status === 403) {
        errorMessage = 'Invalid credentials. Please check your VIN Data API secret key, username, and password.';
      } else if (tokenResponse.status === 429) {
        errorMessage = 'Too many authentication requests. Please wait a moment and try again.';
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
    console.log('[VIN API] Token received successfully');
    
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
    
    // Step 2: Get VIN report using the correct endpoint structure
    // Based on docs: https://api.vindata.com/v1/products/vind/reports/{VIN}?force=false
    const reportUrl = `https://api.vindata.com/v1/products/vind/reports/${vin}?force=false`;
    console.log(`[VIN API] Report URL: ${reportUrl}`);
    
    const vinResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`[VIN API] Report response status: ${vinResponse.status}`);

    if (!vinResponse.ok) {
      let errorMessage = `API Error: ${vinResponse.status}`;
      let errorDetails = '';
      
      try {
        const errorData = await vinResponse.json();
        errorDetails = JSON.stringify(errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error(`[VIN API] Report request failed:`, errorDetails);
      } catch (e) {
        errorDetails = `Status: ${vinResponse.status} ${vinResponse.statusText}`;
        console.error(`[VIN API] Report request failed:`, errorDetails);
        
        // Provide descriptive error messages based on status code
        if (vinResponse.status >= 500) {
          errorMessage = 'The VIN service is temporarily unavailable. Please try again later.';
        } else if (vinResponse.status >= 400 && vinResponse.status < 500) {
          if (vinResponse.status === 404) {
            errorMessage = 'No vehicle data found for this VIN number.';
          } else if (vinResponse.status === 401 || vinResponse.status === 403) {
            errorMessage = 'Authentication failed with the VIN service. Please check your API credentials.';
          } else if (vinResponse.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else {
            errorMessage = 'Invalid request. Please check the VIN number and try again.';
          }
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
    console.log('[VIN API] Report data received:', Object.keys(reportData));
    
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
    console.log('[VIN API] Vehicle data:', {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      hasHtmlLink: !!vehicleData.htmlLink
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