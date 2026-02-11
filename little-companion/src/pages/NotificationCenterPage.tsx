import React, { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bell } from 'lucide-react';
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
      case 'like': return <Heart size={18} />;
      case 'comment': return <MessageCircle size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-pink-50 text-pink-600';
      case 'comment': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="p-6 pt-12 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">通知中心</h1>
        <div className="flex-1" />
        {notifications.length > 0 && (
          <button onClick={() => markAllRead()} className="text-sm text-indigo-600">全部已读</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 text-gray-300" />
          暂无新通知
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div 
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-xl border bg-white flex items-center justify-between ${n.read ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getBgColor(n.type)}`}>
                  {getIcon(n.type)}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{n.content}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(n.createdAt || Date.now()), { addSuffix: true, locale: zhCN })}
                  </p>
                </div>
              </div>
              {!n.read && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600">新</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
