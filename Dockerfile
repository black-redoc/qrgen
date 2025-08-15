# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for node-canvas, JSDOM, and image processing
RUN apk add --no-cache \
    # Build dependencies
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    # Runtime dependencies
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    ttf-freefont \
    # Additional dependencies for SVG and font rendering
    fontconfig \
    && fc-cache -f \
    # Clean up
    && rm -rf /var/cache/apk/*

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S qrgen -u 1001 -G nodejs

# Change ownership of app directory to nodejs user
RUN chown -R qrgen:nodejs /app
USER qrgen

# Expose the port the app runs on
EXPOSE 3000

# Health check to ensure the container is working
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]