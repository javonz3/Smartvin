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
    expectedPassword: 'Smooth1one.23',
    passwordMatches: PASSWORD === 'Smooth1one.23',
    containsPeriod: PASSWORD ? PASSWORD.includes('.') : false,
    containsHashtag: PASSWORD ? PASSWORD.includes('#') : false,
    containsSpecialChars: PASSWORD ? /[^a-zA-Z0-9]/.test(PASSWORD) : false,
    actualPassword: PASSWORD // TEMPORARY: For debugging only
  });
  
  // Check if all credentials are present
  if (!SECRET_KEY || !USERNAME || !PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Missing credentials in environment variables',
      debug: {
        hasSecretKey: !!SECRET_KEY,
        hasUsername: !!USERNAME,
        hasPassword: !!PASSWORD,
        note: 'Please check your .env file'
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  
  // Test the actual authentication payload
  const authPayload = {
    secret_key: SECRET_KEY.trim(),
    username: USERNAME.trim(),
    password: PASSWORD.trim()
  };
  
  console.log('[Test Credentials] Auth payload structure:', {
    secret_key_length: authPayload.secret_key?.length,
    username_length: authPayload.username?.length,
    password_length: authPayload.password?.length,
    password_preview: authPayload.password ? `${authPayload.password.substring(0, 8)}...` : 'MISSING'
  });
  
  // Test JSON stringification
  const jsonPayload = JSON.stringify(authPayload);
  console.log('[Test Credentials] JSON payload preview:', jsonPayload.substring(0, 100) + '...');
  console.log('[Test Credentials] JSON contains period:', jsonPayload.includes('.'));
  
  // Test actual API call
  try {
    console.log('[Test Credentials] Testing authentication with VIN Data API...');
    
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
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 200)
    });
    
    let responseData = null;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('[Test Credentials] Response is not valid JSON');
    }
    
    const isSuccess = tokenResponse.ok && responseData?.token;
    
    return new Response(JSON.stringify({
      success: isSuccess,
      message: isSuccess 
        ? '✅ Credentials are valid! Authentication successful.' 
        : `❌ Authentication failed: ${responseData?.message || responseText || 'Unknown error'}`,
      debug: {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        hasToken: !!responseData?.token,
        tokenType: responseData?.token ? typeof responseData.token : 'none',
        expiresIn: responseData?.expires_in,
        credentialsUsed: {
          secretKeyLength: SECRET_KEY.length,
          usernameLength: USERNAME.length,
          passwordLength: PASSWORD.length,
          passwordCorrect: PASSWORD === 'Smooth1one.23',
          passwordActual: PASSWORD // TEMPORARY: Remove in production
        },
        rawResponse: responseText.substring(0, 500)
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('[Test Credentials] Network Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '❌ Network error during authentication test',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error?.constructor?.name,
        credentialsPresent: {
          hasSecretKey: !!SECRET_KEY,
          hasUsername: !!USERNAME,
          hasPassword: !!PASSWORD,
          passwordLength: PASSWORD?.length || 0
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