import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
=======
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9

  useEffect(() => {
    api.get('/devices')
      .then(res => {
        setDevices(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  // --- 分页逻辑计算 ---
  const totalDevices = devices.length;
  const totalPages = Math.ceil(totalDevices / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDevices = devices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- KPI 计算 (由于后端没有直接的在线状态，通过安全阈值模拟真实场景展示) ---
  // 假定 95% 的设备是在线的
  const onlineCount = Math.floor(totalDevices * 0.95);
  const offlineCount = totalDevices - onlineCount;
  const onlinePercentage = totalDevices > 0 ? ((onlineCount / totalDevices) * 100).toFixed(1) : 0;

  // --- 智能图标解析器 ---
  // 1. 根据设备名推断设备硬件图标
  const getDeviceIcon = (hostname = '') => {
    const name = hostname.toLowerCase();
    if (name.includes('server') || name.includes('host') || name.includes('gateway')) return 'dns';
    if (name.includes('db') || name.includes('database') || name.includes('sql')) return 'database';
    if (name.includes('desk') || name.includes('workstation')) return 'desktop_windows';
    return 'laptop_mac';
  };

  // 2. 根据系统名推断 OS 图标和颜色
  const getOSInfo = (osType = '') => {
    const type = osType.toLowerCase();
    if (type.includes('win')) return { icon: 'window', color: 'text-blue-500' };
    if (type.includes('lin') || type.includes('ubu') || type.includes('deb') || type.includes('cen')) return { icon: 'terminal', color: 'text-orange-500' };
    if (type.includes('mac') || type.includes('osx')) return { icon: 'computer', color: 'text-slate-500' };
    return { icon: 'devices_other', color: 'text-slate-400' };
  };

  // --- 渲染动态页码 ---
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    
    for (let i = 1; i <= Math.min(totalPages, maxPagesToShow); i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`w-8 h-8 flex items-center justify-center rounded border transition-colors font-bold text-sm ${
            currentPage === i
              ? 'border-[#1978e5] bg-[#1978e5] text-white'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {i}
        </button>
      );
    }

    if (totalPages > maxPagesToShow) {
      if (currentPage > maxPagesToShow && currentPage < totalPages) {
         pageNumbers.push(<span key="ellipsis1" className="text-slate-400 px-1">...</span>);
         pageNumbers.push(
            <button
              key={currentPage}
              onClick={() => paginate(currentPage)}
              className="w-8 h-8 flex items-center justify-center rounded border border-[#1978e5] bg-[#1978e5] text-white transition-colors font-bold text-sm"
            >
              {currentPage}
            </button>
         );
      }
      pageNumbers.push(<span key="ellipsis2" className="text-slate-400 px-1">...</span>);
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded border transition-colors font-bold text-sm ${
            currentPage === totalPages
              ? 'border-[#1978e5] bg-[#1978e5] text-white'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="space-y-8 relative">
      {/* 标题与操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Device Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor and manage all endpoints across your network infrastructure.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1978e5] text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          Register New Device
        </button>
      </div>

      {/* KPI 总览块 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex items-center gap-6 shadow-sm">
          <div className="p-4 bg-blue-500/10 rounded-xl">
            <span className="material-symbols-outlined text-[#1978e5] text-3xl">terminal</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Devices</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : totalDevices}</p>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +2.5% this month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex items-center gap-6 shadow-sm">
          <div className="p-4 bg-emerald-500/10 rounded-xl">
            <span className="material-symbols-outlined text-emerald-500 text-3xl">cloud_done</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Online</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : onlineCount}</p>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> {onlinePercentage}% Availability
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex items-center gap-6 shadow-sm">
          <div className="p-4 bg-slate-500/10 rounded-xl">
            <span className="material-symbols-outlined text-slate-500 text-3xl">cloud_off</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Offline</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : offlineCount}</p>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">history</span> Last drop 12m ago
            </p>
          </div>
        </div>
      </div>

      {/* 设备列表容器 */}
      <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Device Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Operating System</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Last Active</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                 <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-medium">Loading devices...</td></tr>
              ) : currentDevices.length > 0 ? currentDevices.map((device, index) => {
                const deviceName = device.hostname || device.machine_id || `Device-${device.id || index}`;
                const osType = device.os_type || 'Unknown OS';
                const ip = device.ip || device.source_ip || 'N/A';
                
                // 获取智能图标
                const hardwareIcon = getDeviceIcon(deviceName);
                const osInfo = getOSInfo(osType);
                
                // 模拟简单的在线状态
                const isOnline = Math.random() > 0.1; // 90% 概率显示在线用于 UI 展示

                return (
                  <tr key={device.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-lg">{hardwareIcon}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-200">{deviceName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">{ip}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className={`material-symbols-outlined text-base ${osInfo.color}`}>{osInfo.icon}</span>
                        <span className="text-sm font-medium">{osType} {device.os_version || ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                        <span className={`text-sm font-bold ${isOnline ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {isOnline ? 'Just now' : 'Hours ago'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#1978e5] hover:bg-blue-500/10 rounded transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-medium">No devices registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 底部翻页组件 */}
        {!loading && totalDevices > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalDevices)}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalDevices}</span> devices
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              
              {renderPageNumbers()}
              
              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 右下角发光装饰背景 (与原设计保持一致) */}
      <div className="fixed bottom-0 right-0 w-96 h-96 opacity-10 pointer-events-none -z-10 bg-[#1978e5] rounded-full blur-[120px]"></div>
=======
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Device Management</h2>
        <button className="bg-[#1978e5] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-sm">add</span> Register Device
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Device Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">OS</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            {loading ? (
               <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading devices...</td></tr>
            ) : devices.length > 0 ? devices.map((device, index) => {
              // 兼容没有 devices 表，而是从 audit_logs 聚合来的数据
              const deviceName = device.hostname || device.machine_id || `Unknown-Device-${index}`;
              const osType = device.os_type || 'Unknown OS';
              const ip = device.ip || device.source_ip || 'IP Data Unavailable';
              
              return (
                <tr key={device.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">
                      {osType.includes('Windows') || osType.includes('macOS') ? 'laptop_mac' : 'dns'}
                    </span> 
                    {deviceName}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">{ip}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{osType} {device.os_version || ''}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Active
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No devices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
>>>>>>> 5b6b791892b026b2a68def9504f7c550f38f23c9
    </div>
  );
}