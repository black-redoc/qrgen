import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { randomBytes } from 'node:crypto';
import qrGenerators from './qrGenerators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Generate session secret
const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(64).toString('hex');

// Session configuration
app.use(cookieParser());
app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: false, // Set to true in production with HTTPS
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000 // 24 hours
		},
		name: 'qr_session'
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session validation middleware
const validateSession = (req, res, next) => {
	// Initialize session if it doesn't exist
	if (!req.session || !req.session.initialized) {
		req.session.initialized = true;
		req.session.clientId = randomBytes(16).toString('hex');
		req.session.createdAt = new Date().toISOString();
	}

	// Optional: Check session expiration
	if (req.session.createdAt) {
		const sessionAge = Date.now() - new Date(req.session.createdAt).getTime();
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours

		if (sessionAge > maxAge) {
			req.session.destroy();
			return res.status(401).json({
				error: 'Sesión expirada. Por favor, recarga la página.'
			});
		}
	}

	next();
};

app.get('/', (req, res) => {
	// Initialize session for web interface access
	if (!req.session.initialized) {
		req.session.initialized = true;
		req.session.clientId = randomBytes(16).toString('hex');
		req.session.createdAt = new Date().toISOString();
	}

	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-qr', validateSession, async (req, res) => {
	try {
		const {
			text,
			format,
			size = 256,
			errorLevel = 'M',
			margin = 4,
			darkColor = '#000000',
			lightColor = '#FFFFFF',
			quality = 0.92,
			// Personalization options
			title,
			titlePosition = 'bottom',
			titleSize = 24,
			titleColor = '#333333',
			titleFont = 'Arial',
			backgroundColor = '#FFFFFF',
			imagePadding = 20
		} = req.body;

		if (!text) {
			return res.status(400).json({ error: 'Text is required' });
		}

		const options = {
			errorCorrectionLevel: errorLevel,
			type: 'image/png',
			quality: quality,
			margin: margin,
			width: size,
			color: {
				dark: darkColor,
				light: lightColor
			}
		};

		// Composition options for title and styling
		const compositionOptions = title
			? {
					title,
					titlePosition,
					titleSize,
					titleColor,
					titleFont,
					backgroundColor,
					imagePadding
				}
			: null;

		const generator = qrGenerators[format] || qrGenerators.default;
		const result = await generator(text, options, compositionOptions);

		res.json({
			success: true,
			data: result,
			format: format || 'png',
			options: {
				size,
				errorLevel,
				margin,
				darkColor,
				lightColor,
				quality,
				...(compositionOptions && {
					title,
					titlePosition,
					titleSize,
					titleColor,
					titleFont,
					backgroundColor,
					imagePadding
				})
			}
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error generating QR code:', error.message);
		// eslint-disable-next-line no-console
		console.error('Stack trace:', error.stack);
		res.status(500).json({ error: `Failed to generate QR code: ${error.message}` });
	}
});

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`QR Code Generator running on http://localhost:${PORT}`);
});
