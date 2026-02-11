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
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header Background */}
      <div className="bg-indigo-600 h-48 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="px-6 -mt-32 relative z-10">
        <div className="flex justify-between items-center mb-6 text-white">
            <h1 className="text-2xl font-bold tracking-wide">个人中心</h1>
            <button onClick={toggleAdminRole} className="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Settings size={20} className="text-white" />
            </button>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100/50 mb-6 border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative flex items-center gap-5">
                <div className="relative">
                    <img src={user.avatar} className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md object-cover" />
                    {user.role === 'admin' && (
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full border-2 border-white">
                            <Shield size={12} />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {user.nickname}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-mono">ID: {user.id}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full font-bold">Lv.{user.level}</span>
                        {user.phone && <span className="text-xs text-gray-400">{user.phone}</span>}
                    </div>
                </div>
                <button onClick={openProfileEdit} className="text-gray-400 hover:text-indigo-600 p-2 transition-colors">
                    <Edit2 size={20} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:transform hover:-translate-y-1 transition-transform duration-300">
                <p className="text-2xl font-extrabold text-gray-800">{checkIns.length}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">累计打卡</p>
            </div>
            <div className="bg-white p-5 rounded-2xl text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:transform hover:-translate-y-1 transition-transform duration-300">
                <p className="text-2xl font-extrabold text-gray-800">{getStreak()}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">连续坚持</p>
            </div>
            <div className="bg-white p-5 rounded-2xl text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:transform hover:-translate-y-1 transition-transform duration-300">
                <p className="text-2xl font-extrabold text-yellow-500">{user.stars}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">陪伴星</p>
            </div>
        </div>

        <div className="space-y-4">
            {/* Creator Center Entry */}
            <button 
                onClick={() => navigate('/creative-center')}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 p-1 rounded-2xl shadow-lg shadow-indigo-200 transition-transform active:scale-98"
            >
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex justify-between items-center text-white">
                    <span className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-white/20 text-white shadow-inner">
                            <Edit2 size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">创作中心</p>
                            <p className="text-xs text-white/70">管理作品与查看数据</p>
                        </div>
                    </span>
                    <ChevronRight size={20} className="text-white/60" />
                </div>
            </button>

        {/* My Favorites */}
        <button 
          onClick={() => navigate('/favorites')}
          className="w-full bg-white p-4 rounded-2xl flex justify-between items-center text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
                <Bookmark size={20} />
            </div>
            <span className="font-medium">我的收藏</span>
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button 
          onClick={() => navigate('/notifications')}
          className="w-full bg-white p-4 rounded-2xl flex justify-between items-center text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-500 relative">
                <Heart size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                )}
            </div>
            <span className="font-medium">互动消息</span>
            {unreadCount > 0 && (
                <span className="bg-red-50 text-red-500 text-xs px-2.5 py-1 rounded-full font-bold ml-2">
                    {unreadCount}
                </span>
            )}
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        {/* Reminder Settings Button */}
        <button 
          onClick={() => setShowReminderSettings(true)}
          className="w-full bg-white p-4 rounded-2xl flex justify-between items-center text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${user.settings.reminder?.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                <Bell size={20} />
            </div>
            <span className="font-medium">打卡提醒</span>
          </span>
          <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-medium">
                {user.settings.reminder?.enabled 
                    ? `${user.settings.reminder.startTime}开始` 
                    : '已关闭'}
              </span>
              <ChevronRight size={20} className="text-gray-300" />
          </div>
        </button>

        <button 
          onClick={() => navigate('/badges')}
          className="w-full bg-white p-4 rounded-2xl flex justify-between items-center text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500">
                <Shield size={20} />
            </div>
            <span className="font-medium">我的勋章</span>
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button 
          onClick={() => navigate('/redemption-center')}
          className="w-full bg-white p-4 rounded-2xl flex justify-between items-center text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500">
                <Gift size={20} />
            </div>
            <span className="font-medium">兑换中心</span>
          </span>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button 
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-2xl flex justify-between items-center text-red-500 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-red-50 hover:bg-red-50 transition-colors mt-8"
        >
          <span className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-500">
                <LogOut size={20} />
            </div>
            <span className="font-medium">退出登录</span>
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
