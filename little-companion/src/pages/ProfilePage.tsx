import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useNotificationStore } from '../stores/notificationStore';
import { Settings, ChevronRight, LogOut, Bell, Clock, User as UserIcon, Shield, Gift, Edit2, X, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, updateUser } = useUserStore();
  const { checkIns, getStreak } = useCheckInStore();
  const { notifications } = useNotificationStore();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Profile Edit State
  const [editNickname, setEditNickname] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Reminder State
  const [reminderInterval, setReminderInterval] = useState(user?.settings?.reminder?.interval || 60);
  const [reminderStartTime, setReminderStartTime] = useState(user?.settings?.reminder?.startTime || '09:00');

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  const openProfileEdit = () => {
    if (user) {
        setEditNickname(user.nickname);
        setEditPhone(user.phone || '');
        setShowProfileEdit(true);
    }
  };

  const saveProfile = () => {
    if (!editNickname.trim()) {
        alert('昵称不能为空');
        return;
    }
    updateUser({
        nickname: editNickname,
        phone: editPhone
    });
    setShowProfileEdit(false);
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
        <div className="flex gap-4">
            <button onClick={toggleAdminRole}>
                <Settings size={24} className={user.role === 'admin' ? 'text-indigo-600' : 'text-gray-400'} />
            </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm relative">
        <img src={user.avatar} className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {user.nickname}
            {user.role === 'admin' && <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">管理员</span>}
          </h2>
          <p className="text-sm text-gray-500">UID: {user.id}</p>
          {user.phone && <p className="text-xs text-gray-400 mt-1">手机: {user.phone}</p>}
          <p className="text-sm text-indigo-500 mt-1">陪伴等级 Lv.{user.level}</p>
        </div>
        <button onClick={openProfileEdit} className="absolute right-4 top-4 text-gray-400 p-2">
            <Edit2 size={20} />
        </button>
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
        {/* Creator Center Entry */}
        <button 
          onClick={() => navigate('/creative-center')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl flex justify-between items-center text-white shadow-lg shadow-purple-200 mb-2"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/20 text-white">
                <Edit2 size={20} />
            </div>
            <div className="text-left">
                <p className="font-bold">我的创作中心</p>
                <p className="text-xs opacity-80">查看作品、互动消息与数据</p>
            </div>
          </span>
          <ChevronRight size={20} className="text-white/80" />
        </button>

        {/* My Favorites */}
        <button 
          onClick={() => navigate('/favorites')}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-50 text-yellow-500">
                <Bookmark size={20} />
            </div>
            <span>我的收藏</span>
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button 
          onClick={() => navigate('/notifications')}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-pink-50 text-pink-600 relative">
                <Heart size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </div>
            <span>互动消息</span>
            {unreadCount > 0 && (
                <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount}条未读
                </span>
            )}
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

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

        <button 
          onClick={() => navigate('/redemption-center')}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-gray-700 shadow-sm"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                <Gift size={20} />
            </div>
            <span>兑换中心</span>
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button 
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-xl flex justify-between items-center text-red-500 shadow-sm mt-8"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-50">
                <LogOut size={20} />
            </div>
            <span>退出登录</span>
          </span>
        </button>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">编辑个人资料</h3>
                    <button onClick={() => setShowProfileEdit(false)} className="text-gray-400">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                        <input 
                            type="text" 
                            value={editNickname}
                            onChange={(e) => setEditNickname(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                        <input 
                            type="tel" 
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="请输入手机号码"
                        />
                    </div>
                    <button 
                        onClick={saveProfile}
                        className="w-full bg-indigo-600 text-white p-3 rounded-xl font-medium mt-4"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reminder Settings Modal */}
      {showReminderSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">打卡提醒设置</h3>
                    <button onClick={() => setShowReminderSettings(false)} className="text-gray-400">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">开启提醒</span>
                        <div 
                            onClick={toggleReminder}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${user.settings.reminder?.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${user.settings.reminder?.enabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </div>

                    {user.settings.reminder?.enabled && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                                <input 
                                    type="time" 
                                    value={reminderStartTime}
                                    onChange={(e) => setReminderStartTime(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">提醒间隔 (分钟)</label>
                                <input 
                                    type="number" 
                                    value={reminderInterval}
                                    onChange={(e) => setReminderInterval(Number(e.target.value))}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                                />
                            </div>
                        </>
                    )}

                    <button 
                        onClick={saveReminderSettings}
                        className="w-full bg-indigo-600 text-white p-3 rounded-xl font-medium"
                    >
                        保存设置
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
