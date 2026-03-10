import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Login from './pages/Login';

// 1. 创建全局上下文 (处理语言和主题)
export const AppContext = createContext();

const translations = {
  en: {
    search: 'Search devices, IPs, logs...',
    logout: 'Logout',
    menu_home: 'Dashboard',
    menu_devices: 'Devices',
    menu_logs: 'Logs',
    menu_alerts: 'Alerts',
    menu_settings: 'Settings',
    system_status: 'System Status',
    status_ok: 'All Systems Operational'
  },
  zh: {
    search: '搜索设备、IP、日志...',
    logout: '退出登录',
    menu_home: '仪表盘',
    menu_devices: '设备管理',
    menu_logs: '系统日志',
    menu_alerts: '安全警报',
    menu_settings: '系统设置',
    system_status: '系统状态',
    status_ok: '所有系统运行正常'
  }
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function Layout({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const navigate = useNavigate();
  const t = translations[lang];

  // 初始化主题与语言
  useEffect(() => {
    const isDarkMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: 'grid_view', label: t.menu_home },
    { path: '/devices', icon: 'devices', label: t.menu_devices },
    { path: '/logs', icon: 'receipt_long', label: t.menu_logs },
    { path: '/alerts', icon: 'notifications', label: t.menu_alerts, hasBadge: true },
    { path: '/settings', icon: 'settings', label: t.menu_settings },
  ];

  return (
    // 使用 AppContext 共享翻译函数和状态
    <AppContext.Provider value={{ t, lang, changeLanguage, isDark, toggleTheme }}>
      <div className="bg-[#f6f7f8] dark:bg-[#111821] text-slate-900 dark:text-slate-100 transition-colors duration-200 h-screen overflow-hidden flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors duration-200 z-20">
          <div className="p-6 flex items-center gap-3">
            <div className="size-10 bg-[#1978e5] rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-2xl">shield_lock</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight font-display">Aegoria</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">AI Monitoring System</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                    isActive ? 'bg-[#1978e5] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined transition-transform ${!isActive && 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {item.hasBadge && <span className="absolute right-3 top-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t.system_status}</p>
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.status_ok}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex-1 max-w-xl">
              <div className="relative group flex items-center h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                <input
                  className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-sm focus:ring-0 outline-none placeholder:text-slate-500 dark:text-white"
                  placeholder={t.search}
                  type="text"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              {/* 语言切换 - 修复了间隙导致下拉菜单消失的问题 (增加 padding) */}
              <div className="relative group flex items-center h-full cursor-pointer py-4">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-500 text-xl">language</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang.toUpperCase()}</span>
                </button>
                <div className="absolute right-0 top-[100%] w-32 hidden group-hover:block z-50">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1">
                    <button onClick={() => changeLanguage('en')} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">English</button>
                    <button onClick={() => changeLanguage('zh')} className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">中文</button>
                  </div>
                </div>
              </div>

              {/* 主题切换 */}
              <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-[#1978e5] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              {/* 用户信息与退出 */}
              <div className="relative group flex items-center h-full cursor-pointer py-4">
                 <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Admin User</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Security Lead</p>
                    </div>
                    <div className="size-9 rounded-full bg-blue-500/10 border-2 border-blue-500/20 overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=1978e5&color=fff" alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="absolute right-0 top-[100%] w-32 hidden group-hover:block z-50">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1">
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">logout</span>
                      {t.logout}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar relative page-enter">
            {children}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/devices" element={<ProtectedRoute><Layout><Devices /></Layout></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Layout><Logs /></Layout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Layout><Alerts /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}