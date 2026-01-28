import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  dev: {
    server: {
      port: 4000,
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'RecallAI',
    version: '1.2.0',
    description: 'Transform educational YouTube videos into summaries and Q&As for better learning.',
    permissions: ['storage', 'tabs', 'sidePanel'],
    host_permissions: [
      'https://www.recallai.io/*',
      'http://localhost:3000/*',
    ],
    externally_connectable: {
      matches: [
        'https://www.recallai.io/*',
        'http://localhost:3000/*',
      ],
    },
    icons: {
      16: 'icons/icon16.png',
      32: 'icons/icon32.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
    action: {
      default_icon: {
        16: 'icons/icon16.png',
        32: 'icons/icon32.png',
        48: 'icons/icon48.png',
      },
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
});
