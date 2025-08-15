import { describe, it, expect } from 'vitest';
import qrGenerators from '../qrGenerators.js';

const sampleOptions = {
	errorCorrectionLevel: 'M',
	type: 'image/png',
	quality: 0.92,
	margin: 4,
	width: 256,
	color: {
		dark: '#000000',
		light: '#FFFFFF'
	}
};

const sampleCompositionOptions = {
	title: 'Test Title',
	titlePosition: 'bottom',
	titleSize: 24,
	titleColor: '#333333',
	titleFont: 'Arial',
	backgroundColor: '#FFFFFF',
	imagePadding: 20,
	qrSize: 256
};

describe('QR Generators', () => {
	it('should generate PNG without title', async () => {
		const result = await qrGenerators.png('Test QR', sampleOptions);

		expect(result).toMatch(/^data:image\/png;base64,/);
	});

	it('should generate PNG with title', async () => {
		const result = await qrGenerators.png('Test QR', sampleOptions, sampleCompositionOptions);

		expect(result).toMatch(/^data:image\/png;base64,/);
	});

	it('should generate JPG with title', async () => {
		const result = await qrGenerators.jpg('Test QR', sampleOptions, sampleCompositionOptions);

		expect(result).toMatch(/^data:image\/jpeg;base64,/);
	});

	it('should generate base64 with title', async () => {
		const result = await qrGenerators.base64(
			'Test QR',
			sampleOptions,
			sampleCompositionOptions
		);

		expect(typeof result).toBe('string');
		expect(result).not.toMatch(/^data:/);
	});

	it('should generate SVG without title', async () => {
		const result = await qrGenerators.svg('Test QR', sampleOptions);

		expect(typeof result).toBe('string');
		expect(result).toMatch(/<svg/);
		expect(result).not.toMatch(/<text/); // Should not contain text element
	});

	it('should generate SVG with title', async () => {
		const result = await qrGenerators.svg('Test QR', sampleOptions, sampleCompositionOptions);

		expect(typeof result).toBe('string');
		expect(result).toMatch(/<svg/);
		expect(result).toMatch(/<text/); // Should contain text element
		expect(result).toContain('Test Title');
		expect(result).toContain('font-family="Arial"');
		expect(result).toContain('font-size="24"');
	});

	it('should generate SVG with title at top position', async () => {
		const topPositionOptions = {
			...sampleCompositionOptions,
			titlePosition: 'top'
		};

		const result = await qrGenerators.svg('Test QR', sampleOptions, topPositionOptions);

		expect(typeof result).toBe('string');
		expect(result).toMatch(/<svg/);
		expect(result).toMatch(/<text/);
		expect(result).toContain('Test Title');
	});

	it('should handle SVG with custom styling', async () => {
		const customOptions = {
			...sampleCompositionOptions,
			titleSize: 32,
			titleColor: '#FF0000',
			titleFont: 'Helvetica',
			backgroundColor: '#F0F0F0'
		};

		const result = await qrGenerators.svg('Test QR', sampleOptions, customOptions);

		expect(result).toContain('font-size="32"');
		expect(result).toContain('fill="#FF0000"');
		expect(result).toContain('font-family="Helvetica"');
		expect(result).toContain('fill="#F0F0F0"'); // Background color
	});
});
