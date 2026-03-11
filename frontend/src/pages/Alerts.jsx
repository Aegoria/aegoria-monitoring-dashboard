import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alerts')
      .then(res => setAlerts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openModal = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAlert(null), 300);
  };

  // 强大的解析器：从 "CRITICAL alert for..." 提取真实 Severity
  const getAlertInfo = (alert) => {
    const desc = alert.description || '';
    
    // 1. 尝试从描述中提取真实的严重等级 (如 "CRITICAL alert for...")
    let severityLabel = 'LOW';
    const severityMatch = desc.match(/^(CRITICAL|HIGH|MEDIUM|LOW|WARNING|INFO)\b/i);
    if (severityMatch) {
      severityLabel = severityMatch[1].toUpperCase();
    } else if (alert.alert_type) {
      severityLabel = alert.alert_type.toUpperCase();
    }

    // 2. 提取事件类型 (如 "process_creation")
    let eventType = 'Security Event';
    const eventMatch = desc.match(/alert for ([\w_]+) on/i);
    if (eventMatch) eventType = eventMatch[1].replace(/_/g, ' ');

    // 3. 提取主机/IP、分数、规则等
    const hostMatch = desc.match(/on ([\w.-]+) \(/);
    const scoreMatch = desc.match(/score=([\d.]+)/);
    const ruleMatch = desc.match(/rule=([^)]+)/);
    const userMatch = desc.match(/user=([^,]+)/);

    let config = { bg: '', dot: '', label: severityLabel, border: '' };
    switch (severityLabel) {
      case 'CRITICAL':
        config.bg = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
        config.dot = 'bg-red-600';
        config.border = 'border-l-4 border-l-red-500';
        break;
      case 'HIGH':
        config.bg = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
        config.dot = 'bg-orange-600';
        config.border = '';
        break;
      case 'MEDIUM':
      case 'WARNING':
        config.bg = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
        config.dot = 'bg-slate-400';
        config.border = '';
        break;
      default:
        config.bg = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
        config.dot = 'bg-slate-400';
        config.border = '';
    }

    return {
      severityConfig: config,
      title: eventType.charAt(0).toUpperCase() + eventType.slice(1),
      host: hostMatch ? hostMatch[1] : 'Unknown',
      score: scoreMatch ? scoreMatch[1] : 'N/A',
      rule: ruleMatch ? ruleMatch[1] : desc,
      user: userMatch ? userMatch[1] : 'Unknown'
    };
  };

  return (
    <div className="space-y-6 flex-1">
      {/* 头部布局 */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <nav className="flex text-xs font-medium text-slate-500 mb-2 gap-2">
            <span className="hover:text-[#1978e5] cursor-pointer">Security</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100">Incident Response</span>
          </nav>
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold tracking-tight font-display">Security Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time threat landscape monitoring across all endpoints.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer">
            <span className="material-symbols-outlined text-base">download</span> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1978e5] text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 hover:bg-[#1978e5]/90 cursor-pointer">
            <span className="material-symbols-outlined text-base">filter_list</span> Filter View
          </button>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold cursor-pointer">All Alerts</button>
        <button className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold cursor-pointer">Critical</button>
        <button className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold cursor-pointer">High</button>
        <button className="px-4 py-1.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold cursor-pointer">Resolved</button>
      </div>

      {/* 表格 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Alert Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading alerts...</td></tr>
            ) : alerts.length > 0 ? alerts.map((alert) => {
              const info = getAlertInfo(alert);
              const timestamp = new Date(alert.created_at);
              const formattedDate = `${timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`;

              return (
                <tr key={alert.id} onClick={() => openModal(alert)} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group bg-slate-50 dark:bg-slate-800/10 ${info.severityConfig.border}`}>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${info.severityConfig.bg}`}>
                      {info.severityConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{info.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{info.host}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formattedDate}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${info.severityConfig.label === 'CRITICAL' || info.severityConfig.label === 'HIGH' ? 'text-red-600' : 'text-slate-400'}`}>
                      <span className={`size-1.5 rounded-full ${info.severityConfig.dot}`}></span>
                      {info.severityConfig.label === 'CRITICAL' || info.severityConfig.label === 'HIGH' ? 'Active' : 'Resolved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No alerts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 完美复刻的右侧弹出面板 */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div onClick={closeModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Alert Details</h3>
              {selectedAlert && (
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${getAlertInfo(selectedAlert).severityConfig.bg}`}>
                  {getAlertInfo(selectedAlert).severityConfig.label}
                </span>
              )}
            </div>
            <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            {selectedAlert && (() => {
              const info = getAlertInfo(selectedAlert);
              const timestamp = new Date(selectedAlert.created_at);
              const formattedDate = `${timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${timestamp.toLocaleTimeString('en-US', { hour12: false })}`;

              return (
                <>
                  <div className="mb-8">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {info.title} Detected
                    </h4>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Host / IP</p>
                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{info.host}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{info.user}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formattedDate}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trigger Rule</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={info.rule}>{info.rule}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 p-6 rounded-2xl bg-[#1978e5]/5 border border-[#1978e5]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <span className="material-symbols-outlined text-6xl text-[#1978e5]">psychology</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[#1978e5] text-xl">smart_toy</span>
                      <h5 className="text-sm font-bold text-[#1978e5]">AI Insights</h5>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 relative z-10">
                      Aegoria AI has assigned this event an anomaly score of <span className="font-bold text-[#1978e5]">{info.score}</span>. The pattern detected directly violates established behavioral baselines. The system matched this activity with known MITRE ATT&CK tactics.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500">verified</span>
                      Recommended Actions
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1978e5]/50 transition-colors group cursor-pointer">
                        <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-[#1978e5] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined">block</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Isolate Host</p>
                          <p className="text-xs text-slate-500">Disconnect {info.host} from the network while preserving its state for forensic analysis.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#1978e5]/50 transition-colors group cursor-pointer">
                        <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-[#1978e5] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined">lock_reset</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Force Password Reset</p>
                          <p className="text-xs text-slate-500">Require MFA verification and password change for user '{info.user}'.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
            <button onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Dismiss
            </button>
            <button className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#1978e5] shadow-lg shadow-blue-500/25 hover:bg-[#1978e5]/90 transition-colors cursor-pointer">
              Take Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}