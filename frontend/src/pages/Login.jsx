import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 处理登录逻辑
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 假设后端有 /login 接口
      // const response = await api.post('/login', { username, password });
      // localStorage.setItem('aegoria_token', response.data.token);
      
      // 模拟登录成功，直接跳转
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } catch (error) {
      console.error('登录失败', error);
      alert('登录失败，请检查凭据');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex flex-col items-center mb-8">
          {/* 替换为你的自定义 Logo 图片 */}
          <div className="size-16 bg-[#1978e5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 overflow-hidden">
             {/* 如果有自定义 Logo 图片，取消注释并使用 img 标签 */}
             {/* <img src="/your-custom-logo.png" alt="Aegoria Logo" className="w-full h-full object-cover" /> */}
            <span className="material-symbols-outlined text-4xl">shield_lock</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Aegoria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">安全监控系统登录</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1978e5] outline-none dark:text-white transition-all"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#1978e5] outline-none dark:text-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1978e5] hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}