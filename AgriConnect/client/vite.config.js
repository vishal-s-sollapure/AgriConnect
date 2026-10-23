import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: path.join(os.tmpdir(), 'AgriConnect', 'vite-cache'),
  plugins: [react()],
})
