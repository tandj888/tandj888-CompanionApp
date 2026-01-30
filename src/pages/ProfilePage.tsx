import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useCheckInStore } from '../stores/checkInStore';
import { Settings, ChevronRight, LogOut, Bell, Clock, User as UserIcon, Shield, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, updateUser } = useUserStore();
  const { checkIns, getStreak } = useCheckInStore();
  const navigate = useNavigate();
  
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showSupervisorSettings, setShowSupervisorSettings] = useState(false);
  
  // Reminder State
  const [reminderInterval, setReminderInterval] = useState(user?.settings?.reminder?.interval || 60);
  const [reminderStartTime, setReminderStartTime] = useState(user?.settings?.reminder?.startTime || '09:00');

  // Supervisor State
  const [supervisorName, setSupervisorName] = useState(user?.settings?.supervisor?.name || '');
  const [supervisorContact, setSupervisorContact] = useState(user?.settings?.supervisor?.contact || '');
  const [supervisorMethod, setSupervisorMethod] = useState<'sms' | 'app'>(user?.settings?.supervisor?.method || 'app');
  const [supervisorStartTime, setSupervisorStartTime] = useState(user?.settings?.supervisor?.startTime || '20:00');
  const [supervisorInterval, setSupervisorInterval] = useState(user?.settings?.supervisor?.interval || 60);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  const toggleReminder = () => {
    if (!user) return;
    updateUser({
        settings: {
            ...user.settings,
            reminder: {
                ...user.settings.reminder!,
                enabled: !user.settings.reminder?.enabled,
                interval: user.settings.reminder?.interval || 60,
                lastReminded: 0
            }
        }
    });
  };

  const saveReminderSettings = () => {
    if (!user) return;
    if (reminderInterval < 10) {
        alert('提醒间隔最少10分钟');
        return;
    }
    updateUser({
        settings: {
            ...user.settings,
            reminder: {
                ...user.settings.reminder!,
                enabled: true,
                interval: reminderInterval,
                startTime: reminderStartTime,
                lastReminded: 0
            }
        }
    });
    setShowReminderSettings(false);
  };

  const toggleSupervisor = () => {
    if (!user) return;
    updateUser({
        settings: {
            ...user.settings,
            supervisor: {
                ...user.settings.supervisor!,
                enabled: !user.settings.supervisor?.enabled,
                name: supervisorName,
                contact: supervisorContact,
                method: supervisorMethod
            }
        }
    });
  };

  const saveSupervisorSettings = () => {
    if (!user) return;
    if (!supervisorName || !supervisorContact) {
        alert('请填写监督人姓名和联系方式');
        return;
    }
    updateUser({
        settings: {
            ...user.settings,
            supervisor: {
                enabled: true,
                name: supervisorName,
                contact: supervisorContact,
                method: supervisorMethod
            }
        }
    });
    setShowSupervisorSettings(false);
  };

  const toggleAdminRole = () => {
    if (!user) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateUser({ role: newRole });
    alert(`已切换为${newRole === 'admin' ? '超级管理员' : '普通用户'}模式`);
  };

  if (!user) return null;

  return (
    <div className="p-6 pt-12 min-h-screen bg-gray-50 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">个人中心</h1>
        <button onClick={toggleAdminRole}>
            <Settings size={24} className={user.role === 'admin' ? 'text-indigo-600' : 'text-gray-400'} />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <img src={user.avatar} className="w-16 h-16 rounded-full bg-gray-200" />
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {user.nickname}
            {user.role === 'admin' && <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">管理员</span>}
          </h2>
          <p className="text-sm text-gray-500">陪伴等级 Lv.{user.level}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
          <p className="text-xl font-bold text-gray-900">{checkIns.length}</p>
          <p className="text-xs text-gray-500 mt-1">累计打卡</p>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
          <p className="text-xl font-bold text-gray-900">{getStreak()}</p>
          <p className="text-xs text-gray-500 mt-1">连续坚持</p>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
          <p className="text-xl font-bold text-gray-900">{user.stars}</p>
          <p className="text-xs text-gray-500 mt-1">陪伴星</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Reminder Settings Button */}
        <button 
          onClick={() => setShowReminderSettings(true)}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${user.settings.reminder?.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                <Bell size={20} />
            </div>
            <span>打卡提醒</span>
          </span>
          <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {user.settings.reminder?.enabled 
                    ? `${user.settings.reminder.startTime}开始` 
                    : '已关闭'}
              </span>
              <ChevronRight size={20} className="text-gray-300" />
          </div>
        </button>

        {/* Supervisor Settings Button */}
        <button 
          onClick={() => setShowSupervisorSettings(true)}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${user.settings.supervisor?.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                <UserIcon size={20} />
            </div>
            <span>监督人设置</span>
          </span>
          <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {user.settings.supervisor?.enabled 
                    ? user.settings.supervisor.name 
                    : '未设置'}
              </span>
              <ChevronRight size={20} className="text-gray-300" />
          </div>
        </button>

        <button 
          onClick={() => navigate('/badges')}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                <Shield size={20} />
            </div>
            <span>我的勋章</span>
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        {/* Admin Gift Management */}
        {user.role === 'admin' && (
            <button 
            onClick={() => navigate('/admin/gifts')}
            className="w-full bg-indigo-50 p-4 rounded-xl flex justify-between items-center text-indigo-700 shadow-sm border border-indigo-100"
            >
            <span className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                    <Gift size={20} />
                </div>
                <span>礼品管理 (管理员)</span>
            </span>
            <ChevronRight size={20} className="text-indigo-300" />
            </button>
        )}
        
        <button 
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-red-500 mt-4 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-50 text-red-500">
                <LogOut size={20} />
            </div>
            <span>退出登录</span>
          </span>
        </button>
      </div>

      {/* Reminder Settings Modal */}
      {showReminderSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">设置打卡提醒</h3>
                    <button onClick={() => setShowReminderSettings(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="flex items-center justify-between mb-8">
                    <span className="font-medium text-gray-700">开启定时提醒</span>
                    <button 
                        onClick={toggleReminder}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                            user.settings.reminder?.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                            user.settings.reminder?.enabled ? 'left-7' : 'left-1'
                        }`} />
                    </button>
                </div>

                {user.settings.reminder?.enabled && (
                    <div className="mb-8 animate-in slide-in-from-top-2 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">开始提醒时间</label>
                            <input 
                                type="time" 
                                value={reminderStartTime}
                                onChange={(e) => setReminderStartTime(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">提醒间隔（分钟）</label>
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-gray-400" />
                                <input 
                                    type="number" 
                                    value={reminderInterval}
                                    onChange={(e) => setReminderInterval(Number(e.target.value))}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                    min={10}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">打卡完成后，今日将不再推送</p>
                    </div>
                )}

                <button 
                    onClick={saveReminderSettings}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                    保存设置
                </button>
            </div>
        </div>
      )}

      {/* Supervisor Settings Modal */}
      {showSupervisorSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">监督人设置</h3>
                    <button onClick={() => setShowSupervisorSettings(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="flex items-center justify-between mb-8">
                    <span className="font-medium text-gray-700">开启监督功能</span>
                    <button 
                        onClick={toggleSupervisor}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                            user.settings.supervisor?.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                            user.settings.supervisor?.enabled ? 'left-7' : 'left-1'
                        }`} />
                    </button>
                </div>

                {user.settings.supervisor?.enabled && (
                    <div className="mb-8 animate-in slide-in-from-top-2 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">监督人姓名</label>
                            <input 
                                type="text"
                                value={supervisorName}
                                onChange={(e) => setSupervisorName(e.target.value)}
                                placeholder="例如：妈妈"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">联系方式</label>
                            <input 
                                type="text"
                                value={supervisorContact}
                                onChange={(e) => setSupervisorContact(e.target.value)}
                                placeholder="手机号或用户ID"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                                <label className="block text-sm text-gray-500 mb-2">通知方式</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSupervisorMethod('app')}
                                        className={`flex-1 py-2 rounded-lg text-sm border ${
                                            supervisorMethod === 'app' 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                            : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        APP通知
                                    </button>
                                    <button
                                        onClick={() => setSupervisorMethod('sms')}
                                        className={`flex-1 py-2 rounded-lg text-sm border ${
                                            supervisorMethod === 'sms' 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                            : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        短信通知
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-2">开始通知时间</label>
                                    <div className="relative">
                                        <input 
                                            type="time"
                                            value={supervisorStartTime}
                                            onChange={(e) => setSupervisorStartTime(e.target.value)}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <Clock size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-2">通知间隔(分钟)</label>
                                    <input 
                                        type="number"
                                        min="10"
                                        value={supervisorInterval}
                                        onChange={(e) => setSupervisorInterval(parseInt(e.target.value) || 60)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-400">
                                若当日未打卡，将从{supervisorStartTime}开始，每隔{supervisorInterval}分钟通知一次监督人，直到完成打卡。
                            </p>
                    </div>
                )}

                <button 
                    onClick={saveSupervisorSettings}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                    保存设置
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
