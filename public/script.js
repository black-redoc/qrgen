/**
 * Pure functions for smooth scrolling
 */
const scrollUtils = {
	/**
	 * Smooth scroll to element within container with custom duration
	 * @param {HTMLElement} element - Target element
	 * @param {HTMLElement} container - Container element (default: .container)
	 * @param {number} duration - Duration in milliseconds
	 */
	smoothScrollTo: (element, container = null, duration = 1000) => {
		if (!element) {
			return;
		}

		// Get the main container if not provided
		if (!container) {
			container = document.querySelector('.container');
		}

		if (!container) {
			return;
		}

		// Get element position relative to container
		const containerRect = container.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();

		const startPosition = container.scrollTop;
		const elementRelativeTop = elementRect.top - containerRect.top + container.scrollTop;
		const targetPosition =
			elementRelativeTop - container.clientHeight / 2 + element.offsetHeight / 2;
		const distance = targetPosition - startPosition;

		let startTime = null;

		const animation = currentTime => {
			if (startTime === null) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			// Easing function (ease-in-out cubic)
			const ease =
				progress < 0.5
					? 4 * progress * progress * progress
					: 1 - Math.pow(-2 * progress + 2, 3) / 2;

			container.scrollTop = startPosition + distance * ease;

			if (timeElapsed < duration) {
				requestAnimationFrame(animation);
			}
		};

		requestAnimationFrame(animation);
	}
};

/**
 * Pure functions for DOM manipulation
 */
const domUtils = {
	/**
	 * Shows an element by removing the 'hidden' class
	 * @param {HTMLElement} element - Element to show
	 */
	show: element => element.classList.remove('hidden'),

	/**
	 * Hides an element by adding the 'hidden' class
	 * @param {HTMLElement} element - Element to hide
	 */
	hide: element => element.classList.add('hidden'),

	/**
	 * Clears the content of an element
	 * @param {HTMLElement} element - Element to clear
	 */
	clear: element => (element.innerHTML = ''),

	/**
	 * Sets text content of an element
	 * @param {HTMLElement} element - Target element
	 * @param {string} text - Text to set
	 */
	setText: (element, text) => (element.textContent = text),

	/**
	 * Creates a download link and triggers it
	 * @param {string} href - Download URL
	 * @param {string} filename - Filename for download
	 */
	triggerDownload: (href, filename) => {
		const link = document.createElement('a');
		link.href = href;
		link.download = filename;
		link.click();
	}
};

/**
 * Pure functions for form handling
 */
const formUtils = {
	/**
	 * Extracts form data as an object including advanced options
	 * @param {HTMLFormElement} form - Form element
	 * @returns {Object} Form data as key-value pairs
	 */
	extractData: form => {
		const formData = new FormData(form);
		return {
			text: formData.get('text').trim(),
			format: formData.get('format'),
			size: parseInt(formData.get('size')),
			errorLevel: formData.get('errorLevel'),
			margin: parseInt(formData.get('margin')),
			darkColor: formData.get('darkColor'),
			lightColor: formData.get('lightColor'),
			quality: parseFloat(formData.get('quality')),
			// Personalization options
			title: formData.get('title')?.trim() || '',
			titlePosition: formData.get('titlePosition'),
			titleSize: parseInt(formData.get('titleSize')),
			titleColor: formData.get('titleColor'),
			titleFont: formData.get('titleFont'),
			backgroundColor: formData.get('backgroundColor'),
			imagePadding: parseInt(formData.get('imagePadding'))
		};
	},

	/**
	 * Validates form data
	 * @param {Object} data - Form data object
	 * @returns {Object} Validation result with isValid and error
	 */
	validate: data => ({
		isValid: Boolean(data.text),
		error: data.text ? null : 'Por favor ingresa un texto or URL'
	})
};

/**
 * Mobile layout utilities
 */
const mobileUtils = {
	/**
	 * Synchronize heights between loading and result containers for mobile
	 */
	syncContainerHeights: () => {
		const loading = document.getElementById('loading');
		const result = document.getElementById('result');

		if (!loading || !result) return;

		const isMobile = window.innerWidth <= 768;

		if (isMobile) {
			// Reset heights first
			loading.style.height = 'auto';
			result.style.height = 'auto';

			// Get content heights with some breathing room
			const loadingHeight = loading.scrollHeight + 40; // Add extra space
			const resultHeight = result.scrollHeight + 40; // Add extra space

			// Use the larger height for both, with generous constraints
			const targetHeight = Math.max(
				Math.max(loadingHeight, resultHeight),
				450 // Minimum 450px for mobile
			);

			loading.style.height = `${targetHeight}px`;
			result.style.height = `${targetHeight}px`;
		} else {
			// Desktop: use fixed height
			loading.style.height = '460px';
			result.style.height = '460px';
		}
	}
};

/**
 * Pure functions for UI state management
 */
const uiStateUtils = {
	/**
	 * Creates a UI state object
	 * @param {Object} elements - DOM elements
	 * @returns {Object} UI state management functions
	 */
	create: elements => ({
		showLoading: () => {
			// Sync heights for mobile before showing
			mobileUtils.syncContainerHeights();

			// Immediate transition - no delays for faster response
			elements.result.classList.remove('show');
			domUtils.hide(elements.error);
			domUtils.hide(elements.result);
			domUtils.show(elements.loading);

			// Immediate show class for loading
			requestAnimationFrame(() => {
				elements.loading.classList.add('show');
			});
		},

		showResult: () => {
			// Sync heights for mobile before showing
			mobileUtils.syncContainerHeights();

			// Reset animations for result content
			const resultContent = elements.result.querySelectorAll(
				'h2, #qr-display, .download-actions'
			);
			resultContent.forEach(el => {
				el.style.animation = 'none';
				el.offsetHeight; // Trigger reflow
				el.style.animation = null;
			});

			// Immediate transition to result
			elements.loading.classList.remove('show');
			domUtils.hide(elements.error);
			domUtils.hide(elements.loading);
			domUtils.show(elements.result);

			requestAnimationFrame(() => {
				elements.result.classList.add('show');
			});
		},

		showError: message => {
			elements.loading.classList.remove('show');
			elements.result.classList.remove('show');

			setTimeout(() => {
				domUtils.hide(elements.loading);
				domUtils.hide(elements.result);
				domUtils.setText(elements.error, message);
				domUtils.show(elements.error);
			}, 100);
		},

		hideAll: () => {
			elements.loading.classList.remove('show');
			elements.result.classList.remove('show');
			domUtils.hide(elements.loading);
			domUtils.hide(elements.result);
			domUtils.hide(elements.error);
		}
	})
};

/**
 * Pure functions for API communication
 */
const apiUtils = {
	/**
	 * Makes a QR generation request
	 * @param {Object} data - Request data
	 * @returns {Promise<Object>} API response
	 */
	generateQR: async data => {
		const response = await fetch('/generate-qr', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin', // Include cookies in request
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Error en la solicitud');
		}

		return await response.json();
	}
};

/**
 * Pure functions for button state management
 */
const buttonStateUtils = {
	/**
	 * Updates button appearance temporarily
	 * @param {HTMLElement} button - Button element
	 * @param {string} text - Temporary text
	 * @param {string} color - Temporary background color
	 * @param {number} duration - Duration in milliseconds
	 */
	temporaryUpdate: (button, text, color, duration = 2000) => {
		const originalText = button.textContent;
		const originalColor = button.style.background;

		button.textContent = text;
		button.style.background = color;

		setTimeout(() => {
			button.textContent = originalText;
			button.style.background = originalColor;
		}, duration);
	}
};

/**
 * Main application logic using functional composition
 */
const qrApp = (() => {
	// Application state
	let currentQRData = null;
	let currentFormat = null;

	// DOM elements
	const elements = {
		form: document.getElementById('qr-form'),
		loading: document.getElementById('loading'),
		result: document.getElementById('result'),
		error: document.getElementById('error'),
		qrDisplay: document.getElementById('qr-display'),
		downloadBtn: document.getElementById('download-btn'),
		copyBtn: document.getElementById('copy-btn')
	};

	// UI state manager
	const uiState = uiStateUtils.create(elements);

	/**
	 * Handles QR code generation workflow
	 * @param {Event} event - Form submission event
	 */
	const handleGeneration = async event => {
		event.preventDefault();

		const formData = formUtils.extractData(elements.form);
		const validation = formUtils.validate(formData);

		if (!validation.isValid) {
			uiState.showError(validation.error);
			return;
		}

		uiState.showLoading();

		// Smooth scroll to preview container with custom 1s animation
		setTimeout(() => {
			scrollUtils.smoothScrollTo(elements.loading);
		}, 100); // Small delay to ensure loading is visible

		try {
			const response = await apiUtils.generateQR(formData);

			if (response.success) {
				currentQRData = response.data;
				currentFormat = formData.format;

				// Add 3-second delay to enjoy the loading animation
				await new Promise(resolve => setTimeout(resolve, 3000));

				await displayQR(response.data, formData.format);
				uiState.showResult();
			} else {
				uiState.showError(response.error || 'Error al generar el código QR');
			}
		} catch (error) {
			uiState.showError(
				error.message || 'Error de conexión. Verifica que el servidor esté ejecutándose.'
			);
		}
	};

	/**
	 * Displays QR code using the appropriate format handler
	 * @param {string} data - QR code data
	 * @param {string} format - Format type
	 */
	const displayQR = async (data, format) => {
		domUtils.clear(elements.qrDisplay);

		const handler = window.formatRegistry.getHandler(format);
		await window.formatUtils.executeHandler(handler, 'display', data, elements.qrDisplay);
	};

	/**
	 * Handles download functionality
	 */
	const handleDownload = async () => {
		if (!currentQRData || !currentFormat) return;

		try {
			const handler = window.formatRegistry.getHandler(currentFormat);
			const downloadConfig = await window.formatUtils.executeHandler(
				handler,
				'download',
				currentQRData,
				currentFormat
			);

			domUtils.triggerDownload(downloadConfig.href, downloadConfig.filename);
		} catch {
			uiState.showError('Error al descargar el archivo');
		}
	};

	/**
	 * Handles copy to clipboard functionality
	 */
	const handleCopy = async () => {
		if (!currentQRData) return;

		try {
			const handler = window.formatRegistry.getHandler(currentFormat);
			await window.formatUtils.executeHandler(handler, 'copy', currentQRData);

			buttonStateUtils.temporaryUpdate(elements.copyBtn, '✓ Copiado', '#28a745');
		} catch {
			uiState.showError('No se pudo copiar al portapapeles');
		}
	};

	/**
	 * Initializes event listeners
	 */
	const initEventListeners = () => {
		elements.form.addEventListener('submit', handleGeneration);
		elements.downloadBtn.addEventListener('click', handleDownload);
		elements.copyBtn.addEventListener('click', handleCopy);
	};

	/**
	 * Application initialization
	 */
	const init = () => {
		initEventListeners();
		uiState.hideAll();
	};

	return { init };
})();

/**
 * Custom Scroll Enhancement System
 */
const customScrollSystem = {
	/**
	 * Initialize scroll indicators and enhancements
	 */
	init: () => {
		const container = document.querySelector('.container');
		if (!container) return;

		customScrollSystem.addScrollIndicators(container);
		customScrollSystem.addScrollAnimations(container);
		customScrollSystem.addKeyboardNavigation(container);
	},

	/**
	 * Add visual scroll indicators
	 */
	addScrollIndicators: container => {
		// Create scroll progress indicator
		const scrollProgress = document.createElement('div');
		scrollProgress.className = 'scroll-progress';
		scrollProgress.innerHTML = '<div class="scroll-progress-bar"></div>';
		container.appendChild(scrollProgress);

		// Create scroll position indicator
		const scrollPosition = document.createElement('div');
		scrollPosition.className = 'scroll-position';
		scrollPosition.innerHTML = '↑';
		container.appendChild(scrollPosition);

		// Function to update scroll indicators position
		const updateIndicatorsPosition = () => {
			const containerRect = container.getBoundingClientRect();
			const containerViewportBottom = containerRect.bottom;
			const windowHeight = window.innerHeight;

			// Calculate if container bottom is visible
			const isContainerBottomVisible = containerViewportBottom <= windowHeight;

			if (isContainerBottomVisible) {
				// Position relative to container's visible bottom
				const visibleBottom = Math.min(containerViewportBottom, windowHeight);
				scrollPosition.style.position = 'fixed';
				scrollPosition.style.bottom = `${windowHeight - visibleBottom + 30}px`;
				scrollPosition.style.right = `${window.innerWidth - containerRect.right + 30}px`;

				scrollProgress.style.position = 'fixed';
				scrollProgress.style.top = `${containerRect.top + 20}px`;
				scrollProgress.style.right = `${window.innerWidth - containerRect.right + 20}px`;
				scrollProgress.style.height = `${visibleBottom - containerRect.top - 40}px`;
			} else {
				// Use absolute positioning within container
				scrollPosition.style.position = 'absolute';
				scrollPosition.style.bottom = '30px';
				scrollPosition.style.right = '30px';

				scrollProgress.style.position = 'absolute';
				scrollProgress.style.top = '20px';
				scrollProgress.style.right = '20px';
				scrollProgress.style.height = 'calc(100% - 40px)';
			}
		};

		// Update indicators on scroll and resize
		const updateIndicators = () => {
			const scrollTop = container.scrollTop;
			const scrollHeight = container.scrollHeight - container.clientHeight;
			const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

			// Update progress bar
			const progressBar = scrollProgress.querySelector('.scroll-progress-bar');
			progressBar.style.height = `${scrollPercent}%`;

			// Update position indicator
			if (scrollTop > 100) {
				scrollPosition.style.opacity = '1';
				scrollPosition.style.transform = 'translateY(0)';
			} else {
				scrollPosition.style.opacity = '0';
				scrollPosition.style.transform = 'translateY(10px)';
			}

			// Update positions
			updateIndicatorsPosition();
		};

		container.addEventListener('scroll', updateIndicators);
		window.addEventListener('resize', updateIndicatorsPosition);
		window.addEventListener('scroll', updateIndicatorsPosition);

		// Initial position update
		updateIndicatorsPosition();

		// Click to scroll to top
		scrollPosition.addEventListener('click', () => {
			scrollUtils.smoothScrollTo(container.firstElementChild, container, 800);
		});
	},

	/**
	 * Add smooth scroll animations and momentum
	 */
	addScrollAnimations: container => {
		let isScrolling = false;
		let scrollTimeout;

		container.addEventListener('scroll', () => {
			if (!isScrolling) {
				container.classList.add('scrolling');
				isScrolling = true;
			}

			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				container.classList.remove('scrolling');
				isScrolling = false;
			}, 150);
		});

		// Add parallax effect to background elements
		container.addEventListener('scroll', () => {
			const scrollTop = container.scrollTop;
			const h1 = container.querySelector('h1');
			if (h1) {
				h1.style.transform = `translateY(${scrollTop * 0.1}px)`;
				h1.style.opacity = Math.max(0.3, 1 - scrollTop / 200);
			}
		});
	},

	/**
	 * Add keyboard navigation
	 */
	addKeyboardNavigation: container => {
		document.addEventListener('keydown', e => {
			if (!container.contains(document.activeElement)) return;

			switch (e.key) {
				case 'PageDown':
					e.preventDefault();
					scrollUtils.smoothScrollTo(
						{ offsetTop: container.scrollTop + container.clientHeight * 0.8 },
						container,
						600
					);
					break;
				case 'PageUp':
					e.preventDefault();
					scrollUtils.smoothScrollTo(
						{ offsetTop: container.scrollTop - container.clientHeight * 0.8 },
						container,
						600
					);
					break;
				case 'Home':
					if (e.ctrlKey) {
						e.preventDefault();
						scrollUtils.smoothScrollTo(container.firstElementChild, container, 800);
					}
					break;
				case 'End':
					if (e.ctrlKey) {
						e.preventDefault();
						scrollUtils.smoothScrollTo(container.lastElementChild, container, 800);
					}
					break;
			}
		});
	}
};

/**
 * Advanced options UI functionality
 */
const advancedUI = {
	/**
	 * Toggles the advanced options section
	 */
	toggle: () => {
		const content = document.getElementById('advanced-content');
		const arrow = document.getElementById('dropdown-arrow');

		content.classList.toggle('expanded');
		arrow.classList.toggle('rotated');

		// Update scroll indicators position after toggle
		setTimeout(() => {
			const container = document.querySelector('.container');
			if (container) {
				container.dispatchEvent(new Event('scroll'));
			}
		}, 400); // Wait for CSS transition to complete
	},

	/**
	 * Updates range slider values in real time
	 */
	updateRangeValues: () => {
		const rangeInputs = ['size', 'margin', 'quality', 'titleSize', 'imagePadding'];

		rangeInputs.forEach(id => {
			const input = document.getElementById(id);
			const valueSpan = document.getElementById(`${id}-value`);

			if (input && valueSpan) {
				const updateValue = () => {
					let displayValue = input.value;
					if (id === 'size' || id === 'titleSize' || id === 'imagePadding') {
						displayValue += 'px';
					}
					valueSpan.textContent = displayValue;
				};

				updateValue(); // Set initial value
				input.addEventListener('input', updateValue);
			}
		});
	},

	/**
	 * Shows/hides quality option based on format
	 */
	toggleQualityOption: format => {
		const qualityGroup = document.getElementById('quality-group');
		if (qualityGroup) {
			if (format === 'jpg' || format === 'jpeg') {
				qualityGroup.classList.add('show');
			} else {
				qualityGroup.classList.remove('show');
			}
		}
	},

	/**
	 * Initializes all advanced UI functionality
	 */
	init: () => {
		advancedUI.updateRangeValues();

		// Listen for format changes to toggle quality option
		const formatSelect = document.getElementById('format');
		if (formatSelect) {
			formatSelect.addEventListener('change', e => {
				advancedUI.toggleQualityOption(e.target.value);
			});

			// Set initial state
			advancedUI.toggleQualityOption(formatSelect.value);
		}
	}
};

/**
 * Global function for toggle (called from HTML onclick)
 */
window.toggleAdvanced = function () {
	advancedUI.toggle();
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	qrApp.init();
	advancedUI.init();
	customScrollSystem.init();

	// Sync container heights on load and resize
	mobileUtils.syncContainerHeights();
	window.addEventListener('resize', () => {
		setTimeout(mobileUtils.syncContainerHeights, 100);
	});
});
