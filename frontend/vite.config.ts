import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// 引入 Tailwind CSS 的 Vite 核心插件
import tailwindcss from '@tailwindcss/vite' 

// 导出 Vite 项目配置
export default defineConfig({
  plugins: [
    react(),
    // 注册 Tailwind 插件，由它来接管项目的原子化 CSS 编译
    tailwindcss(), 
  ],
})