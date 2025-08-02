#!/bin/bash

# API Test Script for InternalFinance
# This script tests the frontend functionality through API calls

API_URL="http://localhost:5001"

echo "🚀 Testing InternalFinance API"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Register users
echo -e "\n📝 Test 1: Registering users..."

# Register User 1
USER1=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyễn Văn An","pin":"1234"}')

if [[ $USER1 == *"token"* ]]; then
  echo -e "${GREEN}✓ User 1 registered successfully${NC}"
  TOKEN1=$(echo $USER1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  # Try login if already exists
  USER1=$(curl -s -X POST $API_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"name":"Nguyễn Văn An","pin":"1234"}')
  TOKEN1=$(echo $USER1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✓ User 1 logged in${NC}"
fi

# Register User 2
USER2=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Trần Thị Bình","pin":"2345"}')

if [[ $USER2 == *"token"* ]]; then
  echo -e "${GREEN}✓ User 2 registered successfully${NC}"
  TOKEN2=$(echo $USER2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  # Try login if already exists
  USER2=$(curl -s -X POST $API_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"name":"Trần Thị Bình","pin":"2345"}')
  TOKEN2=$(echo $USER2 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✓ User 2 logged in${NC}"
fi

# Test 2: Add expenses
echo -e "\n💰 Test 2: Adding expenses..."

# User 1 expenses
curl -s -X POST $API_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"amount":150000,"description":"Phở bò","category":"Ăn uống"}' > /dev/null

curl -s -X POST $API_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"amount":85000,"description":"Cà phê","category":"Ăn uống"}' > /dev/null

curl -s -X POST $API_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"amount":250000,"description":"Grab","category":"Di chuyển"}' > /dev/null

echo -e "${GREEN}✓ Added 3 expenses for User 1${NC}"

# User 2 expenses
curl -s -X POST $API_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"amount":320000,"description":"Siêu thị","category":"Mua sắm"}' > /dev/null

curl -s -X POST $API_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"amount":180000,"description":"Xem phim","category":"Giải trí"}' > /dev/null

echo -e "${GREEN}✓ Added 2 expenses for User 2${NC}"

# Test 3: Get expenses
echo -e "\n📊 Test 3: Retrieving expenses..."

EXPENSES=$(curl -s -X GET $API_URL/api/expenses \
  -H "Authorization: Bearer $TOKEN1")

if [[ $EXPENSES == *"amount"* ]]; then
  echo -e "${GREEN}✓ Successfully retrieved expenses${NC}"
else
  echo -e "${RED}✗ Failed to retrieve expenses${NC}"
fi

# Test 4: Get summary
echo -e "\n📈 Test 4: Getting expense summary..."

SUMMARY=$(curl -s -X GET $API_URL/api/expenses/summary \
  -H "Authorization: Bearer $TOKEN1")

if [[ $SUMMARY == *"total"* ]]; then
  echo -e "${GREEN}✓ Successfully retrieved summary${NC}"
  echo -e "\nSummary data:"
  echo $SUMMARY | python -m json.tool 2>/dev/null || echo $SUMMARY
else
  echo -e "${RED}✗ Failed to retrieve summary${NC}"
fi

echo -e "\n✅ API Testing Complete!"
echo -e "\n📱 Login credentials for frontend:"
echo "   - Nguyễn Văn An: PIN 1234"
echo "   - Trần Thị Bình: PIN 2345"
echo -e "\n🌐 Open http://localhost:3000 to test the frontend"