# 🔗 QR Code Generator

![QR Generator](https://img.shields.io/badge/QR-Generator-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-5.1.0-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20Playwright-green)
![Code Quality](https://img.shields.io/badge/Code%20Quality-ESLint%20%2B%20Prettier-blue)

A modern, robust, and production-ready QR code generator with an intuitive web interface. Generate QR codes in multiple formats with advanced customization options, automatic session management, and guaranteed code quality.

## ✨ Features

### 🎯 Core Functionality

- **Multiple output formats**: PNG, JPG, SVG, Base64
- **Advanced customization**: Colors, sizes, margins, and error correction levels
- **Custom titles**: Add titles with customizable fonts and positions (top/bottom)
- **Advanced image composition**: Sophisticated composition system using Canvas and SVG
- **Real-time generation**: Instant preview without page reload
- **Direct download**: Save QR codes in native format or as images

### 🛡️ Production Features

- **Automatic session management**: Auto-initialization based on client URL
- **Robust validation**: Validation middleware with graceful error handling
- **Asset optimization**: Optimized favicon and multiple icon formats
- **Complete testing**: Coverage with unit tests (Vitest) and E2E (Playwright)
- **Code quality**: ESLint + Prettier with automatic pre-commit hooks
- **Tab configuration**: Consistent code style with tab-based indentation

### 🔧 Technical Architecture

- **Complete REST API**: Single `/generate-qr` endpoint with full validation
- **Modern interface**: Responsive UI with error handling and loading states
- **Modular architecture**: Clear separation between generators, composers, and handlers
- **Scalability**: Design ready for multiple formats and future extensions

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/qr_gen.git
    cd qr_gen
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the server**

    ```bash
    npm start
    ```

4. **Open your browser**
    ```
    http://localhost:3000
    ```

### Development

To run in development mode with automatic reload:

```bash
npm run dev
```

### Docker Deployment

#### Using Docker

1. **Build the Docker image**

    ```bash
    docker build -t qr-generator .
    ```

2. **Run the container**

    ```bash
    docker run -p 3000:3000 qr-generator
    ```

#### Using Docker Compose

1. **Start the application**

    ```bash
    docker-compose up -d
    ```

2. **Stop the application**

    ```bash
    docker-compose down
    ```

The Docker setup includes:

- Optimized Alpine Linux base image
- All required system dependencies for Canvas and SVG processing
- Non-root user for security
- Health checks for container monitoring
- Production-ready configuration

## 🎨 Usage

### Web Interface

1. Access `http://localhost:3000`
2. Enter the text or URL to generate the QR code
3. Select the desired format (PNG, JPG, SVG, Base64)
4. Customize advanced options according to your needs:
    - QR code size
    - Custom colors
    - Error correction level
    - Titles and styles
5. Click "Generate QR Code"
6. Download or copy the result

### REST API

Generate QR codes programmatically using the REST API:

#### Main Endpoint

```http
POST /generate-qr
Content-Type: application/json
```

#### API Parameters

| Parameter         | Type   | Description                                   | Required | Default value |
| ----------------- | ------ | --------------------------------------------- | -------- | ------------- |
| `text`            | string | Text or URL to encode                         | ✅       | -             |
| `format`          | string | Output format (`png`, `jpg`, `svg`, `base64`) | ❌       | `png`         |
| `size`            | number | Size in pixels                                | ❌       | `256`         |
| `errorLevel`      | string | Correction level (`L`, `M`, `Q`, `H`)         | ❌       | `M`           |
| `margin`          | number | Margin around the QR code                     | ❌       | `4`           |
| `darkColor`       | string | Color of dark modules                         | ❌       | `#000000`     |
| `lightColor`      | string | Color of light modules                        | ❌       | `#FFFFFF`     |
| `quality`         | number | Quality for JPG (0.1-1.0)                     | ❌       | `0.92`        |
| `title`           | string | Custom title                                  | ❌       | `null`        |
| `titlePosition`   | string | Title position (`top`, `bottom`)              | ❌       | `bottom`      |
| `titleSize`       | number | Title size in pixels                          | ❌       | `24`          |
| `titleColor`      | string | Title color                                   | ❌       | `#333333`     |
| `titleFont`       | string | Title font                                    | ❌       | `Arial`       |
| `backgroundColor` | string | Image background color                        | ❌       | `#FFFFFF`     |
| `imagePadding`    | number | Internal spacing                              | ❌       | `20`          |

#### Request Example

```javascript
const response = await fetch('/generate-qr', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		text: 'https://github.com',
		format: 'png',
		size: 300,
		errorLevel: 'M',
		title: 'My QR Code',
		titlePosition: 'bottom',
		titleColor: '#2563eb',
		darkColor: '#1f2937',
		lightColor: '#f8fafc'
	})
});

const result = await response.json();
console.log(result.data); // Data URL of the generated QR code
```

#### API Response

```json
{
	"success": true,
	"data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
	"format": "png",
	"options": {
		"size": 300,
		"errorLevel": "M",
		"margin": 4,
		"darkColor": "#1f2937",
		"lightColor": "#f8fafc",
		"quality": 0.92,
		"title": "My QR Code",
		"titlePosition": "bottom",
		"titleSize": 24,
		"titleColor": "#2563eb",
		"titleFont": "Arial",
		"backgroundColor": "#FFFFFF",
		"imagePadding": 20
	}
}
```

## 🧪 Testing

### Run Unit Tests

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

### Run E2E Tests

```bash
npm run test:e2e       # End-to-end tests
npm run test:e2e:ui    # With visual interface
```

## 🛠️ Development

### Available Scripts

```bash
# Server
npm run dev          # Development server with automatic reload (--watch)
npm start            # Production server

# Testing
npm test             # Unit tests in watch mode
npm run test:run     # Unit tests single execution
npm run test:e2e     # E2E tests with Playwright
npm run test:e2e:ui  # E2E tests with visual interface

# Code quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format code with Prettier
npm run format:check # Check formatting without modifying
npm run code:check   # Lint + format check (pre-commit)
npm run code:fix     # Lint + automatic complete formatting
```

### Project Structure

```text
qr_gen/
├── public/                 # Frontend static files
│   ├── index.html         # Main interface with optimized favicon
│   ├── script.js          # Client logic and state management
│   ├── formatHandlers.js  # Format-specific handlers
│   ├── styles.css         # Responsive CSS styles
│   ├── favicon.ico        # Optimized favicon for browsers
│   └── favicon-optimized.png # PNG favicon for compatibility
├── tests/                 # Complete testing suite
│   ├── *.test.js         # Unit tests (Vitest)
│   └── e2e/              # End-to-end tests (Playwright)
├── .husky/               # Git hooks for code quality
│   └── pre-commit        # Pre-commit hook with lint and format
├── server.js             # Express server with session management
├── qrGenerators.js       # QR generators by format
├── imageComposer.js      # Advanced image composition with Canvas/SVG
├── package.json          # Dependencies and development scripts
├── vitest.config.js      # Unit test configuration
├── playwright.config.js  # E2E test configuration
├── eslint.config.js      # ESLint configuration with tabs
├── .prettierrc           # Prettier configuration with tabs
├── .prettierignore       # Files ignored by Prettier
├── .gitignore           # Files ignored by Git
├── Dockerfile           # Container configuration
├── .dockerignore        # Docker build context exclusions
├── docker-compose.yml   # Docker Compose configuration
└── CLAUDE.md            # Instructions for Claude Code
```

### Technologies Used

#### Core Stack

- **Runtime**: Node.js 18+ with ES Modules
- **Backend**: Express.js 5.1.0 with express-session
- **QR Generation**: qrcode library with multi-format support
- **Image Processing**: node-canvas (PNG/JPG), JSDOM (SVG)
- **Frontend**: Vanilla JavaScript ES6+, CSS3 with responsive design

#### Development and Quality

- **Testing**: Vitest (unit) + Playwright (E2E) with complete coverage
- **Code Quality**: ESLint 9+ + Prettier with unified configuration
- **Git Hooks**: Husky for pre-commit with automatic validation
- **Package Manager**: npm with optimized dependencies

#### Advanced Features

- **Session Management**: express-session with automatic initialization
- **Favicon Optimization**: Optimized PNG to ICO conversion
- **SVG Processing**: DOM manipulation for vector composition
- **Canvas Composition**: Complex image generation with titles

#### Deployment

- **Docker**: Multi-stage Alpine-based container with system dependencies
- **Docker Compose**: Production-ready orchestration configuration
- **Health Checks**: Container monitoring and automatic restart
- **Security**: Non-root user execution and optimized image layers

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- **Code style**: Follow ESLint + Prettier configuration (tabs, not spaces)
- **Testing**: Write unit and E2E tests for new features
- **Commits**: Pre-commit hooks automatically run `npm run code:check`
- **Documentation**: Update README.md and CLAUDE.md for significant changes
- **Architecture**: Maintain modular separation between generators, composers, and handlers
- **Compatibility**: Ensure it works on Node.js 18+ and modern browsers

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🔧 Troubleshooting

### Common Issues

**Canvas installation error**

```bash
# On Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# On macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Port already in use**

```bash
# Change port in environment variables
PORT=3001 npm start
```

**E2E tests fail**

```bash
# Install Playwright browsers
npx playwright install
```

## 📊 Technical Features

- **Supported formats**: PNG, JPG, SVG, Base64
- **Correction levels**: L (~7%), M (~15%), Q (~25%), H (~30%)
- **Sizes**: 100px - 600px
- **Compatibility**: Modern browsers (ES6+)
- **Performance**: Real-time generation
- **Scalability**: Modular architecture

---

⭐ If you find this project useful, consider giving it a star on GitHub!

📫 **Contact**: [joseb.twelve@gmail.com](mailto:joseb.twelve@gmail.com)
🐛 **Report Bugs**: [GitHub Issues](https://github.com/black-redoc/qrgen/issues)
💡 **Request Features**: [GitHub Discussions](https://github.com/black-redoc/qrgen/discussions)
