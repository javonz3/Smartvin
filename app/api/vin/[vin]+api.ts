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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      },
    });
  }

  try {
    console.log('[VIN API] Step 1: Authenticating with VIN Data API...');
    
    // Prepare authentication payload
    const authPayload = {
      secret_key: SECRET_KEY.trim(),
      username: USERNAME.trim(),
      password: PASSWORD.trim()
    };
    
    console.log('[VIN API] Authentication payload prepared');
    
    // Step 1: Get authentication token with CLEAN headers
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN-App/1.0'
      },
      body: JSON.stringify(authPayload)
    });
    
    console.log(`[VIN API] Token response status: ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[VIN API] Authentication failed:`, {
        status: tokenResponse.status,
        response: errorText
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: `Authentication Error: ${tokenResponse.status}`,
        message: 'Failed to authenticate with VIN service'
      }), {
        status: tokenResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
        },
      });
    }

    const tokenData = await tokenResponse.json();
    const authToken = tokenData.token;

    if (!authToken) {
      console.error('[VIN API] No token in response');
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication failed',
        message: 'No authentication token received'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
        },
      });
    }

    console.log('[VIN API] Step 2: Requesting VIN report...');
    
    // Step 2: Get VIN report with ONLY ONE Authorization header
    const reportUrl = `https://api.vindata.com/v1/products/vind/reports/${vin.toUpperCase()}?force=true`;
    
    const vinResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN-App/1.0'
      }
    });

    console.log(`[VIN API] Report response status: ${vinResponse.status}`);

    if (!vinResponse.ok) {
      const errorText = await vinResponse.text();
      console.error(`[VIN API] Report request failed:`, {
        status: vinResponse.status,
        response: errorText
      });

      return new Response(JSON.stringify({
        success: false,
        error: `API Error: ${vinResponse.status}`,
        message: 'Failed to get VIN report'
      }), {
        status: vinResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
        },
      });
    }

    const reportData = await vinResponse.json();
    
    console.log('[VIN API] Report data received successfully');
    
    // Transform the report data
    const vehicleData = {
      vin: vin.toUpperCase(),
      year: parseInt(reportData.year) || 0,
      make: reportData.make || '',
      model: reportData.model || '',
      trim: reportData.trim || '',
      engine: reportData.engine || '',
      transmission: reportData.transmission || '',
      drivetrain: reportData.drivetrain || '',
      bodyStyle: reportData.body_style || '',
      fuelType: reportData.fuel_type || 'Gasoline',
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      },
    });

  } catch (error) {
    console.error('[VIN API] Proxy Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Network error',
      message: 'Failed to connect to VIN service'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}