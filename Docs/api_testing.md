# API Testing Guide

This document contains the keys and commands you need to test the World Monitor app.

## 1. Login Keys (Credentials)
To talk to the app's data (the API), you need these "keys" to prove who you are:

- **Developer Key:** `wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3`
  - *Use this in the header as:* `X-API-Key`
  
- **User Token (JWT):** A long string used to verify a logged-in user.
  - *Use this in the header as:* `Authorization: Bearer <TOKEN>`

---

## 2. Test Commands (Copy and Paste)

You can run these commands in your terminal to see if the app is working correctly on your computer (Port 3001).

### Test Climate Data (CO2 Levels)
```bash
curl -X GET "http://localhost:3001/api/climate/v1/get-co2-monitoring" \
  -H "X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
```
*Expected Result: You will get a list of CO2 levels and climate numbers.*

### Test AI Analyst (Ask a Question)
```bash
curl -X POST "http://localhost:3001/api/ask.ts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN_HERE>" \
  -d '{
    "query": "What are current active military flight vectors?",
    "variant": "full"
  }'
```

### Test Military Flights
```bash
curl -X GET "http://localhost:3001/api/military/v1/list-military-flights" \
  -H "X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
```

### Test Theater Posture
```bash
curl -X GET "http://localhost:3001/api/military/v1/get-theater-posture" \
  -H "X-API-Key: wm_31dcd74f349ac77b44f9e91c951af9b5151cc4a3"
```
