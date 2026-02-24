#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service URL
SERVICE_URL="${1:-http://localhost:9200}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Sizer Service Local Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Service URL: ${YELLOW}${SERVICE_URL}${NC}"
echo ""

# Check if service is running
echo -e "${BLUE}[1/5]${NC} Checking service health..."
HEALTH_RESPONSE=$(curl -s "${SERVICE_URL}/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Service is running"
    echo -e "  Response: ${HEALTH_RESPONSE}"
else
    echo -e "${RED}✗${NC} Service is not responding"
    echo -e "${RED}Please start the service first:${NC}"
    echo -e "  cd service && PORT=9200 npm start"
    echo -e "  OR"
    echo -e "  docker run -p 9200:9200 sizer-service:1.0.0"
    exit 1
fi
echo ""

# Function to run a test
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${BLUE}Testing:${NC} ${test_name}"
    echo -e "  File: ${test_file}"
    
    RESPONSE=$(curl -s -X POST "${SERVICE_URL}/api/v1/size/custom" \
        -H "Content-Type: application/json" \
        -d @"${test_file}")
    
    if [ $? -eq 0 ]; then
        SUCCESS=$(echo "${RESPONSE}" | jq -r '.success' 2>/dev/null)
        if [ "${SUCCESS}" == "true" ]; then
            echo -e "${GREEN}✓${NC} Test passed"
            NODE_COUNT=$(echo "${RESPONSE}" | jq -r '.data.nodeCount')
            ZONES=$(echo "${RESPONSE}" | jq -r '.data.zones')
            TOTAL_CPU=$(echo "${RESPONSE}" | jq -r '.data.totalCPU')
            TOTAL_MEMORY=$(echo "${RESPONSE}" | jq -r '.data.totalMemory')
            echo -e "  ${GREEN}Result:${NC}"
            echo -e "    • Nodes: ${NODE_COUNT}"
            echo -e "    • Zones: ${ZONES}"
            echo -e "    • Total CPU: ${TOTAL_CPU}"
            echo -e "    • Total Memory: ${TOTAL_MEMORY} GB"
        else
            echo -e "${RED}✗${NC} Test failed"
            ERROR=$(echo "${RESPONSE}" | jq -r '.error')
            echo -e "  ${RED}Error:${NC} ${ERROR}"
        fi
    else
        echo -e "${RED}✗${NC} Request failed"
    fi
    echo ""
}

# Run all tests
echo -e "${BLUE}[2/5]${NC} Test: Performance Profile (1:1)"
run_test "02a-performance.json" "50 VMs with no over-commitment"

echo -e "${BLUE}[3/5]${NC} Test: Balanced Profile (1:2)"
run_test "02b-balanced.json" "50 VMs with conservative over-commitment"

echo -e "${BLUE}[4/5]${NC} Test: Standard Profile (1:4)"
run_test "02c-standard.json" "50 VMs with standard over-commitment"

echo -e "${BLUE}[5/5]${NC} Test: High Density Profile (1:6)"
run_test "02d-high-density.json" "50 VMs with maximum over-commitment"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   Tests Complete!${NC}"
echo -e "${BLUE}========================================${NC}"

