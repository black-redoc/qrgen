# Use Node.js 24 Alpine for smaller image size
FROM node:24
# Set working directory
WORKDIR /app

# Install system dependencies for node-canvas, JSDOM, and image processing
RUN apt update && apt install -y \
libcairo2-dev \
libpango1.0-dev \
libjpeg62-turbo-dev \
libgif-dev \
librsvg2-dev \
# Build dependencies
# build-base \
# cairo-dev \
# jpeg-dev \
# pango-dev \
# musl-dev \
# giflib-dev \
# pixman-dev \
# pangomm-dev \
# libjpeg-turbo-dev \
# freetype-dev \
# # Runtime dependencies
# cairo \
# jpeg \
# pango \
# musl \
# giflib \
# pixman \
# ttf-freefont \
# Additional dependencies for SVG and font rendering
fontconfig \
&& fc-cache -f \
# Clean up
&& rm -rf /var/cache/apk/*

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install Node.js dependencies
ENV HUSKY=0
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .


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
