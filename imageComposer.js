import { createCanvas, loadImage } from 'canvas';
import { JSDOM } from 'jsdom';

/**
 * Pure functions for canvas operations
 */
const canvasUtils = {
	/**
	 * Creates a canvas with specified dimensions and background color
	 * @param {number} width - Canvas width
	 * @param {number} height - Canvas height
	 * @param {string} backgroundColor - Background color
	 * @returns {Object} Canvas and context
	 */
	createCanvas: (width, height, backgroundColor = '#FFFFFF') => {
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');

		// Fill background
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);

		return { canvas, ctx };
	},

	/**
	 * Measures text dimensions for proper positioning
	 * @param {CanvasRenderingContext2D} ctx - Canvas context
	 * @param {string} text - Text to measure
	 * @param {string} font - Font specification
	 * @returns {Object} Text metrics
	 */
	measureText: (ctx, text, font) => {
		ctx.font = font;
		const metrics = ctx.measureText(text);
		return {
			width: metrics.width,
			height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
		};
	},

	/**
	 * Draws text on canvas with specified styling and position
	 * @param {CanvasRenderingContext2D} ctx - Canvas context
	 * @param {string} text - Text to draw
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {Object} style - Text styling options
	 */
	drawText: (ctx, text, x, y, style) => {
		ctx.font = `${style.size}px ${style.font}`;
		ctx.fillStyle = style.color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x, y);
	},

	/**
	 * Draws image on canvas at specified position
	 * @param {CanvasRenderingContext2D} ctx - Canvas context
	 * @param {Image} image - Image to draw
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @param {number} width - Image width
	 * @param {number} height - Image height
	 */
	drawImage: (ctx, image, x, y, width, height) => {
		ctx.drawImage(image, x, y, width, height);
	}
};

/**
 * Composition strategies for different layouts
 */
const compositionStrategies = {
	/**
	 * Title at top, QR code below
	 */
	titleTop: (canvasConfig, qrImage, titleConfig) => {
		const { padding, backgroundColor } = canvasConfig;
		const { text, style } = titleConfig;

		const tempCanvas = createCanvas(100, 100);
		const tempCtx = tempCanvas.getContext('2d');
		const textMetrics = canvasUtils.measureText(tempCtx, text, `${style.size}px ${style.font}`);

		const qrSize = canvasConfig.qrSize;
		const totalWidth = Math.max(qrSize, textMetrics.width) + padding * 2;
		const totalHeight = qrSize + textMetrics.height + padding * 3;

		const { canvas, ctx } = canvasUtils.createCanvas(totalWidth, totalHeight, backgroundColor);

		// Draw title
		const titleX = totalWidth / 2;
		const titleY = padding + textMetrics.height / 2;
		canvasUtils.drawText(ctx, text, titleX, titleY, style);

		// Draw QR code
		const qrX = (totalWidth - qrSize) / 2;
		const qrY = padding + textMetrics.height + padding;
		canvasUtils.drawImage(ctx, qrImage, qrX, qrY, qrSize, qrSize);

		return canvas;
	},

	/**
	 * QR code at top, title at bottom
	 */
	titleBottom: (canvasConfig, qrImage, titleConfig) => {
		const { padding, backgroundColor } = canvasConfig;
		const { text, style } = titleConfig;

		const tempCanvas = createCanvas(100, 100);
		const tempCtx = tempCanvas.getContext('2d');
		const textMetrics = canvasUtils.measureText(tempCtx, text, `${style.size}px ${style.font}`);

		const qrSize = canvasConfig.qrSize;
		const totalWidth = Math.max(qrSize, textMetrics.width) + padding * 2;
		const totalHeight = qrSize + textMetrics.height + padding * 3;

		const { canvas, ctx } = canvasUtils.createCanvas(totalWidth, totalHeight, backgroundColor);

		// Draw QR code
		const qrX = (totalWidth - qrSize) / 2;
		const qrY = padding;
		canvasUtils.drawImage(ctx, qrImage, qrX, qrY, qrSize, qrSize);

		// Draw title
		const titleX = totalWidth / 2;
		const titleY = padding + qrSize + padding + textMetrics.height / 2;
		canvasUtils.drawText(ctx, text, titleX, titleY, style);

		return canvas;
	}
};

/**
 * Image composer factory function
 * @param {Buffer} qrBuffer - QR code image buffer
 * @param {Object} options - Composition options
 * @returns {Promise<Buffer>} Composed image buffer
 */
const createComposedImage = async (qrBuffer, options) => {
	const {
		title,
		titlePosition = 'bottom',
		titleSize = 24,
		titleColor = '#333333',
		titleFont = 'Arial',
		backgroundColor = '#FFFFFF',
		imagePadding = 20,
		qrSize = 256
	} = options;

	// If no title, return original QR
	if (!title || title.trim() === '') {
		return qrBuffer;
	}

	try {
		// Load QR image from buffer
		const qrImage = await loadImage(qrBuffer);

		const canvasConfig = {
			qrSize,
			padding: imagePadding,
			backgroundColor
		};

		const titleConfig = {
			text: title.trim(),
			style: {
				size: titleSize,
				color: titleColor,
				font: titleFont
			}
		};

		// Select composition strategy
		const strategy =
			titlePosition === 'top'
				? compositionStrategies.titleTop
				: compositionStrategies.titleBottom;

		const composedCanvas = strategy(canvasConfig, qrImage, titleConfig);

		// Convert to buffer
		return composedCanvas.toBuffer('image/png');
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error composing image:', error);
		// Return original QR on error
		return qrBuffer;
	}
};

/**
 * SVG manipulation utilities
 */
const svgUtils = {
	/**
	 * Parses SVG string and extracts dimensions
	 * @param {string} svgString - SVG markup
	 * @returns {Object} SVG info with element and dimensions
	 */
	parseSVG: svgString => {
		const dom = new JSDOM(svgString, { contentType: 'image/svg+xml' });
		const doc = dom.window.document;
		const svgElement = doc.querySelector('svg');

		const viewBox = svgElement.getAttribute('viewBox');
		const [x, y, width, height] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 256, 256];

		return {
			element: svgElement,
			document: doc,
			viewBox: { x, y, width, height },
			originalWidth: width,
			originalHeight: height
		};
	},

	/**
	 * Creates a text element for SVG
	 * @param {Object} textConfig - Text configuration
	 * @param {Object} position - Position configuration
	 * @param {Document} doc - Document context
	 * @returns {Element} SVG text element
	 */
	createTextElement: (textConfig, position, doc) => {
		const textElement = doc.createElementNS('http://www.w3.org/2000/svg', 'text');

		textElement.setAttribute('x', position.x);
		textElement.setAttribute('y', position.y);
		textElement.setAttribute('text-anchor', 'middle');
		textElement.setAttribute('dominant-baseline', 'central');
		textElement.setAttribute('font-family', textConfig.font);
		textElement.setAttribute('font-size', textConfig.size);
		textElement.setAttribute('fill', textConfig.color);
		textElement.textContent = textConfig.text;

		return textElement;
	},

	/**
	 * Calculates text dimensions (approximate for SVG)
	 * @param {Object} textConfig - Text configuration
	 * @returns {Object} Estimated text dimensions
	 */
	estimateTextDimensions: textConfig => {
		// Rough estimation based on font size and character count
		const charWidth = textConfig.size * 0.6; // Approximate character width
		const width = textConfig.text.length * charWidth;
		const height = textConfig.size;

		return { width, height };
	},

	/**
	 * Composes SVG with title
	 * @param {Object} svgInfo - Parsed SVG information
	 * @param {Object} titleConfig - Title configuration
	 * @param {Object} compositionConfig - Layout configuration
	 * @returns {string} Modified SVG string
	 */
	composeWithTitle: (svgInfo, titleConfig, compositionConfig) => {
		try {
			const { element, viewBox } = svgInfo;
			const { text, style } = titleConfig;
			const { position, padding, backgroundColor, qrSize } = compositionConfig;

			// Estimate text dimensions
			const textDimensions = svgUtils.estimateTextDimensions({
				text,
				size: style.size,
				font: style.font
			});

			// Use the configured QR size instead of viewBox dimensions
			const qrWidth = qrSize || viewBox.width;
			const qrHeight = qrSize || viewBox.height;
			const totalWidth = Math.max(qrWidth, textDimensions.width) + padding * 2;
			const totalHeight = qrHeight + textDimensions.height + padding * 3;

			// Position QR code and title based on layout
			let qrY, textY;
			const qrX = (totalWidth - qrWidth) / 2;
			const textX = totalWidth / 2;

			if (position === 'top') {
				textY = padding + textDimensions.height / 2;
				qrY = padding + textDimensions.height + padding;
			} else {
				qrY = padding;
				textY = padding + qrHeight + padding + textDimensions.height / 2;
			}

			// Build SVG string manually to avoid JSDOM attribute issues
			let svgContent = `<svg viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">`;

			// Add background if specified
			if (backgroundColor && backgroundColor !== '#FFFFFF') {
				svgContent += `<rect width="${totalWidth}" height="${totalHeight}" fill="${backgroundColor}"/>`;
			}

			// Add QR code group with transform and scaling
			// Use a more aggressive scale factor to make the QR more visible
			const baseScale = qrWidth / viewBox.width;
			const enhancedScale = Math.max(baseScale, 2); // Minimum 2x scale

			// Adjust positioning to keep centered with the new scale
			const scaledQrX = qrX + (qrWidth - viewBox.width * enhancedScale) / 2;
			const scaledQrY = qrY + (qrHeight - viewBox.height * enhancedScale) / 2;

			svgContent += `<g transform="translate(${scaledQrX}, ${scaledQrY}) scale(${enhancedScale})">`;

			// Get the inner content of the original SVG (without the svg tags)
			const originalContent = element.innerHTML;
			svgContent += originalContent;

			svgContent += '</g>';

			// Add text element
			svgContent += `<text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" font-family="${style.font}" font-size="${style.size}" fill="${style.color}">${text}</text>`;

			svgContent += '</svg>';

			return svgContent;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error in composeWithTitle:', error);
			throw error;
		}
	}
};

/**
 * Format-specific composers
 */
const formatComposers = {
	/**
	 * Creates composed image for PNG format
	 */
	png: async (qrBuffer, options) => {
		const composedBuffer = await createComposedImage(qrBuffer, options);
		return `data:image/png;base64,${composedBuffer.toString('base64')}`;
	},

	/**
	 * Creates composed image for JPG format
	 */
	jpg: async (qrBuffer, options) => {
		const composedBuffer = await createComposedImage(qrBuffer, options);
		const canvas = createCanvas(1, 1);
		const ctx = canvas.getContext('2d');
		const tempImage = await loadImage(composedBuffer);

		canvas.width = tempImage.width;
		canvas.height = tempImage.height;
		ctx.drawImage(tempImage, 0, 0);

		const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: options.quality || 0.92 });
		return `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
	},

	/**
	 * Creates composed image for base64 format
	 */
	base64: async (qrBuffer, options) => {
		const composedBuffer = await createComposedImage(qrBuffer, options);
		return composedBuffer.toString('base64');
	},

	/**
	 * Creates composed SVG with title support
	 * @param {string} qrData - SVG markup string
	 * @param {Object} options - Composition options
	 * @returns {string} Composed SVG markup
	 */
	svg: async (qrData, options) => {
		// If no title, return original SVG
		if (!options || !options.title || options.title.trim() === '') {
			return qrData;
		}

		try {
			// Parse the original SVG
			const svgInfo = svgUtils.parseSVG(qrData);

			// Prepare title configuration
			const titleConfig = {
				text: options.title.trim(),
				style: {
					size: options.titleSize || 24,
					color: options.titleColor || '#333333',
					font: options.titleFont || 'Arial'
				}
			};

			// Prepare composition configuration
			const compositionConfig = {
				position: options.titlePosition || 'bottom',
				padding: options.imagePadding || 20,
				backgroundColor: options.backgroundColor || '#FFFFFF',
				qrSize: options.qrSize || 256
			};

			// Compose SVG with title
			return svgUtils.composeWithTitle(svgInfo, titleConfig, compositionConfig);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error composing SVG with title:', error);
			// Return original SVG on error
			return qrData;
		}
	}
};

export { createComposedImage, formatComposers, canvasUtils, compositionStrategies, svgUtils };
