// Test endpoint to validate VIN Data API credentials
export async function GET(request: Request) {
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  
  console.log('[Credential Test] Checking environment variables...');
  console.log('[Credential Test] Has SECRET_KEY:', !!SECRET_KEY);
  console.log('[Credential Test] Has USERNAME:', !!USERNAME);
  console.log('[Credential Test] Has PASSWORD:', !!PASSWORD);
  
  if (SECRET_KEY) {
    console.log('[Credential Test] SECRET_KEY preview:', `${SECRET_KEY.substring(0, 8)}...`);
  }
  if (USERNAME) {
    console.log('[Credential Test] USERNAME:', USERNAME);
  }
  
  if (!SECRET_KEY || !USERNAME || !PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing credentials',
      message: 'One or more VDP API credentials are missing from environment variables',
      details: {
        hasSecretKey: !!SECRET_KEY,
        hasUsername: !!USERNAME,
        hasPassword: !!PASSWORD,
        secretKeyLength: SECRET_KEY?.length || 0,
        usernameLength: USERNAME?.length || 0,
        passwordLength: PASSWORD?.length || 0
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
    
    // Prepare the exact payload as documented
    const authPayload = {
      secret_key: SECRET_KEY,
      username: USERNAME,
      password: PASSWORD
    };
    
    console.log('[Credential Test] Auth payload structure:', {
      hasSecretKey: !!authPayload.secret_key,
      hasUsername: !!authPayload.username,
      hasPassword: !!authPayload.password,
      secretKeyLength: authPayload.secret_key?.length,
      usernameLength: authPayload.username?.length,
      passwordLength: authPayload.password?.length
    });
    
    // Test authentication with VIN Data API
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN-App/1.0'
      },
      body: JSON.stringify(authPayload)
    });

    console.log(`[Credential Test] Token response status: ${tokenResponse.status}`);
    console.log(`[Credential Test] Token response headers:`, Object.fromEntries(tokenResponse.headers.entries()));

    // Get the raw response text for debugging
    const responseText = await tokenResponse.text();
    console.log(`[Credential Test] Raw response:`, responseText);

    if (!tokenResponse.ok) {
      let errorMessage = 'Authentication failed';
      let errorData = null;
      
      try {
        errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.log('[Credential Test] Could not parse error response as JSON');
        errorMessage = `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`;
      }
      
      console.error(`[Credential Test] Authentication failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: responseText,
        errorData
      });
      
      // Provide specific error messages based on status code
      if (tokenResponse.status === 401) {
        errorMessage = 'Invalid credentials. Please check your secret key, username, and password.';
      } else if (tokenResponse.status === 403) {
        errorMessage = 'Access forbidden. Your account may not have permission to access the API.';
      } else if (tokenResponse.status === 400) {
        errorMessage = 'Bad request. Please check that all credentials are provided in the correct format.';
      } else if (tokenResponse.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: `Authentication failed: ${tokenResponse.status}`,
        message: errorMessage,
        debug: {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          response: responseText,
          requestPayload: {
            hasSecretKey: !!authPayload.secret_key,
            hasUsername: !!authPayload.username,
            hasPassword: !!authPayload.password
          }
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
      console.error('[Credential Test] Failed to parse response as JSON:', responseText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid response format',
        message: 'Received invalid response from authentication service',
        debug: {
          response: responseText
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('[Credential Test] Authentication successful');
    console.log('[Credential Test] Token data:', {
      hasToken: !!tokenData.token,
      tokenType: typeof tokenData.token,
      expiresIn: tokenData.expires_in
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'VIN Data API credentials are valid and working correctly!',
      details: {
        tokenReceived: !!tokenData.token,
        expiresIn: tokenData.expires_in,
        authenticationSuccessful: true
      }
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
      message: error instanceof Error ? error.message : 'Failed to connect to VIN Data API',
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