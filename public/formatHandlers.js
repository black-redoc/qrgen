/**
 * Creates a display handler function for image formats.
 * Returns a pure function that creates and appends an IMG element.
 * @param {string} srcAttribute - The attribute to use for image source (default: direct assignment)
 * @returns {Function} Display handler function
 */
const createImageDisplayHandler =
	(srcAttribute = 'direct') =>
	(data, container) => {
		const img = document.createElement('img');
		img.src = srcAttribute === 'base64' ? `data:image/png;base64,${data}` : data;
		img.alt = 'Código QR';
		container.appendChild(img);
	};

/**
 * Creates a download handler function for various formats.
 * Returns a pure function that generates download configuration.
 * @param {Function} hrefTransform - Function to transform data into download href
 * @param {Function} filenameGenerator - Function to generate filename
 * @returns {Function} Download handler function
 */
const createDownloadHandler = (hrefTransform, filenameGenerator) => (data, format) => ({
	href: hrefTransform(data),
	filename: filenameGenerator(format || 'png')
});

/**
 * Creates a copy handler function with custom clipboard behavior.
 * Returns a pure function that handles clipboard operations.
 * @param {Function} copyTransform - Function to transform data for clipboard
 * @param {string} successMessage - Message to return on successful copy
 * @returns {Function} Copy handler function
 */
const createCopyHandler = (copyTransform, successMessage) => async data => {
	await copyTransform(data);
	return successMessage;
};

/**
 * Pure functions for data transformations
 */
const dataTransforms = {
	identity: data => data,
	createBlob: mimeType => data => URL.createObjectURL(new Blob([data], { type: mimeType })),
	toBase64DataUrl: data => `data:image/png;base64,${data}`
};

/**
 * Pure functions for filename generation
 */
const filenameGenerators = {
	withExtension: ext => () => `qrcode.${ext}`,
	withFormat: format => `qrcode.${format}`
};

/**
 * Pure functions for clipboard operations
 */
const clipboardOperations = {
	writeText: async data => await navigator.clipboard.writeText(data),
	writeImageBlob: async data => {
		const response = await fetch(data);
		const blob = await response.blob();
		const item = new ClipboardItem({ [blob.type]: blob });
		await navigator.clipboard.write([item]);
	}
};

/**
 * Format handler definitions using pure functions and composition
 */
const formatHandlers = {
	// Image formats (PNG, JPG, JPEG) - shared behavior through composition
	png: {
		display: createImageDisplayHandler(),
		download: createDownloadHandler(dataTransforms.identity, filenameGenerators.withFormat),
		copy: createCopyHandler(
			clipboardOperations.writeImageBlob,
			'Imagen copiada al portapapeles'
		)
	},

	jpg: {
		display: createImageDisplayHandler(),
		download: createDownloadHandler(dataTransforms.identity, filenameGenerators.withFormat),
		copy: createCopyHandler(
			clipboardOperations.writeImageBlob,
			'Imagen copiada al portapapeles'
		)
	},

	jpeg: {
		display: createImageDisplayHandler(),
		download: createDownloadHandler(dataTransforms.identity, filenameGenerators.withFormat),
		copy: createCopyHandler(
			clipboardOperations.writeImageBlob,
			'Imagen copiada al portapapeles'
		)
	},

	// SVG format - unique behavior
	svg: {
		display: (data, container) => {
			container.innerHTML = data;
			// Apply consistent sizing to SVG elements
			const svgElement = container.querySelector('svg');
			if (svgElement) {
				svgElement.style.width = '100%';
				svgElement.style.height = 'auto';
				svgElement.style.maxWidth = '400px';
				svgElement.style.maxHeight = '400px';
			}
		},
		download: createDownloadHandler(
			dataTransforms.createBlob('image/svg+xml'),
			filenameGenerators.withExtension('svg')
		),
		copy: createCopyHandler(clipboardOperations.writeText, 'Código SVG copiado al portapapeles')
	},

	// Base64 format - composed with specific transformations
	base64: {
		display: createImageDisplayHandler('base64'),
		download: createDownloadHandler(
			dataTransforms.toBase64DataUrl,
			filenameGenerators.withExtension('png')
		),
		copy: createCopyHandler(
			clipboardOperations.writeText,
			'Código Base64 copiado al portapapeles'
		)
	}
};

/**
 * Default handler using the same pattern as other handlers
 */
const defaultHandler = formatHandlers.png;

/**
 * Higher-order function to create a format handler registry.
 * Returns an object with methods to interact with handlers.
 * @param {Object} handlers - Initial set of format handlers
 * @param {Object} fallback - Default handler to use when format not found
 * @returns {Object} Registry interface
 */
const createFormatRegistry = (handlers, fallback) => {
	const registry = new Map(Object.entries(handlers));

	return {
		/**
		 * Registers a new format handler.
		 * Pure function that doesn't mutate the original registry.
		 * @param {string} format - Format identifier
		 * @param {Object} handler - Handler object with display, download, copy functions
		 */
		register: (format, handler) => registry.set(format, handler),

		/**
		 * Retrieves a handler for the specified format.
		 * Pure function that always returns a valid handler.
		 * @param {string} format - Format identifier
		 * @returns {Object} Handler object or default handler
		 */
		getHandler: format => registry.get(format) || fallback,

		/**
		 * Gets all registered formats.
		 * @returns {Array<string>} Array of format identifiers
		 */
		getFormats: () => Array.from(registry.keys()),

		/**
		 * Checks if a format is supported.
		 * @param {string} format - Format identifier
		 * @returns {boolean} True if format is supported
		 */
		supports: format => registry.has(format)
	};
};

/**
 * Global format registry instance.
 * Immutable interface for format handler operations.
 */
window.formatRegistry = createFormatRegistry(formatHandlers, defaultHandler);

/**
 * Utility functions for common operations
 */
window.formatUtils = {
	/**
	 * Executes a handler method safely with error handling.
	 * @param {Object} handler - Handler object
	 * @param {string} method - Method name to execute
	 * @param {...any} args - Arguments to pass to the method
	 * @returns {Promise<any>} Result of the method execution
	 */
	executeHandler: async (handler, method, ...args) => {
		try {
			return await handler[method](...args);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(`Error executing ${method}:`, error);
			throw error;
		}
	},

	/**
	 * Composes multiple format operations into a single function.
	 * @param {...Function} operations - Operations to compose
	 * @returns {Function} Composed function
	 */
	compose:
		(...operations) =>
		data =>
			operations.reduceRight((result, operation) => operation(result), data)
};
