# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Management

- `npm run dev` - Start development server with file watching (--watch mode)
- `npm start` - Start production server
- Server runs on http://localhost:3000 with automatic session management

### Testing

- `npm test` - Run unit tests with Vitest in watch mode
- `npm run test:run` - Run unit tests once (no watch mode)
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run e2e tests with Playwright UI
- Unit tests are in `/tests/` directory
- E2E tests are in `/tests/e2e/` directory
- Server automatically starts for E2E testing

### Code Quality

- `npm run lint` - Run ESLint with tab-based configuration
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier (uses tabs)
- `npm run format:check` - Check code formatting
- `npm run code:check` - Run both lint and format check (used in pre-commit)
- `npm run code:fix` - Fix both lint and format issues
- Pre-commit hooks automatically run code quality checks via Husky

## Architecture Overview

This is a QR code generator web application with the following key components:

### Core Architecture

- **server.js** - Express server with `/generate-qr` endpoint and session management
- **qrGenerators.js** - QR code generation handlers for different formats (PNG, JPG, SVG, base64)
- **imageComposer.js** - Advanced image composition utilities for adding titles and styling
- **public/** - Static frontend files served by Express with optimized favicon

### QR Generation Flow

1. Client accesses `/` endpoint - session is automatically initialized if needed
2. Client sends POST request to `/generate-qr` with text and options
3. Server validates session and input, creates QR generation options
4. Format-specific generator (from qrGenerators.js) creates base QR code
5. If title is specified, imageComposer.js adds text and styling with proper scaling
6. Server returns composed image as base64 data URL

### Image Composition System

- **Canvas-based composition** for raster formats (PNG/JPG) using node-canvas
- **SVG manipulation** for vector format using JSDOM
- **Composition strategies** for different title positions (top/bottom)
- **Format composers** handle format-specific output encoding

### Key Dependencies

- `qrcode` - QR code generation library with multi-format support
- `canvas` - Server-side canvas for image composition (PNG/JPG)
- `jsdom` - DOM manipulation for SVG composition and scaling
- `express` - Web server framework with express-session
- `express-session` - Session management with automatic initialization
- `cookie-parser` - Cookie handling for session persistence

### Testing Structure

- Unit tests cover individual modules (qrGenerators, imageComposer, server)
- E2E tests use Playwright to test full user workflows including session management
- Vitest excludes e2e tests from unit test runs
- Playwright automatically starts server before running e2e tests
- Tests validate session creation, QR generation, and error handling

## Code Style and Quality

### ESLint + Prettier Configuration

- **Indentation**: Uses tabs (not spaces) - configured in both .eslintrc and .prettierrc
- **ESLint**: Version 9+ with modern flat config, includes eslint-config-prettier
- **Prettier**: Configured with tabs, single quotes, and 100-character line width
- **Pre-commit hooks**: Husky runs `npm run code:check` before each commit

### Development Guidelines

- Always use tabs for indentation (consistent across all files)
- Follow functional programming patterns where possible (see imageComposer.js)
- Maintain modular architecture - separate concerns between generators, composers, and handlers
- Write comprehensive tests for new features (both unit and E2E)
- Use meaningful variable names and document complex algorithms

### Session Management

- Sessions are automatically initialized when accessing `/` or `/generate-qr`
- No manual session validation required - middleware handles initialization
- Session data includes clientId and createdAt timestamp
- Sessions persist across requests using express-session with cookie storage

### SVG Handling

- SVG generation includes proper width/height attributes for display
- SVG composition uses JSDOM for DOM manipulation
- Scaling issues are handled with enhanced scale factors (minimum 2x)
- Canvas and SVG composition strategies are separate but consistent

## Docker Configuration

### Container Setup

- **Base Image**: Node.js 18 Alpine for optimal size and security
- **System Dependencies**: All required packages for Canvas, JSDOM, and image processing
- **Security**: Non-root user execution (qrgen:nodejs)
- **Health Checks**: Automatic container monitoring with wget

### Docker Commands

- `npm run docker:build` - Build Docker image with interactive script
- `npm run docker:up` - Start application with Docker Compose
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:logs` - View container logs in real-time
- `./scripts/docker-build.sh [tag] [port]` - Advanced build script with options

### Production Deployment

- Uses Alpine Linux for minimal attack surface
- Includes all Canvas system dependencies (cairo, pango, jpeg, etc.)
- Optimized .dockerignore for faster builds
- Health checks ensure container reliability
- Ready for Kubernetes, Docker Swarm, or standalone deployment
