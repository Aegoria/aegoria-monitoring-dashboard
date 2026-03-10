import React from 'react'
import ReactDOM from 'react-dom/client'

// 1. 忽略引入 .jsx 文件的 TypeScript 类型警告
// @ts-ignore
import App from './App'
import './index.css'

// 2. 在 getElementById('root') 后面加上一个感叹号 (!)
// 这在 TypeScript 中叫做“非空断言”，意思是向 TS 保证："我确定这个 root 节点一定存在，绝对不是 null"
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)