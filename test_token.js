const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18zQlJ2QlJLUVM3cDVRYTVHNDZqdE9iNjBtcHkiLCJ0eXAiOiJKV1QiLCJvaWF0IjoxNzg5NDcwMDA2LCJjYXQiOiJjbF9CN2Q0UEQxMTFBQUEifQ.eyJhdWQiOiJjb252ZXgiLCJhenAiOiJodHRwczovL3d3dy53b3JsZG1vbml0b3IuYXBwIiwiZXhwIjoxNzg5NDcwMzc0LCJmdmEiOlsyNjQ2LC0xXSwiaWF0IjoxNzg5NDcwMzE0LCJpc3MiOiJodHRwczovL2NsZXJrLndvcmxkbW9uaXRvci5hcHAiLCJuYmYiOjE3ODk0NzAzMDQsInNpZCI6InNlc3NfM0pISUxEMnRpTVZPbjM2d1FzVTg2eDF4WkUxIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8zSkhJTDl4TEI1MEtlODd5cDd6eG9LSlB4c2MiLCJ2IjoyfQ.Ye4Md_8LJSTlb-9QoWCsjbmmvB0o_14SWrCXiBHDgUju5YzuB5bWMAclVWn1bUpFuyfrHe4v-TRblQSrsP_MAf4MInvWaGlV9P4lE4D8Pms560XPVyoNaJf4ObReYANCaRsn0m-aOgSvnziQZ-qTCMqR18uGp95cFV1oBKQ4e5lAa6eLrOLWJoIkJeBRofj_21YeCMWA4YvSrFaDwxVPEaIVhNcBhc8HR1QPzplWgkYb_4bAYX_o4NTHSAYgzzsrHQovHyQk1hhgK2QoGzZEQw-YlILiE_l1VlaAIejS5h6grrMRrX9mpce8E2D5di_aBkSFP2Jssz2zU0SGg-OkEg';

async function testToken() {
  console.log('Testing WorldMonitor API with the provided production token...');
  try {
    const response = await fetch('https://api.worldmonitor.app/api/latest-brief', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.worldmonitor.app'
      }
    });
    
    console.log(`\nStatus Code: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    if (response.ok) {
      console.log('\nSuccess! The token works and bypassed all security gates.');
      console.log('\nResponse Data preview:');
      console.log(text.substring(0, 500) + '...');
    } else {
      console.log('\nFailed. Response body:');
      console.log(text);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testToken();
