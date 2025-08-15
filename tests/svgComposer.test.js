import { describe, it, expect } from 'vitest';
import { svgUtils } from '../imageComposer.js';

describe('SVG Composer', () => {
	const sampleSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <rect width="256" height="256" fill="white"/>
        <rect x="0" y="0" width="32" height="32" fill="black"/>
        <rect x="64" y="0" width="32" height="32" fill="black"/>
    </svg>`;

	describe('parseSVG', () => {
		it('should parse SVG and extract viewBox dimensions', () => {
			const result = svgUtils.parseSVG(sampleSVG);

			expect(result.viewBox).toEqual({
				x: 0,
				y: 0,
				width: 256,
				height: 256
			});
			expect(result.originalWidth).toBe(256);
			expect(result.originalHeight).toBe(256);
			expect(result.element).toBeDefined();
			expect(result.document).toBeDefined();
		});

		it('should handle SVG without viewBox', () => {
			const svgWithoutViewBox = `<svg xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="red"/>
            </svg>`;

			const result = svgUtils.parseSVG(svgWithoutViewBox);

			// Should default to 256x256
			expect(result.viewBox).toEqual({
				x: 0,
				y: 0,
				width: 256,
				height: 256
			});
		});
	});

	describe('estimateTextDimensions', () => {
		it('should estimate text dimensions based on font size and length', () => {
			const textConfig = {
				text: 'Hello World',
				size: 24,
				font: 'Arial'
			};

			const dimensions = svgUtils.estimateTextDimensions(textConfig);

			expect(dimensions.width).toBeCloseTo(11 * 24 * 0.6); // 11 chars * 24px * 0.6
			expect(dimensions.height).toBe(24);
		});

		it('should handle empty text', () => {
			const textConfig = {
				text: '',
				size: 24,
				font: 'Arial'
			};

			const dimensions = svgUtils.estimateTextDimensions(textConfig);

			expect(dimensions.width).toBe(0);
			expect(dimensions.height).toBe(24);
		});
	});

	describe('createTextElement', () => {
		it('should create SVG text element with correct attributes', async () => {
			// Create a minimal JSDOM document for testing
			const { JSDOM } = await import('jsdom');
			const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
			const doc = dom.window.document;

			const textConfig = {
				text: 'Test Title',
				font: 'Arial',
				size: 24,
				color: '#333333'
			};

			const position = { x: 100, y: 50 };

			const textElement = svgUtils.createTextElement(textConfig, position, doc);

			expect(textElement.tagName).toBe('text');
			expect(textElement.getAttribute('x')).toBe('100');
			expect(textElement.getAttribute('y')).toBe('50');
			expect(textElement.getAttribute('font-family')).toBe('Arial');
			expect(textElement.getAttribute('font-size')).toBe('24');
			expect(textElement.getAttribute('fill')).toBe('#333333');
			expect(textElement.getAttribute('text-anchor')).toBe('middle');
			expect(textElement.textContent).toBe('Test Title');
		});
	});

	describe('composeWithTitle', () => {
		it('should compose SVG with title at bottom', () => {
			const svgInfo = svgUtils.parseSVG(sampleSVG);

			const titleConfig = {
				text: 'My QR Code',
				style: {
					size: 24,
					color: '#333333',
					font: 'Arial'
				}
			};

			const compositionConfig = {
				position: 'bottom',
				padding: 20,
				backgroundColor: '#FFFFFF'
			};

			const result = svgUtils.composeWithTitle(svgInfo, titleConfig, compositionConfig);

			expect(result).toContain('<svg');
			expect(result).toContain('viewBox="0 0');
			expect(result).toContain('<text');
			expect(result).toContain('My QR Code');
			expect(result).toContain('font-family="Arial"');
			expect(result).toContain('font-size="24"');
			expect(result).toContain('fill="#333333"');
		});

		it('should compose SVG with title at top', () => {
			const svgInfo = svgUtils.parseSVG(sampleSVG);

			const titleConfig = {
				text: 'Top Title',
				style: {
					size: 20,
					color: '#000000',
					font: 'Helvetica'
				}
			};

			const compositionConfig = {
				position: 'top',
				padding: 15,
				backgroundColor: '#FFFFFF'
			};

			const result = svgUtils.composeWithTitle(svgInfo, titleConfig, compositionConfig);

			expect(result).toContain('<svg');
			expect(result).toContain('<text');
			expect(result).toContain('Top Title');
			expect(result).toContain('font-family="Helvetica"');
			expect(result).toContain('font-size="20"');
		});

		it('should include background color when specified', () => {
			const svgInfo = svgUtils.parseSVG(sampleSVG);

			const titleConfig = {
				text: 'Colored Background',
				style: {
					size: 24,
					color: '#333333',
					font: 'Arial'
				}
			};

			const compositionConfig = {
				position: 'bottom',
				padding: 20,
				backgroundColor: '#F0F0F0'
			};

			const result = svgUtils.composeWithTitle(svgInfo, titleConfig, compositionConfig);

			expect(result).toContain('<rect');
			expect(result).toContain('fill="#F0F0F0"');
		});

		it('should handle large text that exceeds QR width', () => {
			const svgInfo = svgUtils.parseSVG(sampleSVG);

			const titleConfig = {
				text: 'This is a very long title that should exceed the QR code width',
				style: {
					size: 24,
					color: '#333333',
					font: 'Arial'
				}
			};

			const compositionConfig = {
				position: 'bottom',
				padding: 20,
				backgroundColor: '#FFFFFF'
			};

			const result = svgUtils.composeWithTitle(svgInfo, titleConfig, compositionConfig);

			expect(result).toContain('<svg');
			expect(result).toContain('viewBox="0 0');

			// Extract viewBox to verify it's wider than original
			const viewBoxMatch = result.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
			expect(viewBoxMatch).toBeTruthy();
			const [, width] = viewBoxMatch;
			expect(parseFloat(width)).toBeGreaterThan(256); // Should be wider than original
		});
	});
});
