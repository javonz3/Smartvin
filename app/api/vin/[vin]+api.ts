export async function GET(request: Request, { vin }: { vin: string }) {
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  
  if (!SECRET_KEY || !USERNAME || !PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      error: 'API credentials not configured',
      message: 'VDP API credentials (secret_key, username, password) are missing from environment variables'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  if (!vin || vin.length !== 17) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid VIN format',
      message: 'VIN must be 17 characters long and contain only valid characters'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Validate VIN format
  const invalidChars = /[IOQ]/i;
  const validChars = /^[A-HJ-NPR-Z0-9]+$/i;
  
  if (invalidChars.test(vin) || !validChars.test(vin)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid VIN format',
      message: 'VIN contains invalid characters (I, O, Q not allowed)'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Step 1: Get authentication token
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret_key: SECRET_KEY,
        username: USERNAME,
        password: PASSWORD
      })
    });

    if (!tokenResponse.ok) {
      let errorMessage = 'Failed to authenticate with VIN service';
      
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
        },
      });
    }

    const tokenData = await tokenResponse.json();
    const authToken = tokenData.token;

    if (!authToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication failed',
        message: 'No authentication token received from VIN service'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Step 2: Get VIN report using the correct endpoint structure
    // Based on the API docs: /products/vind/reports/{VIN}?force=false
    const vinResponse = await fetch(`https://api.vindata.com/v1/products/vind/reports/${vin}?force=false`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!vinResponse.ok) {
      let errorMessage = `API Error: ${vinResponse.status}`;
      
      try {
        const errorData = await vinResponse.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
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
        } else {
          errorMessage = vinResponse.statusText || 'An unexpected error occurred with the VIN service.';
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
        },
      });
    }

    const reportData = await vinResponse.json();
    
    // The API returns a report with an HTML link - we need to extract the actual vehicle data
    if (!reportData || !reportData.html_link) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response',
        message: 'No vehicle report generated for this VIN'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // For now, we'll extract basic info from the report response
    // In a production app, you might want to parse the HTML report or use additional API endpoints
    const vehicleData = {
      vin: vin,
      year: reportData.year || 0,
      make: reportData.make || '',
      model: reportData.model || '',
      trim: reportData.trim || '',
      engine: reportData.engine || '',
      transmission: reportData.transmission || '',
      drivetrain: reportData.drivetrain || '',
      bodyStyle: reportData.body_style || '',
      fuelType: reportData.fuel_type || '',
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
      // Additional fields from the report
      htmlLink: reportData.html_link,
      reportId: reportData.id,
      reportDate: reportData.created_at
    };

    return new Response(JSON.stringify({
      success: true,
      data: vehicleData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('VIN API Proxy Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to VIN service'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}