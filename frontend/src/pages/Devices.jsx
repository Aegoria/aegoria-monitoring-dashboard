import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/devices')
      .then(res => {
        setDevices(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    </div>
  );
}