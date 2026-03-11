import React from 'react';

export default function Settings() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-display">Settings</h2>
      
      <form className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1978e5]">person</span> Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <input type="text" defaultValue="admin_user" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white text-sm px-3 py-2 focus:ring-2 focus:ring-[#1978e5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" defaultValue="admin@aegoria.ai" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white text-sm px-3 py-2 focus:ring-2 focus:ring-[#1978e5] outline-none" />
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1978e5]">notifications_active</span> Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Critical Alerts</p>
                <p className="text-xs text-slate-500">Receive immediate emails for high-risk events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1978e5]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">Cancel</button>
          <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-[#1978e5] rounded-lg shadow hover:bg-blue-600 cursor-pointer">Save Changes</button>
        </div>
      </form>
    </div>
  );
}