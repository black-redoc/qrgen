import { test, expect } from '@playwright/test';

test.describe('QR Code Generator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:3000');
		await expect(page.locator('h1')).toHaveText('Generador de Códigos QR');
	});

	test('should display the QR generator interface', async ({ page }) => {
		await expect(page.locator('#text')).toBeVisible();
		await expect(page.locator('#format')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should generate QR code without title', async ({ page }) => {
		await page.fill('#text', 'Test QR Code');
		await page.selectOption('#format', 'png');
		await page.click('button[type="submit"]');

		await expect(page.locator('#result')).toBeVisible();
		await expect(page.locator('#qr-display img')).toBeVisible();

		const img = page.locator('#qr-display img');
		await expect(img).toHaveAttribute('src', /data:image\/png;base64,/);
	});

	test('should generate SVG QR code with title', async ({ page }) => {
		await page.fill('#text', 'Test SVG QR');
		await page.selectOption('#format', 'svg');
		await page.fill('#title', 'My SVG Title');
		await page.selectOption('#titlePosition', 'bottom');
		await page.click('button[type="submit"]');

		await expect(page.locator('#result')).toBeVisible();

		// For SVG, check the actual SVG content
		const svgContent = await page.locator('#qr-display').innerHTML();
		expect(svgContent).toContain('<svg');
		expect(svgContent).toContain('<text');
		expect(svgContent).toContain('My SVG Title');
	});

	test('should generate SVG QR code with title at top position', async ({ page }) => {
		await page.fill('#text', 'Test Top Title');
		await page.selectOption('#format', 'svg');
		await page.fill('#title', 'Top Title');
		await page.selectOption('#titlePosition', 'top');
		await page.click('button[type="submit"]');

		await expect(page.locator('#result')).toBeVisible();

		const svgContent = await page.locator('#qr-display').innerHTML();
		expect(svgContent).toContain('<svg');
		expect(svgContent).toContain('<text');
		expect(svgContent).toContain('Top Title');
	});

	test('should customize title styling', async ({ page }) => {
		await page.fill('#text', 'Styled QR');
		await page.selectOption('#format', 'svg');
		await page.fill('#title', 'Styled Title');
		await page.fill('#titleSize', '32');
		await page.fill('#titleColor', '#FF0000');
		await page.click('button[type="submit"]');

		await expect(page.locator('#result')).toBeVisible();

		const svgContent = await page.locator('#qr-display').innerHTML();
		expect(svgContent).toContain('Styled Title');
		expect(svgContent).toContain('font-size="32"');
		expect(svgContent).toContain('fill="#FF0000"');
	});

	test('should copy QR code to clipboard', async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		await page.fill('#text', 'Copy Test');
		await page.selectOption('#format', 'png');
		await page.click('button[type="submit"]');

		await expect(page.locator('#result')).toBeVisible();
		await expect(page.locator('#copy-btn')).toBeVisible();

		await page.click('#copy-btn');

		// Wait for success message
		await expect(page.locator('#copy-btn')).toHaveText('✓ Copiado');
	});

	test('should download QR code', async ({ page }) => {
		await page.fill('#text', 'Download Test');
		await page.selectOption('#format', 'png');
		await page.click('button[type="submit"]');

		await expect(page.locator('#result')).toBeVisible();
		await expect(page.locator('#download-btn')).toBeVisible();

		// Start waiting for download before clicking
		const downloadPromise = page.waitForEvent('download');
		await page.click('#download-btn');
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toMatch(/qrcode\.(png|jpg|svg)$/);
	});

	test('should handle different QR formats', async ({ page }) => {
		const formats = ['png', 'jpg', 'svg', 'base64'];

		for (const format of formats) {
			await page.fill('#text', `Test ${format.toUpperCase()}`);
			await page.selectOption('#format', format);
			await page.click('button[type="submit"]');

			await expect(page.locator('#result')).toBeVisible();

			if (format === 'svg') {
				await expect(page.locator('#qr-display svg')).toBeVisible();
			} else {
				await expect(page.locator('#qr-display img')).toBeVisible();
				const img = page.locator('#qr-display img');
				if (format === 'png') {
					await expect(img).toHaveAttribute('src', /data:image\/png;base64,/);
				} else if (format === 'jpg') {
					await expect(img).toHaveAttribute('src', /data:image\/jpeg;base64,/);
				} else if (format === 'base64') {
					await expect(img).toHaveAttribute('src', /data:image\/png;base64,/);
				}
			}

			// Clear the form for next iteration
			await page.fill('#text', '');
		}
	});
});
