#!/bin/bash

# QR Generator Docker Build Script
# This script builds and optionally runs the QR Generator Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="qr-generator"
TAG="${1:-latest}"
CONTAINER_NAME="qr-gen-app"
PORT="${2:-3000}"

echo -e "${BLUE}🔗 QR Generator Docker Build Script${NC}"
echo -e "${BLUE}=====================================${NC}"

# Build the Docker image
echo -e "\n${YELLOW}📦 Building Docker image: ${IMAGE_NAME}:${TAG}${NC}"
docker build -t "${IMAGE_NAME}:${TAG}" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

# Ask if user wants to run the container
echo -e "\n${YELLOW}🚀 Do you want to run the container? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Stop and remove existing container if it exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "${CONTAINER_NAME}"; then
        echo -e "${YELLOW}🛑 Stopping and removing existing container...${NC}"
        docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    fi
    
    # Run the new container
    echo -e "${YELLOW}🏃‍♂️ Running container on port ${PORT}...${NC}"
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:3000" \
        --restart unless-stopped \
        "${IMAGE_NAME}:${TAG}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Container is running!${NC}"
        echo -e "${GREEN}🌐 Access the application at: http://localhost:${PORT}${NC}"
        echo -e "${BLUE}📊 Container logs: docker logs ${CONTAINER_NAME}${NC}"
        echo -e "${BLUE}🛑 Stop container: docker stop ${CONTAINER_NAME}${NC}"
    else
        echo -e "${RED}❌ Failed to run container${NC}"
        exit 1
    fi
fi

echo -e "\n${GREEN}🎉 Build complete!${NC}"