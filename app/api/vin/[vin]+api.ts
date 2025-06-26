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
        errorMessage = `${response.status}: ${response.statusText}`;
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