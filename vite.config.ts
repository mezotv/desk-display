import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    __DESK_DISPLAY_VERSION__: JSON.stringify(
      process.env.DESK_DISPLAY_VERSION ?? packageJson.version,
    ),
  },
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})
