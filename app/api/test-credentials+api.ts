// Test endpoint to validate VIN Data API credentials
export async function GET(request: Request) {
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  
  console.log('[Credential Test] Checking environment variables...');
  console.log('[Credential Test] Has SECRET_KEY:', !!SECRET_KEY);
  console.log('[Credential Test] Has USERNAME:', !!USERNAME);
  console.log('[Credential Test] Has PASSWORD:', !!PASSWORD);
  
  if (!SECRET_KEY || !USERNAME || !PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing credentials',
      message: 'One or more VDP API credentials are missing from environment variables',
      details: {
        hasSecretKey: !!SECRET_KEY,
        hasUsername: !!USERNAME,
        hasPassword: !!PASSWORD
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    console.log('[Credential Test] Testing authentication...');
    
    // Test authentication with VIN Data API
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

    console.log(`[Credential Test] Token response status: ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      let errorMessage = 'Authentication failed';
      let errorDetails = '';
      
      try {
        const errorData = await tokenResponse.json();
        errorDetails = JSON.stringify(errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorDetails = `Status: ${tokenResponse.status} ${tokenResponse.statusText}`;
      }
      
      console.error(`[Credential Test] Authentication failed:`, errorDetails);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Authentication failed: ${tokenResponse.status}`,
        message: errorMessage,
        details: errorDetails
      }), {
        status: tokenResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('[Credential Test] Authentication successful');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'VIN Data API credentials are valid and working',
      tokenReceived: !!tokenData.token,
      expiresIn: tokenData.expires_in
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('[Credential Test] Network error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to VIN Data API'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}