#!/usr/bin/env node

/**
 * Development server for JSBSim TypeScript bindings
 *
 * This script serves the browser example and provides:
 * - Static file serving
 * - CORS headers for WebAssembly
 * - Proper MIME types
 * - Auto-reload on file changes
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = path.join(__dirname, '..');

// MIME type mapping
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.wasm': 'application/wasm',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.md': 'text/markdown'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        const mimeType = getMimeType(filePath);
        const headers = {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        };

        // Add cache control for WASM files
        if (mimeType === 'application/wasm') {
            headers['Cache-Control'] = 'no-cache';
        }

        res.writeHead(200, headers);
        res.end(data);
    });
}

function serveDirectory(dirPath, res) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading directory');
            return;
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>JSBSim TypeScript Development Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .files { list-style: none; padding: 0; }
        .files li { margin: 10px 0; }
        .files a { text-decoration: none; color: #0066cc; padding: 5px; }
        .files a:hover { background: #f0f0f0; }
        .example { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .note { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>JSBSim TypeScript Development Server</h1>
        <p>Server running on port ${PORT}</p>
    </div>

    <div class="example">
        <h2>🚀 Quick Start</h2>
        <p><strong>Run the browser example:</strong></p>
        <p><a href="/examples/browser-example.html" style="background: #007bff; color: white; padding: 10px 15px; border-radius: 3px; text-decoration: none;">Open Browser Example</a></p>
    </div>

    <div class="note">
        <h3>⚠️ Note</h3>
        <p>The browser example requires WebAssembly files to be built first. If you see errors:</p>
        <ol>
            <li>Run <code>npm run build:wasm</code> to build the WebAssembly module</li>
            <li>Ensure Emscripten is installed and configured</li>
            <li>Check that aircraft data files are available</li>
        </ol>
    </div>

    <h2>Available Files:</h2>
    <ul class="files">
        ${files.map(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            const isDir = stats.isDirectory();
            const icon = isDir ? '📁' : '📄';
            const href = file + (isDir ? '/' : '');
            return `<li>${icon} <a href="${href}">${file}</a></li>`;
        }).join('')}
    </ul>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
        <p><small>JSBSim TypeScript Development Server - Use Ctrl+C to stop</small></p>
    </div>
</body>
</html>`;

        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(html);
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // Normalize path
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Remove leading slash and resolve path
    const relativePath = pathname.substring(1);
    const fullPath = path.join(ROOT_DIR, relativePath);

    // Security check - ensure path is within ROOT_DIR
    const resolvedPath = path.resolve(fullPath);
    const resolvedRoot = path.resolve(ROOT_DIR);
    if (!resolvedPath.startsWith(resolvedRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Check if file/directory exists
    fs.stat(resolvedPath, (err, stats) => {
        if (err) {
            // If requesting index.html and it doesn't exist, serve directory listing
            if (pathname === '/index.html') {
                serveDirectory(ROOT_DIR, res);
                return;
            }

            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        if (stats.isDirectory()) {
            // Try to serve index.html from directory
            const indexPath = path.join(resolvedPath, 'index.html');
            fs.stat(indexPath, (err, indexStats) => {
                if (!err && indexStats.isFile()) {
                    serveFile(indexPath, res);
                } else {
                    serveDirectory(resolvedPath, res);
                }
            });
        } else {
            serveFile(resolvedPath, res);
        }
    });
});

server.listen(PORT, () => {
    console.log(`
🚀 JSBSim TypeScript Development Server

📍 Server running at: http://localhost:${PORT}
📁 Serving files from: ${ROOT_DIR}

🌐 Browser Example: http://localhost:${PORT}/examples/browser-example.html

💡 Available commands:
   npm run dev        - Build and start dev server
   npm run example    - Same as 'npm run dev'
   npm run serve      - Start server only (no build)
   npm run build:dev  - Build TypeScript only (skip WASM)

⚠️  Note: WebAssembly files must be built with 'npm run build:wasm' first

Press Ctrl+C to stop the server
`);

    // Try to open browser automatically (optional)
    if (process.platform === 'darwin') {
        require('child_process').exec(`open http://localhost:${PORT}/examples/browser-example.html`);
    } else if (process.platform === 'win32') {
        require('child_process').exec(`start http://localhost:${PORT}/examples/browser-example.html`);
    } else {
        // Linux
        require('child_process').exec(`xdg-open http://localhost:${PORT}/examples/browser-example.html`);
    }
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down JSBSim development server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down JSBSim development server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});