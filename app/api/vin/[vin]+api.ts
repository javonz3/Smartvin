export async function GET(request: Request, { vin }: { vin: string }) {
  const API_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  
  if (!API_KEY) {
    return new Response(JSON.stringify({
      success: false,
      error: 'API key not configured',
      message: 'VDP API key is missing from environment variables'
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
    const response = await fetch(`https://api.vindataproject.com/api/vin/${vin}`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Provide descriptive error messages based on status code ranges
        if (response.status >= 500) {
          errorMessage = 'The VIN service is temporarily unavailable. Please try again later.';
        } else if (response.status >= 400 && response.status < 500) {
          if (response.status === 404) {
            errorMessage = 'No vehicle data found for this VIN number.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Authentication failed with the VIN service.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else {
            errorMessage = 'Invalid request. Please check the VIN number and try again.';
          }
        } else {
          errorMessage = response.statusText || 'An unexpected error occurred with the VIN service.';
        }
      }

      return new Response(JSON.stringify({
        success: false,
        error: `API Error: ${response.status}`,
        message: errorMessage
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await response.json();
    
    if (!data || (!data.vin && !data.VIN)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response',
        message: 'No vehicle data found for this VIN'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: data
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