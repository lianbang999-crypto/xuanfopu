import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 选佛谱网站构建配置
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
});
