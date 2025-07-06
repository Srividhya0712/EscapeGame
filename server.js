#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const PORT = 5000;
const GAME_DIR = path.join(__dirname, 'game');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('404 - File Not Found');
      } else {
        res.statusCode = 500;
        res.end('500 - Internal Server Error');
      }
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/plain';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 200;
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = url.pathname;
    
    // Handle root path
    if (pathname === '/') {
      pathname = '/index.html';
    }
    
    // Build full file path
    const filePath = path.join(GAME_DIR, pathname);
    
    // Security check - ensure the path is within the game directory
    if (!filePath.startsWith(GAME_DIR)) {
      res.statusCode = 403;
      res.end('403 - Forbidden');
      return;
    }
    
    // Check if file exists
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.statusCode = 404;
        res.end('404 - File Not Found');
        return;
      }
      
      if (stats.isFile()) {
        serveFile(filePath, res);
      } else {
        res.statusCode = 404;
        res.end('404 - Not Found');
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.end('500 - Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Digital Maze Game Server running on:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://0.0.0.0:${PORT}`);
  console.log(`\n📁 Serving from: ${GAME_DIR}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});