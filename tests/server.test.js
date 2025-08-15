import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';

describe('Server API', () => {
	let serverProcess;
	const serverPort = 3001; // Use different port for testing
	let sessionCookie = '';

	beforeAll(async () => {
		// Start server for testing
		serverProcess = spawn('node', ['server.js'], {
			env: { ...process.env, PORT: serverPort },
			stdio: 'inherit' // Show server output for debugging
		});

		// Wait for server to start
		await new Promise(resolve => setTimeout(resolve, 3000));

		// Initialize session by accessing home page
		const homeResponse = await fetch(`http://localhost:${serverPort}/`);
		const cookies = homeResponse.headers.get('set-cookie');

		if (cookies) {
			sessionCookie = cookies.split(';')[0];
		}
	});

	afterAll(() => {
		if (serverProcess) {
			serverProcess.kill();
		}
	});

	it('should generate QR with title when session is valid', async () => {
		const response = await fetch(`http://localhost:${serverPort}/generate-qr`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: sessionCookie
			},
			body: JSON.stringify({
				text: 'Test QR',
				format: 'png',
				title: 'My Custom Title',
				titlePosition: 'bottom',
				titleSize: 24
			})
		});

		const data = await response.json();

		expect(response.ok).toBe(true);
		expect(data.success).toBe(true);
		expect(data.data).toMatch(/^data:image\/png;base64,/);
		expect(data.options?.title).toBe('My Custom Title');
	});

	it('should generate QR without title when title is empty', async () => {
		const response = await fetch(`http://localhost:${serverPort}/generate-qr`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: sessionCookie
			},
			body: JSON.stringify({
				text: 'Test QR',
				format: 'png',
				title: ''
			})
		});

		const data = await response.json();

		expect(response.ok).toBe(true);
		expect(data.success).toBe(true);
		expect(data.options?.title).toBe(undefined);
	});

	it('should automatically create session and generate QR when no session exists', async () => {
		const response = await fetch(`http://localhost:${serverPort}/generate-qr`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				text: 'Test QR',
				format: 'png'
			})
		});

		const data = await response.json();

		expect(response.ok).toBe(true);
		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.data).toMatch(/^data:image\/png;base64,/);
	});

	it('should reinitialize session and generate QR when session cookie is invalid', async () => {
		const response = await fetch(`http://localhost:${serverPort}/generate-qr`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: 'qr_session=invalid_session_id'
			},
			body: JSON.stringify({
				text: 'Test QR',
				format: 'png'
			})
		});

		const data = await response.json();

		expect(response.ok).toBe(true);
		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.data).toMatch(/^data:image\/png;base64,/);
	});
});
