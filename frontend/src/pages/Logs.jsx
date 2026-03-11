<<<<<<< HEAD
import React, { useEffect, useState, useMemo } from 'react';
=======
import React, { useEffect, useState } from 'react';
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
import api from '../api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // --- 筛选与分页状态 ---
  const [deviceFilter, setDeviceFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 默认每页20条日志

  // --- 获取数据 ---
=======
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
  useEffect(() => {
    api.get('/logs')
      .then(res => setLogs(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  // --- 动态提取下拉菜单的选项 ---
  const uniqueDevices = useMemo(() => {
    // 兼容 machine_id 或 machineId
    const devices = logs.map(log => log.machine_id || log.machineId).filter(Boolean);
    return ['All', ...new Set(devices)];
  }, [logs]);

  const uniqueEventTypes = useMemo(() => {
    // 兼容 event_type 或 eventType
    const types = logs.map(log => log.event_type || log.eventType).filter(Boolean);
    return ['All', ...new Set(types)];
  }, [logs]);

  // --- 执行筛选逻辑 ---
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDevice = log.machine_id || log.machineId;
      const logEventType = log.event_type || log.eventType;
      
      const matchDevice = deviceFilter === 'All' || logDevice === deviceFilter;
      const matchEventType = eventTypeFilter === 'All' || logEventType === eventTypeFilter;
      return matchDevice && matchEventType;
    });
  }, [logs, deviceFilter, eventTypeFilter]);

  // 当筛选条件改变时，重置回第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [deviceFilter, eventTypeFilter]);

  // --- 分页计算 ---
  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- 辅助工具函数 ---
  
  // 【已修复】更加健壮的时间格式化函数
  const formatTimestamp = (dateValue) => {
    if(!dateValue) return { date: '-', time: '-' };
    try {
      // 修复 SQL 默认返回的 "YYYY-MM-DD HH:MM:SS" 格式，将其转换为 JS Date 能识别的 "YYYY-MM-DDTHH:MM:SS"
      let parsedDate = dateValue;
      if (typeof dateValue === 'string' && dateValue.includes(' ') && !dateValue.includes('T')) {
        parsedDate = dateValue.replace(' ', 'T');
      }
      
      const dt = new Date(parsedDate);
      
      // 如果解析出 Invalid Date，直接返回占位符
      if (isNaN(dt.getTime())) return { date: '-', time: '-' };
      
      return {
        date: dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: dt.toLocaleTimeString('en-US', { hour12: false })
=======
  // 更健壮的时间格式化
  const formatDate = (dateValue) => {
    if(!dateValue) return { date: '-', time: '-' };
    try {
      const dt = new Date(dateValue);
      if (isNaN(dt.getTime())) return { date: '-', time: '-' };
      return {
        date: dt.toLocaleDateString(),
        time: dt.toLocaleTimeString()
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

<<<<<<< HEAD
  // 安全解析 event_message JSON
  const parseAuditMessage = (message) => {
    if (!message) return { summary: 'No details available', user: 'Unknown', source_ip: 'N/A' };
    try {
      const parsed = typeof message === 'string' ? JSON.parse(message) : message;
      return {
        summary: parsed.summary || JSON.stringify(parsed),
        user: parsed.details?.username || 'System',
        source_ip: parsed.details?.source_ip || 'N/A',
        action: parsed.details?.action_type || '',
      };
    } catch (e) {
      return { summary: typeof message === 'string' ? message : 'Invalid data format', user: 'Unknown', source_ip: 'N/A' };
    }
  };

  // 动态匹配事件图标
  const getEventIcon = (eventType = '') => {
    const type = eventType.toLowerCase();
    if (type.includes('login')) return { icon: 'login', color: type.includes('fail') ? 'text-red-500 bg-red-500/10' : 'text-emerald-500 bg-emerald-500/10' };
    if (type.includes('process')) return { icon: 'memory', color: 'text-purple-500 bg-purple-500/10' };
    if (type.includes('network')) return { icon: 'router', color: 'text-blue-500 bg-blue-500/10' };
    if (type.includes('file')) return { icon: 'folder_open', color: 'text-amber-500 bg-amber-500/10' };
    if (type.includes('privilege')) return { icon: 'admin_panel_settings', color: 'text-orange-500 bg-orange-500/10' };
    return { icon: 'history_edu', color: 'text-slate-500 bg-slate-500/10' };
  };

  // 动态页码渲染
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // 日志较多，显示5个页码
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
              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* 头部区域 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">System Activity Logs</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Comprehensive audit trail of automated security responses, system events, and user activities.</p>
      </div>

      {/* 真实的筛选栏 (集成下拉菜单筛选功能) */}
      <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center gap-6 shadow-sm">
        
        {/* Device Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device</label>
          <div className="relative">
            <select 
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-[#1978e5] focus:border-transparent outline-none cursor-pointer min-w-[160px] transition-all"
            >
              {uniqueDevices.map(device => (
                <option key={device} value={device}>{device === 'All' ? 'All Devices' : device}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Type</label>
          <div className="relative">
            <select 
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-[#1978e5] focus:border-transparent outline-none cursor-pointer min-w-[180px] transition-all"
            >
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Events' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="ml-auto text-sm text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="text-slate-900 dark:text-white font-bold">{totalLogs}</span> events
        </div>
      </div>

      {/* 日志详情块 (专为审计设计的致密布局) */}
      <div className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Timestamp</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Event</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Device & Identity</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Audit Details</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading audit logs...</td></tr>
              ) : currentLogs.length > 0 ? currentLogs.map((log) => {
                // 【已修复】增加对驼峰命名和各种时间字段的兼容提取
                const timestampValue = log.event_time || log.eventTime || log.created_at || log.createdAt;
                const { date, time } = formatTimestamp(timestampValue);
                
                const eventType = log.event_type || log.eventType || 'Unknown';
                const eventInfo = getEventIcon(eventType);
                
                const parsedData = parseAuditMessage(log.event_message || log.eventMessage);
                const severity = (log.severity || 'info').toLowerCase();
                const machineId = log.machine_id || log.machineId || 'Unknown Host';

                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    {/* 时间戳 */}
                    <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-400 align-top">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{time}</div>
                      <div className="text-xs text-slate-500">{date}</div>
                    </td>
                    
                    {/* 事件类型 */}
                    <td className="px-5 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <div className={`size-7 rounded flex items-center justify-center ${eventInfo.color}`}>
                          <span className="material-symbols-outlined text-[16px]">{eventInfo.icon}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide">
                          {eventType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    {/* 实体与身份 */}
                    <td className="px-5 py-3 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-slate-400">dns</span>
                          {machineId}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                          <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                          {parsedData.user}
                        </span>
                      </div>
                    </td>

                    {/* 审计细节 (完整句子或 Summary) */}
                    <td className="px-5 py-3 align-top">
                      <div className="text-slate-700 dark:text-slate-300 text-sm truncate max-w-md font-medium" title={parsedData.summary}>
                        {parsedData.summary}
                      </div>
                      {parsedData.source_ip !== 'N/A' && (
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          Src IP: {parsedData.source_ip}
                        </div>
                      )}
                    </td>

                    {/* 严重等级 (精简样式的 Tag) */}
                    <td className="px-5 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50' :
                        severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50' :
                        severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
=======
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
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
                      }`}>
                        {severity}
                      </span>
                    </td>
<<<<<<< HEAD
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No logs found matching the current filters.</td></tr>
=======
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {description}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No logs found.</td></tr>
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
              )}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD

        {/* 翻页组件 */}
        {!loading && totalLogs > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 mt-auto">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(indexOfLastItem, totalLogs)}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalLogs}</span> entries
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
=======
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
      </div>
    </div>
  );
}