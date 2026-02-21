import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// @ts-ignore
import groqHandler from './api/groq';

const groqProxyPlugin = () => {
  return {
    name: 'groq-proxy',
    configureServer(server) {
      server.middlewares.use('/api/groq', async (req: any, res: any, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          // Parse body
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString();
          const body = JSON.parse(rawBody || '{}');
          req.body = body;

          // Mock response object for Vercel-like syntax: res.status(n).json(obj)
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          await groqHandler(req, res);
        } catch (error) {
          console.error('Proxy Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Proxy Error' }));
        }
      });
    }
  };
};

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Assign to process.env so api/groq.ts can access it
  Object.assign(process.env, env);

  return {
    plugins: [react({ jsxRuntime: 'automatic' }), groqProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      allowedHosts: true,
    }
  };
});
