import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();

=======
import api from '../api';

export default function Dashboard() {
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
  const [stats, setStats] = useState({
    uniqueDevices: 0,
    totalLogs: 0,
    isSecure: true,
  });
<<<<<<< HEAD
  
  const [chartData, setChartData] = useState([]);
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- 1. 处理过去7天的平滑活动曲线数据 ---
  const processChartData = (logs) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; 
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' }); 
      last7Days.push({ date: dateStr, day: dayStr, events: 0 });
    }

    logs.forEach(log => {
      const logTime = log.event_time || log.eventTime || log.created_at;
      if (!logTime) return;
      const logDate = new Date(logTime).toISOString().split('T')[0];
      const targetDay = last7Days.find(d => d.date === logDate);
      if (targetDay) targetDay.events += 1;
    });

    return last7Days;
  };

  // --- 2. 健壮的警报数据解析 ---
  const processAlerts = (alerts) => {
    let critical = 0, warning = 0, info = 0;
    
    alerts.forEach(alert => {
      const typeStr = String(alert.alert_type || alert.severity || '').toUpperCase();
      const descStr = String(alert.description || '').toUpperCase();

      if (typeStr.includes('CRITICAL') || typeStr.includes('HIGH') || descStr.includes('CRITICAL') || descStr.includes('HIGH')) {
        critical++;
      } else if (typeStr.includes('MEDIUM') || typeStr.includes('WARNING') || descStr.includes('MEDIUM') || descStr.includes('WARNING')) {
        warning++;
      } else {
        info++;
      }
    });

    const total = alerts.length || 1; 
    setAlertStats({
      total: alerts.length,
      critical: Math.round((critical / total) * 100),
      warning: Math.round((warning / total) * 100),
      info: Math.round((info / total) * 100),
    });

    const sortedAlerts = [...alerts].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    setRecentAlerts(sortedAlerts.slice(0, 5));
  };

  // --- 3. 获取并整合核心数据 (加入了对 /devices 的直接请求) ---
  const fetchDashboardData = async () => {
    try {
      // 同时拉取 日志、警报 和 设备 列表
      const [logsRes, alertsRes, devicesRes] = await Promise.all([
        api.get('/logs'),
        api.get('/alerts'),
        api.get('/devices') // <--- 直接获取真实设备总数
=======
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 并发请求日志和警报数据进行实时前端计算
      const [logsRes, alertsRes] = await Promise.all([
        api.get('/logs'),
        api.get('/alerts')
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
      ]);

      const logsData = logsRes.data || [];
      const alertsData = alertsRes.data || [];
<<<<<<< HEAD
      const devicesData = devicesRes.data || [];

      const criticalCount = alertsData.filter(a => {
        const typeStr = String(a.alert_type || a.severity || '').toUpperCase();
        const descStr = String(a.description || '').toUpperCase();
        return typeStr.includes('CRITICAL') || typeStr.includes('HIGH') || descStr.includes('CRITICAL') || descStr.includes('HIGH');
      }).length;

      setStats({
        uniqueDevices: devicesData.length, // <--- 直接使用设备表的数量
        totalLogs: logsData.length,
        isSecure: criticalCount === 0,
      });

      setChartData(processChartData(logsData));
      processAlerts(alertsData);
      
    } catch (error) {
      console.error("无法获取仪表盘数据:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // --- 4. 轮询机制：每秒刷新 ---
  useEffect(() => {
    let isMounted = true;
    const pollData = async () => {
      if (isMounted) await fetchDashboardData();
    };
    pollData();
    const intervalId = setInterval(pollData, 1000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // --- 5. 自定义图表悬浮提示 ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">{label}</p>
          <p className="text-[#1978e5] font-black text-sm">
            {payload[0].value} <span className="text-slate-600 dark:text-slate-300 font-medium">Events</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const pieData = [
    { name: 'Critical', value: alertStats.critical, color: '#f43f5e' }, 
    { name: 'Warning', value: alertStats.warning, color: '#fbbf24' },   
    { name: 'Info', value: alertStats.info, color: '#10b981' },         
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 顶部 KPI 卡片 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/20 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">System Health</p>
            <span className={`material-symbols-outlined p-2 rounded-lg ${stats.isSecure ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
=======

      // 计算去重设备数：假设通过 device_id 或 machine_id 字段
      const deviceSet = new Set(logsData.map(log => log.machine_id || log.device_id).filter(Boolean));
      
      // 检查是否安全：是否存在 critical 级别的未处理警报
      const criticalAlertsCount = alertsData.filter(
        alert => alert.alert_type === 'critical' || alert.severity === 'critical'
      ).length;

      setStats({
        uniqueDevices: deviceSet.size,
        totalLogs: logsData.length,
        isSecure: criticalAlertsCount === 0,
      });
    } catch (error) {
      console.error("无法获取仪表盘数据:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time system insights and performance metrics.</p>
        </div>
        <button onClick={fetchDashboardData} className="bg-[#1978e5] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-sm">{loading ? 'sync' : 'refresh'}</span> 
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">System Health</p>
            <span className={`material-symbols-outlined p-2 rounded-lg ${stats.isSecure ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
              health_and_safety
            </span>
          </div>
          <div className="flex items-end gap-2">
<<<<<<< HEAD
            <p className={`text-3xl font-bold ${stats.isSecure ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stats.isSecure ? 'Secure' : 'At Risk'}
            </p>
            <p className="text-xs text-slate-400 mb-1">
              {stats.isSecure ? 'No active threats' : 'Active critical threats'}
=======
            <p className={`text-3xl font-bold ${stats.isSecure ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.isSecure ? 'Secure' : 'At Risk'}
            </p>
            <p className="text-xs text-slate-400 mb-1">
              {stats.isSecure ? 'No active critical threats' : 'Critical threats detected'}
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
            </p>
          </div>
        </div>

<<<<<<< HEAD
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/20 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Monitored Devices</p>
=======
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Monitored Devices</p>
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
            <span className="material-symbols-outlined text-[#1978e5] bg-blue-500/10 p-2 rounded-lg">router</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
<<<<<<< HEAD
              {initialLoading ? '-' : stats.uniqueDevices.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-500 mb-1 font-medium flex items-center">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> Active
=======
              {loading ? '-' : stats.uniqueDevices}
            </p>
            <p className="text-xs text-emerald-500 mb-1 font-bold flex items-center">
              <span className="material-symbols-outlined text-xs">trending_up</span> Active
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
            </p>
          </div>
        </div>

<<<<<<< HEAD
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/20 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Logs Processed</p>
=======
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Total Logs</p>
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
            <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-lg">data_usage</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
<<<<<<< HEAD
              {initialLoading ? '-' : stats.totalLogs.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mb-1">Events</p>
          </div>
        </div>
      </section>

      {/* 活动曲线图与警报分布 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左侧：平滑面积图 */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/20 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Activity Overview</h3>
              <p className="text-sm text-slate-500">Traffic and threat analysis for the last 7 days</p>
            </div>
            <select className="bg-slate-100 dark:bg-blue-500/5 text-slate-700 dark:text-slate-300 border-none rounded-lg text-xs font-semibold py-1.5 px-3 outline-none cursor-pointer">
              <option>Last 7 Days</option>
            </select>
          </div>
          
          {/* 【修复警告】：使用内联 style 强制设定绝对高度，避免初始化时渲染出负数 */}
          <div style={{ width: '100%', height: '300px' }} className="relative flex-1">
            {initialLoading ? (
               <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                  Loading chart data...
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1978e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1978e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.15} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }} />
                  <Area 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#1978e5" 
                    strokeWidth={3} 
                    fill="url(#chartFill)" 
                    activeDot={{ r: 6, fill: '#1978e5', stroke: '#fff', strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 右侧：真实的警报分布环形图 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/20 p-6 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Alert Distribution</h3>
          <p className="text-sm text-slate-500 mb-8">Severity breakdown</p>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* 【修复警告】：使用内联 style 强制设定长宽 */}
            <div style={{ width: '192px', height: '192px' }} className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{alertStats.total}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Total Alerts</p>
              </div>
            </div>
            
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-rose-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">Critical (High)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{alertStats.critical}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-amber-400"></div>
                  <span className="text-slate-600 dark:text-slate-400">Warning (Med)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{alertStats.warning}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">Informational (Low)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{alertStats.info}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部：最近高危警报表格 */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Alerts</h3>
          <button 
            onClick={() => navigate('/logs')} 
            className="text-[#1978e5] text-sm font-semibold hover:underline cursor-pointer"
          >
            View All Logs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-blue-500/5 text-xs text-slate-500 uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Timestamp</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Target Host</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Detection Event</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Action Status</th>
                <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAlerts.length > 0 ? recentAlerts.map(alert => {
                const ts = new Date(alert.created_at || alert.createdAt);
                
                const desc = String(alert.description || '');
                const hostMatch = desc.match(/on ([\w.-]+)/);
                const host = hostMatch ? hostMatch[1] : 'Network';
                
                const typeStr = String(alert.alert_type || alert.severity || 'INFO').toUpperCase();
                const descStr = desc.toUpperCase();
                
                const isHighRisk = typeStr.includes('CRITICAL') || typeStr.includes('HIGH') || descStr.includes('CRITICAL') || descStr.includes('HIGH');
                
                return (
                  <tr key={alert.id} className="text-sm hover:bg-slate-50 dark:hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {isNaN(ts.getTime()) ? '-' : `${ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${ts.toLocaleTimeString('en-US', { hour12: false })}`}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">{host}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{desc.split('on')[0] || 'Anomaly Detected'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        isHighRisk ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {isHighRisk ? 'Blocked' : 'Flagged'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 font-bold ${isHighRisk ? 'text-rose-500' : 'text-amber-500'}`}>
                        <span className="material-symbols-outlined text-sm">{isHighRisk ? 'priority_high' : 'warning'}</span> 
                        {isHighRisk ? 'HIGH' : 'MEDIUM'}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No recent alerts.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
=======
              {loading ? '-' : stats.totalLogs}
            </p>
            <p className="text-xs text-slate-400 mb-1">Processed</p>
          </div>
        </div>
      </div>

      {/* 原封不动保留的图表占位布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white font-display">Activity Overview (7 Days)</h3>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Events count</span>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between px-2 gap-2">
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[40%]"></div>
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[60%]"></div>
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[30%]"></div>
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[80%]"></div>
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[55%]"></div>
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[45%]"></div>
            <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[70%]"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-bold text-slate-900 dark:text-white w-full mb-4 font-display">Alert Severity</h3>
          <div className="relative size-48">
            <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#ef4444 0% 15%, #f59e0b 15% 45%, #10b981 45% 100%)' }}></div>
            <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">142</span>
              <span className="text-xs text-slate-500 uppercase">Total Alerts</span>
            </div>
          </div>
          <div className="w-full mt-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> High (Critical)</span>
              <span className="font-bold">15%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium (Warning)</span>
              <span className="font-bold">30%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low (Info)</span>
              <span className="font-bold">55%</span>
            </div>
          </div>
        </div>
      </div>
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
    </div>
  );
}