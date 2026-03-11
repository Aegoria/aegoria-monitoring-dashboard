import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
<<<<<<< HEAD
import logo from "../logo.png";
=======
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  // 动画与请求状态管理: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [shake, setShake] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setShake(false);

    try {
      // 模拟真实的后端请求延迟，以便展示 Loading 动画
      await new Promise(resolve => setTimeout(resolve, 1200));

      // 取消注释以接入你的真实后端登录接口
      // const response = await api.post('/login', { username, password });
      // localStorage.setItem('aegoria_token', response.data.token);

      // 这里为了演示错误动画，设置一个故意失败的条件 (你可以删除)
      if (password === 'fail') {
        throw new Error('Invalid credentials');
      }

      // 登录成功
      setStatus('success');
      localStorage.setItem('isAuthenticated', 'true');

      // 延迟 1.2 秒跳转，让用户看清楚绿色的成功动画
      setTimeout(() => {
        navigate('/');
      }, 1200);

    } catch (error) {
      console.error('Login failed:', error);
      setStatus('error');
      setShake(true); // 触发抖动动画
      
      // 0.5秒后移除抖动class，以便下次失败能重新触发
      setTimeout(() => setShake(false), 500);
      
      // 3秒后将按钮状态重置回 idle
      setTimeout(() => {
        if (status !== 'success') setStatus('idle');
      }, 3000);
=======
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
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 dark:bg-[#111821] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#1978e5] selection:text-white">
      
      {/* 动态注入的抖动动画 CSS */}
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}
      </style>

      {/* 装饰性背景光晕 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1978e5]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main 
        className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}
      >
        <div className="p-8 sm:p-10">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8 text-center">
              <div className="size-14 bg-[#f3f6f4] rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                          <img src={logo} alt="Aegoria Logo" className="w-full h-full object-cover" />
              </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Please enter your details to sign in to Aegoria.</p>
          </div>

          {/* 错误提示框 */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${status === 'error' ? 'max-h-16 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 flex items-center gap-2 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-base">error</span>
              <p className="text-sm font-bold">Invalid username or password.</p>
            </div>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="username">Username</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1978e5] transition-colors z-10">person</span>
                <input 
                  id="username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1978e5] focus:border-[#1978e5] outline-none dark:text-white transition-all disabled:opacity-50"
                  placeholder="admin_user" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1978e5] transition-colors z-10">lock</span>
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1978e5] focus:border-[#1978e5] outline-none dark:text-white transition-all disabled:opacity-50"
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input 
                  id="remember" 
                  type="checkbox" 
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={status === 'loading' || status === 'success'}
                  className="w-4 h-4 text-[#1978e5] bg-slate-50 border-slate-300 rounded focus:ring-[#1978e5] dark:border-slate-600 dark:bg-slate-700 outline-none cursor-pointer disabled:opacity-50" 
                />
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none" htmlFor="remember">Remember this device</label>
              </div>
              <a href="#" className="text-sm font-bold text-[#1978e5] hover:underline">Forgot password?</a>
            </div>

            {/* 带有动态交互的提交按钮 */}
            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              className={`w-full font-bold py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                status === 'idle' 
                  ? 'bg-[#1978e5] hover:bg-[#1978e5]/90 text-white shadow-blue-500/25 cursor-pointer' 
                : status === 'loading'
                  ? 'bg-[#1978e5]/80 text-white shadow-none cursor-wait'
                : status === 'success'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-red-500 text-white shadow-red-500/30'
              }`}
            >
              {status === 'idle' && (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
              {status === 'loading' && (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Authenticating...
                </>
              )}
              {status === 'success' && (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Access Granted
                </>
              )}
              {status === 'error' && (
                <>
                  Sign In Failed
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Don't have access? 
              <a href="#" className="text-[#1978e5] font-bold hover:underline ml-1">Request Access</a>
            </p>
          </div>
          
        </div>
      </main>
      
      {/* 底部版权信息 */}
      <footer className="absolute bottom-6 text-center text-slate-400 dark:text-slate-600 text-xs font-medium w-full pointer-events-none">
        <p>© {new Date().getFullYear()} Aegoria AI Systems. All rights reserved.</p>
      </footer>
=======
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
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
    </div>
  );
}