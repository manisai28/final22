const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const options = {
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq, req, res) => {
      // Log the request
      console.log(`Proxying ${req.method} request to: ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Proxy error: Could not connect to the backend server');
    },
    proxyTimeout: 30000, // 30 seconds timeout
    timeout: 30000,
  };

  app.use('/auth', createProxyMiddleware({ ...options }));
  app.use('/upload', createProxyMiddleware({ ...options }));
  app.use('/seo', createProxyMiddleware({ ...options }));
  app.use('/history', createProxyMiddleware({ ...options }));
};
