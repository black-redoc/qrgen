import { describe, it, expect } from 'vitest';
import QRCode from 'qrcode';
import { createComposedImage, formatComposers, canvasUtils } from '../imageComposer.js';

describe('Image Composer', () => {
	describe('createComposedImage', () => {
		it('should return original buffer when no title is provided', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await createComposedImage(qrBuffer, {});

			expect(result).toBe(qrBuffer);
		});

		it('should return original buffer when title is empty string', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await createComposedImage(qrBuffer, { title: '' });

			expect(result).toBe(qrBuffer);
		});

		it('should create composed image with title', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await createComposedImage(qrBuffer, {
				title: 'Test Title',
				titlePosition: 'bottom',
				titleSize: 24,
				titleColor: '#333333',
				titleFont: 'Arial',
				backgroundColor: '#FFFFFF',
				imagePadding: 20,
				qrSize: 256
			});

			expect(result).toBeInstanceOf(Buffer);
			expect(result.length).toBeGreaterThan(qrBuffer.length);
		});

		it('should handle title at top position', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await createComposedImage(qrBuffer, {
				title: 'Top Title',
				titlePosition: 'top',
				titleSize: 24,
				qrSize: 256
			});

			expect(result).toBeInstanceOf(Buffer);
			expect(result.length).toBeGreaterThan(qrBuffer.length);
		});
	});

	describe('formatComposers', () => {
		it('should create PNG data URL', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await formatComposers.png(qrBuffer, {
				title: 'PNG Test',
				qrSize: 256
			});

			expect(result).toMatch(/^data:image\/png;base64,/);
		});

		it('should create JPG data URL', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await formatComposers.jpg(qrBuffer, {
				title: 'JPG Test',
				qrSize: 256,
				quality: 0.8
			});

			expect(result).toMatch(/^data:image\/jpeg;base64,/);
		});

		it('should create base64 string', async () => {
			const qrBuffer = await QRCode.toBuffer('test', { width: 256 });
			const result = await formatComposers.base64(qrBuffer, {
				title: 'Base64 Test',
				qrSize: 256
			});

			expect(typeof result).toBe('string');
			expect(result).not.toMatch(/^data:/);
		});

		it('should return original SVG when no title provided', async () => {
			const svgData = '<svg>test</svg>';
			const result = await formatComposers.svg(svgData, {});

			expect(result).toBe(svgData);
		});

		it('should compose SVG with title', async () => {
			const svgData =
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="white"/></svg>';
			const result = await formatComposers.svg(svgData, {
				title: 'SVG Test'
			});

			expect(result).toContain('<text');
			expect(result).toContain('SVG Test');
		});
	});

	describe('canvasUtils', () => {
		it('should create canvas with specified dimensions', () => {
			const { canvas, ctx } = canvasUtils.createCanvas(400, 300, '#FF0000');

			expect(canvas.width).toBe(400);
			expect(canvas.height).toBe(300);
			expect(ctx).toBeDefined();
		});

		it('should measure text correctly', () => {
			const { ctx } = canvasUtils.createCanvas(100, 100);
			const metrics = canvasUtils.measureText(ctx, 'Test', '20px Arial');

			expect(metrics.width).toBeGreaterThan(0);
			expect(metrics.height).toBeGreaterThan(0);
		});
	});
});
