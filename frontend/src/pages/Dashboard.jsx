import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    uniqueDevices: 0,
    totalLogs: 0,
    isSecure: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 并发请求日志和警报数据进行实时前端计算
      const [logsRes, alertsRes] = await Promise.all([
        api.get('/logs'),
        api.get('/alerts')
      ]);

      const logsData = logsRes.data || [];
      const alertsData = alertsRes.data || [];

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
              health_and_safety
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-bold ${stats.isSecure ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.isSecure ? 'Secure' : 'At Risk'}
            </p>
            <p className="text-xs text-slate-400 mb-1">
              {stats.isSecure ? 'No active critical threats' : 'Critical threats detected'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Monitored Devices</p>
            <span className="material-symbols-outlined text-[#1978e5] bg-blue-500/10 p-2 rounded-lg">router</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? '-' : stats.uniqueDevices}
            </p>
            <p className="text-xs text-emerald-500 mb-1 font-bold flex items-center">
              <span className="material-symbols-outlined text-xs">trending_up</span> Active
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Total Logs</p>
            <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-lg">data_usage</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
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
    </div>
  );
}