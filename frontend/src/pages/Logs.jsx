import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/logs')
      .then(res => setLogs(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 更健壮的时间格式化
  const formatDate = (dateValue) => {
    if(!dateValue) return { date: '-', time: '-' };
    try {
      const dt = new Date(dateValue);
      if (isNaN(dt.getTime())) return { date: '-', time: '-' };
      return {
        date: dt.toLocaleDateString(),
        time: dt.toLocaleTimeString()
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  // 安全解析 event_message
  const parseDescription = (message) => {
    if (!message) return 'No description available';
    try {
      const parsed = typeof message === 'string' ? JSON.parse(message) : message;
      return parsed.summary || parsed.details?.event_type || JSON.stringify(parsed);
    } catch (e) {
      // 如果不是 JSON，直接返回原始字符串
      return typeof message === 'string' ? message : 'Invalid message format';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">System Activity Logs</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit trail of automated security responses and system events.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Range:</label>
          <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>Last 24 Hours</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Event Type</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Source Device</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                 <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading logs...</td></tr>
              ) : logs.length > 0 ? logs.map((log) => {
                // 兼容后端的各种命名可能
                const timestamp = log.event_time || log.eventTime || log.created_at;
                const { date, time } = formatDate(timestamp);
                const machineId = log.machine_id || log.machineId || 'Unknown Source';
                const severity = (log.severity || 'INFO').toLowerCase();
                const description = parseDescription(log.event_message || log.eventMessage);

                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                      {date}<br/><span className="text-slate-400 text-xs">{time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                        <span className="material-symbols-outlined text-slate-500 text-sm">history_edu</span>
                        {log.event_type || 'Unknown Event'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{machineId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        severity === 'critical' || severity === 'high' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      }`}>
                        {severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {description}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}