import QRCode from 'qrcode';
import { formatComposers } from './imageComposer.js';

const qrGenerators = {
	png: async (text, options, compositionOptions) => {
		const buffer = await QRCode.toBuffer(text, { ...options, type: 'image/png' });

		if (compositionOptions && compositionOptions.title) {
			return await formatComposers.png(buffer, {
				...compositionOptions,
				qrSize: options.width
			});
		}

		return `data:image/png;base64,${buffer.toString('base64')}`;
	},

	jpg: async (text, options, compositionOptions) => {
		const buffer = await QRCode.toBuffer(text, { ...options, type: 'image/png' });

		if (compositionOptions && compositionOptions.title) {
			return await formatComposers.jpg(buffer, {
				...compositionOptions,
				qrSize: options.width,
				quality: options.quality
			});
		}

		return await QRCode.toDataURL(text, { ...options, type: 'image/jpeg' });
	},

	jpeg: async (text, options, compositionOptions) => {
		return await qrGenerators.jpg(text, options, compositionOptions);
	},

	svg: async (text, options, compositionOptions) => {
		const svgOptions = {
			type: 'svg',
			errorCorrectionLevel: options.errorCorrectionLevel,
			margin: options.margin,
			color: options.color,
			width: options.width || 256
		};

		let svgData = await QRCode.toString(text, svgOptions);

		// If there's no title, ensure the SVG has proper width and height attributes
		if (options.width && (!compositionOptions || !compositionOptions.title)) {
			// Remove existing width and height attributes first, then add new ones
			svgData = svgData.replace(/\s*(width|height)="[^"]*"/g, '');
			svgData = svgData.replace(
				/<svg([^>]*)>/,
				`<svg$1 width="${options.width}" height="${options.width}">`
			);
		}

		// For SVG with title, the composer will handle sizing
		return formatComposers.svg(svgData, {
			...compositionOptions,
			qrSize: options.width
		});
	},

	base64: async (text, options, compositionOptions) => {
		const buffer = await QRCode.toBuffer(text, options);

		if (compositionOptions && compositionOptions.title) {
			return await formatComposers.base64(buffer, {
				...compositionOptions,
				qrSize: options.width
			});
		}

		return buffer.toString('base64');
	},

	default: async (text, options, compositionOptions) => {
		return await qrGenerators.png(text, options, compositionOptions);
	}
};

export default qrGenerators;
