import React, { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function NotificationCenterPage() {
  const { notifications, fetchNotifications, markAllRead, markAsRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={18} className="fill-current" />;
      case 'comment': return <MessageCircle size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-pink-100 text-pink-600';
      case 'comment': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex items-center justify-between text-white mb-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">通知中心</h1>
            <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10">
        {notifications.length > 0 && (
            <div className="flex justify-end mb-3">
                <button 
                    onClick={() => markAllRead()} 
                    className="flex items-center gap-1.5 text-xs text-indigo-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm hover:bg-white transition-colors border border-indigo-50"
                >
                    <CheckCheck size={14} />
                    全部已读
                </button>
            </div>
        )}

        {notifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-lg shadow-indigo-100/50 border border-white/50 mt-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Bell size={32} />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">暂无新通知</h3>
                <p className="text-gray-500 text-sm">这里会显示点赞和评论消息</p>
            </div>
        ) : (
            <div className="space-y-3">
            {notifications.map(n => (
                <div 
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    n.read 
                    ? 'bg-white/60 border-transparent' 
                    : 'bg-white border-indigo-100 shadow-lg shadow-indigo-100/40 transform scale-[1.01]'
                }`}
                >
                <div className={`p-3 rounded-2xl shrink-0 ${getBgColor(n.type)}`}>
                    {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                    <p className={`text-gray-800 text-sm leading-relaxed ${n.read ? 'font-normal' : 'font-medium'}`}>
                        {n.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        {formatDistanceToNow(new Date(n.createdAt || Date.now()), { addSuffix: true, locale: zhCN })}
                    </p>
                </div>
                {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 animate-pulse"></div>
                )}
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
