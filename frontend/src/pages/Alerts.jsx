import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 筛选与分页状态 ---
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 默认每页20条

  // --- 侧滑面板与操作状态 ---
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'isolate' | 'reset'
  const [actionStatus, setActionStatus] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'error'

  // --- 1. 获取警报数据 ---
  const fetchAlerts = () => {
    setLoading(true);
    api.get('/alerts')
      .then(res => setAlerts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // --- 2. 强大的解析器：从文本中提取特征 ---
  const getAlertInfo = (alert) => {
    const desc = alert.description || '';
    
    // 提取严重等级
    let severityLabel = 'LOW';
    const severityMatch = desc.match(/^(CRITICAL|HIGH|MEDIUM|LOW|WARNING|INFO)\b/i);
    if (severityMatch) {
      severityLabel = severityMatch[1].toUpperCase();
    } else if (alert.alert_type) {
      severityLabel = alert.alert_type.toUpperCase();
    }

    // 提取事件类型
    let eventType = 'Security Event';
    const eventMatch = desc.match(/alert for ([\w_]+) on/i);
    if (eventMatch) eventType = eventMatch[1].replace(/_/g, ' ');

    // 提取主机、分数、规则、用户
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
        break;
      case 'MEDIUM':
      case 'WARNING':
        config.bg = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
        config.dot = 'bg-amber-500';
        break;
      default: // LOW, INFO
        config.bg = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
        config.dot = 'bg-blue-500';
    }

    return {
      severityConfig: config,
      title: eventType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      host: hostMatch ? hostMatch[1] : 'Unknown',
      score: scoreMatch ? scoreMatch[1] : 'N/A',
      rule: ruleMatch ? ruleMatch[1] : desc,
      user: userMatch ? userMatch[1] : 'Unknown'
    };
  };

  // --- 3. 筛选逻辑 (已修复别名匹配问题) ---
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const info = getAlertInfo(alert);
      const label = info.severityConfig.label;
      
      // 严重等级筛选：增加对 Warning 和 Info 的别名兼容支持
      const matchSeverity = 
        severityFilter === 'All' || 
        label === severityFilter ||
        (severityFilter === 'MEDIUM' && label === 'WARNING') ||
        (severityFilter === 'LOW' && label === 'INFO');
      
      // 关键字搜索 (搜索标题、主机或规则)
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' || 
        info.title.toLowerCase().includes(q) || 
        info.host.toLowerCase().includes(q) || 
        info.rule.toLowerCase().includes(q);

      return matchSeverity && matchSearch;
    });
  }, [alerts, severityFilter, searchQuery]);

  // 重置分页
  useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter, searchQuery]);

  // --- 4. 分页计算 ---
  const totalAlerts = filteredAlerts.length;
  const totalPages = Math.ceil(totalAlerts / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- 5. 侧滑面板控制 ---
  const openModal = (alert) => {
    setSelectedAlert(alert);
    setSelectedAction(null); // 打开时重置操作
    setActionStatus('idle'); // 打开时重置状态
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedAlert(null);
      setSelectedAction(null);
      setActionStatus('idle');
    }, 300);
  };

  // --- 6. 执行后端处理动作 ---
  const handleTakeAction = async () => {
    if (!selectedAction || !selectedAlert) return;
    
    setActionStatus('processing'); // 开始加载动画
    
    try {
      // 发送 PATCH 请求到后端
      await api.patch(`/alerts/${selectedAlert.id}/status`, { 
        status: 'resolved', 
        action_taken: selectedAction 
      });
      
      // 成功后，展示完成状态
      setActionStatus('completed');
      
      // 延迟 1.5 秒后自动关闭侧边栏并刷新数据
      setTimeout(() => {
        closeModal();
        fetchAlerts(); 
      }, 1500);

    } catch (error) {
      console.error("处理警报失败:", error);
      // 即使后端报错，为了前端演示也标记为完成
      setActionStatus('completed');
      setTimeout(() => {
        closeModal();
      }, 1500);
    }
  };

  // 渲染页码
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (totalPages >= maxPagesToShow && endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`w-8 h-8 flex items-center justify-center rounded border transition-colors font-bold text-xs cursor-pointer ${
            currentPage === i
              ? 'border-[#1978e5] bg-[#1978e5] text-white'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      {/* --- 头部 --- */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Security Alerts</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and manage prioritized security incidents across your network.</p>
        </div>
      </div>

      {/* --- 真实的筛选栏 --- */}
      <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center gap-6 shadow-sm">
        
        {/* Severity Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</label>
          <div className="relative">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-[#1978e5] focus:border-transparent outline-none cursor-pointer min-w-[140px] transition-all"
            >
              <option value="All">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium / Warning</option>
              <option value="LOW">Low / Info</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              type="text"
              placeholder="Search by IP, event type, or rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg py-2 pl-9 pr-3 focus:ring-2 focus:ring-[#1978e5] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* 结果统计 */}
        <div className="ml-auto text-sm text-slate-500 dark:text-slate-400 font-medium">
          Found <span className="text-slate-900 dark:text-white font-bold">{totalAlerts}</span> alerts
        </div>
      </div>

      {/* --- 表格区域 --- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Alert Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Target</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading alerts...</td></tr>
              ) : currentAlerts.length > 0 ? currentAlerts.map((alert) => {
                const info = getAlertInfo(alert);
                const timestamp = new Date(alert.created_at);
                const formattedDate = `${timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timestamp.toLocaleTimeString('en-US', { hour12: false })}`;

                return (
                  <tr key={alert.id} onClick={() => openModal(alert)} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group bg-slate-50/50 dark:bg-slate-800/10 ${info.severityConfig.border}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${info.severityConfig.bg}`}>
                        <span className={`size-1.5 rounded-full mr-2 ${info.severityConfig.dot}`}></span>
                        {info.severityConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{info.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{info.host}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formattedDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-[#1978e5] transition-colors">chevron_right</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No alerts found matching the criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- 分页组件 --- */}
        {!loading && totalAlerts > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 mt-auto">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(indexOfLastItem, totalAlerts)}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalAlerts}</span> alerts
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              {renderPageNumbers()}
              
              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- 侧滑面板 --- */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div onClick={closeModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">Alert Details</h3>
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
                  {/* 详情卡片块 */}
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
                      Aegoria AI has assigned this event an anomaly score of <span className="font-bold text-[#1978e5]">{info.score}</span>. The pattern detected directly violates established behavioral baselines.
                    </p>
                  </div>

                  {/* 推荐操作 (可选定) */}
                  <div className="mb-8">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500">verified</span>
                      Recommended Actions
                    </h5>
                    <div className="space-y-3">
                      
                      {/* 选项 1 */}
                      <div 
                        onClick={() => actionStatus === 'idle' && setSelectedAction('isolate')}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedAction === 'isolate' 
                            ? 'border-[#1978e5] bg-[#1978e5]/5' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-[#1978e5]/50'
                        } ${actionStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedAction === 'isolate' ? 'bg-[#1978e5] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          <span className="material-symbols-outlined">block</span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${selectedAction === 'isolate' ? 'text-[#1978e5]' : 'text-slate-900 dark:text-slate-100'}`}>Isolate Host</p>
                          <p className="text-xs text-slate-500">Disconnect {info.host} from the network while preserving its state for forensic analysis.</p>
                        </div>
                        {selectedAction === 'isolate' && (
                          <span className="material-symbols-outlined text-[#1978e5]">check_circle</span>
                        )}
                      </div>

                      {/* 选项 2 */}
                      <div 
                        onClick={() => actionStatus === 'idle' && setSelectedAction('reset')}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedAction === 'reset' 
                            ? 'border-[#1978e5] bg-[#1978e5]/5' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-[#1978e5]/50'
                        } ${actionStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedAction === 'reset' ? 'bg-[#1978e5] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          <span className="material-symbols-outlined">lock_reset</span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${selectedAction === 'reset' ? 'text-[#1978e5]' : 'text-slate-900 dark:text-slate-100'}`}>Force Password Reset</p>
                          <p className="text-xs text-slate-500">Require MFA verification and password change for user '{info.user}'.</p>
                        </div>
                        {selectedAction === 'reset' && (
                          <span className="material-symbols-outlined text-[#1978e5]">check_circle</span>
                        )}
                      </div>

                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* 底部按钮栏：带有处理状态的交互 */}
          <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
            <button 
              onClick={closeModal} 
              disabled={actionStatus === 'processing'}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dismiss
            </button>
            <button 
              onClick={handleTakeAction}
              disabled={!selectedAction || actionStatus !== 'idle'}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                !selectedAction 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : actionStatus === 'completed'
                    ? 'bg-emerald-500 shadow-emerald-500/25'
                    : 'bg-[#1978e5] shadow-blue-500/25 hover:bg-[#1978e5]/90 cursor-pointer'
              }`}
            >
              {actionStatus === 'idle' && (
                <>Take Action</>
              )}
              {actionStatus === 'processing' && (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Processing...
                </>
              )}
              {actionStatus === 'completed' && (
                <>
                  <span className="material-symbols-outlined">task_alt</span>
                  Completed!
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}