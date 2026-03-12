import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    uniqueDevices: 0,
    totalLogs: 0,
    isSecure: true,
    riskScore: 0,
    riskLevel: 'unknown',
    systemHealth: 'unknown',
  });
  const [latestReport, setLatestReport] = useState(null);
  const [eventDist, setEventDist] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch reports, logs, and alerts in parallel
      const [reportsRes, logsRes, alertsRes] = await Promise.all([
        api.get('/reports').catch(() => ({ data: [] })),
        api.get('/logs'),
        api.get('/alerts')
      ]);

      const reports = reportsRes.data || [];
      const logsData = logsRes.data || [];
      const alertsData = alertsRes.data || [];

      const deviceSet = new Set(logsData.map(log => log.machine_id || log.device_id).filter(Boolean));

      const criticalAlertsCount = alertsData.filter(
        alert => alert.alert_type === 'critical' || alert.severity === 'critical'
      ).length;

      // Use latest report data if available
      const latest = reports.length > 0 ? reports[0] : null;
      setLatestReport(latest);

      if (latest) {
        setStats({
          uniqueDevices: deviceSet.size,
          totalLogs: logsData.length,
          isSecure: (latest.risk_level || '').toLowerCase() !== 'critical' && (latest.risk_level || '').toLowerCase() !== 'high',
          riskScore: latest.risk_score || 0,
          riskLevel: latest.risk_level || 'unknown',
          systemHealth: latest.risk_level || 'unknown',
        });
        setEventDist(latest.event_distribution || {});
      } else {
        setStats({
          uniqueDevices: deviceSet.size,
          totalLogs: logsData.length,
          isSecure: criticalAlertsCount === 0,
          riskScore: 0,
          riskLevel: 'unknown',
          systemHealth: 'unknown',
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const riskColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-slate-400';
    }
  };

  // Build bar chart data from event distribution
  const distEntries = Object.entries(eventDist).sort((a, b) => b[1] - a[1]);
  const maxCount = distEntries.length > 0 ? Math.max(...distEntries.map(e => e[1])) : 1;

  // AI analysis from latest report
  const aiAnalysis = latestReport?.ai_analysis || {};

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Risk Score</p>
            <span className={`material-symbols-outlined p-2 rounded-lg ${riskColor(stats.riskLevel)} bg-opacity-10`}>
              shield
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className={`text-3xl font-bold ${riskColor(stats.riskLevel)}`}>
              {loading ? '-' : stats.riskScore}
            </p>
            <p className={`text-xs mb-1 font-bold uppercase ${riskColor(stats.riskLevel)}`}>
              {stats.riskLevel}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white font-display">Event Distribution</h3>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Events count</span>
          </div>
          {distEntries.length > 0 ? (
            <div className="space-y-3">
              {distEntries.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-32 truncate text-right">{type}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-[#1978e5] h-full rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-10">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-64 w-full flex items-end justify-between px-2 gap-2">
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[40%]"></div>
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[60%]"></div>
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[30%]"></div>
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[80%]"></div>
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[55%]"></div>
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[45%]"></div>
              <div className="w-full bg-[#1978e5]/20 hover:bg-[#1978e5]/40 transition-colors rounded-t-sm h-[70%]"></div>
            </div>
          )}
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 font-display">AI Analysis</h3>
          {aiAnalysis.ai_threat_score !== undefined ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className={`text-4xl font-black ${
                  aiAnalysis.ai_threat_score >= 0.8 ? 'text-red-500' :
                  aiAnalysis.ai_threat_score >= 0.5 ? 'text-orange-500' :
                  aiAnalysis.ai_threat_score >= 0.2 ? 'text-yellow-500' :
                  'text-emerald-500'
                }`}>
                  {(aiAnalysis.ai_threat_score * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-slate-500 uppercase mt-1">Threat Score</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Classification</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {(aiAnalysis.ai_threat_classification || 'N/A').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Confidence</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {((aiAnalysis.confidence_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Model</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    v{aiAnalysis.model_version || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Alerts</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(aiAnalysis.alerts || []).length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">smart_toy</span>
              <p className="text-sm text-slate-400">No AI analysis available yet</p>
              <p className="text-xs text-slate-400 mt-1">Run the pipeline to generate analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
