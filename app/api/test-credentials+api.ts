export async function GET(request: Request) {
  console.log('[Test Credentials] Checking environment variables...');
  
  const SECRET_KEY = process.env.EXPO_PUBLIC_VDP_API_KEY;
  const USERNAME = process.env.EXPO_PUBLIC_VDP_USERNAME;
  const PASSWORD = process.env.EXPO_PUBLIC_VDP_PASSWORD;
  
  // Log detailed information about the password
  console.log('[Test Credentials] Password analysis:', {
    hasPassword: !!PASSWORD,
    passwordLength: PASSWORD?.length || 0,
    passwordPreview: PASSWORD ? `${PASSWORD.substring(0, 8)}...` : 'MISSING',
    passwordFull: PASSWORD, // TEMPORARY: Full password for debugging
    containsHashtag: PASSWORD ? PASSWORD.includes('#') : false,
    containsSpecialChars: PASSWORD ? /[^a-zA-Z0-9]/.test(PASSWORD) : false,
    charCodes: PASSWORD ? Array.from(PASSWORD).map(char => `${char}(${char.charCodeAt(0)})`).join(' ') : 'N/A'
  });
  
  // Test the actual authentication payload
  const authPayload = {
    secret_key: SECRET_KEY?.trim(),
    username: USERNAME?.trim(),
    password: PASSWORD?.trim()
  };
  
  console.log('[Test Credentials] Auth payload:', {
    secret_key: authPayload.secret_key ? `${authPayload.secret_key.substring(0, 8)}...` : 'MISSING',
    username: authPayload.username || 'MISSING',
    password: authPayload.password || 'MISSING', // TEMPORARY: Full password for debugging
    passwordInPayload: authPayload.password?.includes('#') ? 'Contains #' : 'No # found'
  });
  
  // Test JSON stringification
  const jsonPayload = JSON.stringify(authPayload);
  console.log('[Test Credentials] JSON payload:', jsonPayload);
  console.log('[Test Credentials] JSON contains hashtag:', jsonPayload.includes('#'));
  
  // Test actual API call
  try {
    console.log('[Test Credentials] Testing actual API call...');
    
    const tokenResponse = await fetch('https://api.vindata.com/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartVIN-Test/1.0'
      },
      body: jsonPayload
    });
    
    const responseText = await tokenResponse.text();
    console.log('[Test Credentials] API Response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      response: responseText
    });
    
    return new Response(JSON.stringify({
      success: tokenResponse.ok,
      message: tokenResponse.ok ? 'Credentials are valid!' : 'Authentication failed',
      debug: {
        status: tokenResponse.status,
        response: responseText,
        credentialsCheck: {
          hasSecretKey: !!SECRET_KEY,
          hasUsername: !!USERNAME,
          hasPassword: !!PASSWORD,
          passwordLength: PASSWORD?.length || 0,
          passwordContainsHashtag: PASSWORD?.includes('#') || false,
          passwordPreview: PASSWORD ? `${PASSWORD.substring(0, 8)}...` : 'MISSING',
          jsonPayloadContainsHashtag: jsonPayload.includes('#')
        }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('[Test Credentials] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Network error during test',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        credentialsCheck: {
          hasSecretKey: !!SECRET_KEY,
          hasUsername: !!USERNAME,
          hasPassword: !!PASSWORD,
          passwordLength: PASSWORD?.length || 0,
          passwordContainsHashtag: PASSWORD?.includes('#') || false,
          passwordPreview: PASSWORD ? `${PASSWORD.substring(0, 8)}...` : 'MISSING'
        }
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