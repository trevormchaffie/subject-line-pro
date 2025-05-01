# Subject Line Pro API Testing

This document provides instructions for testing the Subject Line Pro API endpoints.

## Prerequisites

- Node.js installed
- Backend server running (`npm run dev` or `npm start` from the `/backend` directory)

## Quick Test

The quickest way to test the API is using the provided shell script:

```bash
# Make the script executable
chmod +x quick-test.sh

# Run the test script
./quick-test.sh
```

This script will sequentially test all endpoints and display the results.

## Manual Testing

You can also test the endpoints manually using cURL or Postman.

### 1. Submit Lead (Public)

**URL:** http://localhost:3000/api/leads  
**Method:** POST  
**Body:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "businessType": "E-commerce",
  "subjectLine": "Special 50% off sale ending soon",
  "analysisResults": {
    "score": 85,
    "feedback": "Good subject line with clear incentive",
    "powerWords": ["special", "off", "ending soon"],
    "problems": []
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "businessType": "E-commerce",
    "subjectLine": "Special 50% off sale ending soon",
    "analysisResults": {
      "score": 85,
      "feedback": "Good subject line with clear incentive",
      "powerWords": ["special", "off", "ending soon"],
      "problems": []
    }
  }'
```

### 2. Admin Login

**URL:** http://localhost:3000/api/auth/login  
**Method:** POST  
**Body:**
```json
{
  "username": "mr1018",
  "password": "Maya03112005"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mr1018",
    "password": "Maya03112005"
  }'
```

### 3. Get Leads with Filtering (Admin)

**URL:** http://localhost:3000/api/leads/admin  
**Method:** GET  
**Auth:** Bearer Token  
**Query Parameters:** page, limit, sortBy, sortOrder, status, businessType, startDate, endDate, search

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/leads/admin?page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Lead by ID (Admin)

**URL:** http://localhost:3000/api/leads/admin/{leadId}  
**Method:** GET  
**Auth:** Bearer Token  

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/leads/admin/LEAD_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update Lead Status (Admin)

**URL:** http://localhost:3000/api/leads/admin/{leadId}  
**Method:** PUT  
**Auth:** Bearer Token  
**Body:**
```json
{
  "status": "Contacted"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/leads/admin/LEAD_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "Contacted"
  }'
```

### 6. Add Note to Lead (Admin)

**URL:** http://localhost:3000/api/leads/admin/notes  
**Method:** POST  
**Auth:** Bearer Token  
**Body:**
```json
{
  "leadId": "LEAD_ID_HERE",
  "note": "This is a test note"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/leads/admin/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "leadId": "LEAD_ID_HERE",
    "note": "This is a test note"
  }'
```

### 7. Export Leads (Admin)

**URL:** http://localhost:3000/api/leads/admin/export  
**Method:** GET  
**Auth:** Bearer Token  
**Query Parameters:** format (json, csv)

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/leads/admin/export?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using Node.js Test Scripts

Alternative Node.js test scripts are also available:

1. **Simple Public Lead Test:**
   ```
   node simple-test.js
   ```

2. **Admin Authentication Test:**
   ```
   node auth-test.js
   ```

3. **Full API Test:**
   ```
   node test-lead-api.js
   ```

## Troubleshooting

If you're having issues with the tests:

1. Make sure the backend server is running 
2. Check for CORS issues if testing from a frontend
3. Verify that all required fields are included in requests
4. Confirm the admin credentials are correct
5. Ensure the JWT token is being properly included in the Authorization header

## API Error Codes

Common error codes returned by the API:

- 400: Bad Request (missing required fields)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error