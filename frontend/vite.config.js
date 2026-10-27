import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  function cspPlugin() {
    return {
      name: 'csp-inject',
      transformIndexHtml(html) {
        const apiUrl = env.VITE_API_URL || 'http://localhost:5050/api';
        let backendOrigin = 'http://localhost:5050';
        try {
          backendOrigin = new URL(apiUrl).origin;
        } catch {}

        const csp = [
          "default-src 'self'",
          `script-src 'self' ${backendOrigin} https://www.googletagmanager.com 'unsafe-inline'`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          `img-src 'self' data: blob: ${backendOrigin}`,
          "font-src 'self' data: https://fonts.gstatic.com",
          'frame-src https://www.youtube.com https://www.google.com',
          `connect-src 'self' ${backendOrigin}`,
          "media-src 'self'",
          "manifest-src 'self'",
        ].join('; ');

        return html.replace(
          '</head>',
          `  <meta http-equiv="Content-Security-Policy" content="${csp}">\n</head>`,
        );
      },
    };
  }

  return {
    plugins: [react(), tailwindcss(), cspPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5050',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-dom';
              }
              if (
                id.includes('node_modules/react/') ||
                id.includes('react-is')
              ) {
                return 'vendor-react';
              }
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              if (id.includes('@nivo/')) {
                return 'vendor-charts';
              }
              if (id.includes('quill')) {
                return 'vendor-quill';
              }
              if (id.includes('slick-carousel') || id.includes('react-slick')) {
                return 'vendor-carousel';
              }
              if (id.includes('react-data-table-component')) {
                return 'vendor-table';
              }
              if (id.includes('primereact')) {
                return 'vendor-prime';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('react-icons')) {
                return 'vendor-icons';
              }
              if (id.includes('@dnd-kit')) {
                return 'vendor-dnd-kit';
              }
              if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
                return 'vendor-pdf';
              }
              if (id.includes('monaco-editor')) {
                return 'vendor-monaco';
              }
              if (
                id.includes('lightgallery') ||
                id.includes('react-ga4') ||
                id.includes('react-gtm-module')
              ) {
                return 'vendor-utils';
              }
            }
          },
        },
      },
      target: 'es2020',
      chunkSizeWarningLimit: 250,
      cssCodeSplit: true,
    },
  };
});
