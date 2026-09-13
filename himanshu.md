🔑 Test Credentials & Tokens
1. Developer API Key
Format: wm_<40_hex_characters>
API Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3
Header: X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3

2. Bearer JWT Session Token
Issuer: https://summary-tadpole-5013.clerk.accounts.dev
Claims: { sub: "user_2test123456789", org_id: "org_test123", role: "pro" }
JWT:
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzJ0ZXN0MTIzNDU2Nzg5Iiwib3JnX2lkIjoib3JnX3Rlc3QxMjMiLCJyb2xlIjoicHJvIiwiZW1haWwiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTc4OTMxMzk1NCwiZXhwIjoxNzg5NDAwMzU0LCJpc3MiOiJodHRwczovL3N1bW1hcnktdGFkcG9sZS01MDEzLmNsZXJrLmFjY291bnRzLmRldiJ9.NDNLHjdsD9OuqKu3rQGtKZ6nkTzDjH2dRkVkgEXt_HtmNKYPVuE-VwBeghp8sSZK5fCLnQw-K2QZ7HtlZUy0qRhrJneQMNLQ63FgcI5AYabtntILQA30PuUZEV87O8MpwW-7d1BkBaEfXii43ut7kPln1-W6J-Z6aK8X8ES12SjDSiKlF8iK3Z-duDfcmjePaMdkiJ3WqN8jc6u-D6yRIuMsMrK7JMPbJ4kcdErQkkA_G4CCA_xGywXs0Sbiq0YJQTX_m8-U3eeUm5ClVxlW4WmCekLJJj6Nzf049OUM3JBsQbostbRbNi-eqPg-4zIcnFB0UTaRj7XqlbGih9WNLg
Header: Authorization: Bearer <TOKEN>

🧪 Copy-Pasteable World Monitor API Test Commands (Port 3001)

1. Test Sebuf Climate API (Local Dev Server - Port 3001)
```bash
curl -X GET "http://localhost:3001/api/climate/v1/get-co2-monitoring" \
  -H "X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
```

2. Test AI Analyst API (Edge Function / Ask Endpoint)
```bash
curl -X POST "http://localhost:3001/api/ask.ts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzJ0ZXN0MTIzNDU2Nzg5Iiwib3JnX2lkIjoib3JnX3Rlc3QxMjMiLCJyb2xlIjoicHJvIiwiZW1haWwiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTc4OTMxMzk1NCwiZXhwIjoxNzg5NDAwMzU0LCJpc3MiOiJodHRwczovL3N1bW1hcnktdGFkcG9sZS01MDEzLmNsZXJrLmFjY291bnRzLmRldiJ9.NDNLHjdsD9OuqKu3rQGtKZ6nkTzDjH2dRkVkgEXt_HtmNKYPVuE-VwBeghp8sSZK5fCLnQw-K2QZ7HtlZUy0qRhrJneQMNLQ63FgcI5AYabtntILQA30PuUZEV87O8MpwW-7d1BkBaEfXii43ut7kPln1-W6J-Z6aK8X8ES12SjDSiKlF8iK3Z-duDfcmjePaMdkiJ3WqN8jc6u-D6yRIuMsMrK7JMPbJ4kcdErQkkA_G4CCA_xGywXs0Sbiq0YJQTX_m8-U3eeUm5ClVxlW4WmCekLJJj6Nzf049OUM3JBsQbostbRbNi-eqPg-4zIcnFB0UTaRj7XqlbGih9WNLg" \
  -d '{
    "query": "What are current active military flight vectors?",
    "variant": "full"
  }'
```

3. Test Military Flights API (GET - 200 OK)
```bash
curl -X GET "http://localhost:3001/api/military/v1/list-military-flights" \
  -H "X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
```

4. Test Theater Posture API (GET - 200 OK)
```bash
curl -X GET "http://localhost:3001/api/military/v1/get-theater-posture" \
  -H "X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
```






http://localhost:3001/api/climate/v1/get-co2-monitoring

Response (`200 OK`):
```json
{
  "monitoring": {
    "currentPpm": 426.5,
    "yearAgoPpm": 423.8,
    "annualGrowthRate": 2.7,
    "preIndustrialBaseline": 280,
    "monthlyAverage": 425.9,
    "methanePpb": 1923.5,
    "nitrousOxidePpb": 336.8,
    "measuredAt": "2026-09-13",
    "station": "Mauna Loa Observatory, Hawaii",
    "trend12m": [
      { "month": "Jan", "ppm": 423.5, "anomaly": 2.4 },
      { "month": "Feb", "ppm": 424.1, "anomaly": 2.5 },
      { "month": "Mar", "ppm": 425.2, "anomaly": 2.6 },
      { "month": "Apr", "ppm": 426, "anomaly": 2.7 },
      { "month": "May", "ppm": 426.8, "anomaly": 2.8 },
      { "month": "Jun", "ppm": 426.5, "anomaly": 2.7 },
      { "month": "Jul", "ppm": 425.1, "anomaly": 2.5 },
      { "month": "Aug", "ppm": 423.8, "anomaly": 2.4 },
      { "month": "Sep", "ppm": 422.9, "anomaly": 2.3 },
      { "month": "Oct", "ppm": 423.4, "anomaly": 2.4 },
      { "month": "Nov", "ppm": 424.5, "anomaly": 2.5 },
      { "month": "Dec", "ppm": 425.8, "anomaly": 2.6 }
    ]
  }
}
```