#!/bin/bash

# Variables
API_URL="http://localhost:3000/api"
ADMIN_USERNAME="mr1018"
ADMIN_PASSWORD="Maya03112005"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Subject Line Pro API Test Script =====${NC}"
echo "This script will test all the API endpoints for the Subject Line Pro application."
echo ""

# Step 1: Test server health
echo -e "${YELLOW}1. Testing server health...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if [[ $HEALTH_RESPONSE == *"UP"* ]]; then
  echo -e "${GREEN}✓ Server is up and running${NC}"
else
  echo -e "${RED}✗ Server is not responding properly${NC}"
  echo "Response: $HEALTH_RESPONSE"
  echo -e "${RED}Please make sure the server is running with: npm start${NC}"
  exit 1
fi

# Step 2: Submit a lead (public endpoint)
echo -e "\n${YELLOW}2. Testing Lead Submission (Public)...${NC}"
LEAD_DATA='{
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

LEAD_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$LEAD_DATA" $API_URL/leads)
if [[ $LEAD_RESPONSE == *"success"* ]]; then
  echo -e "${GREEN}✓ Lead submitted successfully${NC}"
  LEAD_ID=$(echo $LEAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "Lead ID: $LEAD_ID"
else
  echo -e "${RED}✗ Failed to submit lead${NC}"
  echo "Response: $LEAD_RESPONSE"
  LEAD_ID=""
fi

# Step 3: Admin login
echo -e "\n${YELLOW}3. Testing Admin Login...${NC}"
LOGIN_DATA="{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}"
AUTH_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" $API_URL/auth/login)

if [[ $AUTH_RESPONSE == *"token"* ]]; then
  echo -e "${GREEN}✓ Admin login successful${NC}"
  TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Token: ${TOKEN:0:10}..." # Show only the first 10 characters
else
  echo -e "${RED}✗ Admin login failed${NC}"
  echo "Response: $AUTH_RESPONSE"
  TOKEN=""
fi

# If we don't have a token, we can't test admin endpoints
if [[ -z "$TOKEN" ]]; then
  echo -e "${RED}Cannot continue testing admin endpoints without a valid token${NC}"
  exit 1
fi

# Step 4: Get Leads (Admin)
echo -e "\n${YELLOW}4. Testing Get Leads with Filtering (Admin)...${NC}"
LEADS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/leads/admin?page=1&limit=10&sortBy=createdAt&sortOrder=desc")

if [[ $LEADS_RESPONSE == *"success"* ]]; then
  echo -e "${GREEN}✓ Successfully retrieved leads${NC}"
  LEADS_COUNT=$(echo $LEADS_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)
  echo "Total leads: $LEADS_COUNT"
else
  echo -e "${RED}✗ Failed to retrieve leads${NC}"
  echo "Response: $LEADS_RESPONSE"
fi

# Step 5: Get Lead by ID (Admin) - only if we have a lead ID
if [[ ! -z "$LEAD_ID" ]]; then
  echo -e "\n${YELLOW}5. Testing Get Lead by ID (Admin)...${NC}"
  LEAD_DETAIL_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/leads/admin/$LEAD_ID")
  
  if [[ $LEAD_DETAIL_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Successfully retrieved lead details${NC}"
  else
    echo -e "${RED}✗ Failed to retrieve lead details${NC}"
    echo "Response: $LEAD_DETAIL_RESPONSE"
  fi
else
  echo -e "\n${YELLOW}5. Skipping Get Lead by ID (Admin) - no lead ID available${NC}"
fi

# Step 6: Update Lead Status (Admin) - only if we have a lead ID
if [[ ! -z "$LEAD_ID" ]]; then
  echo -e "\n${YELLOW}6. Testing Update Lead Status (Admin)...${NC}"
  UPDATE_DATA='{
    "status": "Contacted"
  }'
  
  UPDATE_RESPONSE=$(curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$UPDATE_DATA" "$API_URL/leads/admin/$LEAD_ID")
  
  if [[ $UPDATE_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Successfully updated lead status${NC}"
  else
    echo -e "${RED}✗ Failed to update lead status${NC}"
    echo "Response: $UPDATE_RESPONSE"
  fi
else
  echo -e "\n${YELLOW}6. Skipping Update Lead Status (Admin) - no lead ID available${NC}"
fi

# Step 7: Add Note to Lead (Admin) - only if we have a lead ID
if [[ ! -z "$LEAD_ID" ]]; then
  echo -e "\n${YELLOW}7. Testing Add Note to Lead (Admin)...${NC}"
  NOTE_DATA="{
    \"leadId\": \"$LEAD_ID\",
    \"note\": \"This is a test note from the API test script\"
  }"
  
  NOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$NOTE_DATA" "$API_URL/leads/admin/notes")
  
  if [[ $NOTE_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓ Successfully added note to lead${NC}"
  else
    echo -e "${RED}✗ Failed to add note to lead${NC}"
    echo "Response: $NOTE_RESPONSE"
  fi
else
  echo -e "\n${YELLOW}7. Skipping Add Note to Lead (Admin) - no lead ID available${NC}"
fi

# Step 8: Export Leads (Admin)
echo -e "\n${YELLOW}8. Testing Export Leads (Admin)...${NC}"
EXPORT_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/leads/admin/export?format=json")

if [[ $EXPORT_RESPONSE == *"success"* || $EXPORT_RESPONSE == *"data"* ]]; then
  echo -e "${GREEN}✓ Successfully exported leads${NC}"
  EXPORT_COUNT=$(echo $EXPORT_RESPONSE | grep -o '"data":\[[^]]*\]' | wc -l)
  echo "Exported data length: $EXPORT_COUNT bytes"
else
  echo -e "${RED}✗ Failed to export leads${NC}"
  echo "Response: $EXPORT_RESPONSE"
fi

echo -e "\n${YELLOW}===== Test Summary =====${NC}"
echo "All tests completed. Please check the results above for any failures."