import React, { useEffect, useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useCheckInStore } from '../stores/checkInStore';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReminderManager() {
  const { user, updateUser } = useUserStore();
  const { getTodayCheckIn } = useCheckInStore();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!user?.settings.reminder?.enabled) return;

    const checkReminder = () => {
      const { reminder, supervisor } = user.settings;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const nowTs = Date.now();
      const isCheckedIn = !!getTodayCheckIn();

      // 1. Check Personal Reminder
      if (reminder && reminder.enabled && !isCheckedIn) {
        let shouldRemind = false;
        
        // Check start time
        if (reminder.startTime) {
            const [startHour, startMinute] = reminder.startTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMinute;
            if (currentMinutes >= startMinutes) {
                const lastReminded = reminder.lastReminded || 0;
                const intervalMs = reminder.interval * 60 * 1000;
                if (nowTs - lastReminded >= intervalMs) {
                    shouldRemind = true;
                }
            }
        } else {
             // No start time, just interval
             const lastReminded = reminder.lastReminded || 0;
             const intervalMs = reminder.interval * 60 * 1000;
             if (nowTs - lastReminded >= intervalMs) {
                 shouldRemind = true;
             }
        }

        if (shouldRemind) {
            setShowNotification(true);
            updateUser({
                settings: {
                    ...user.settings,
                    reminder: {
                        ...reminder,
                        lastReminded: nowTs
                    }
                }
            });
        }
      }

      // 2. Check Supervisor Notification
      if (supervisor && supervisor.enabled && supervisor.startTime && supervisor.interval && !isCheckedIn) {
          const [startHour, startMinute] = supervisor.startTime.split(':').map(Number);
          const startMinutes = startHour * 60 + startMinute;
          
          if (currentMinutes >= startMinutes) {
              const lastNotified = supervisor.lastNotified || 0;
              const intervalMs = supervisor.interval * 60 * 1000;
              
              if (nowTs - lastNotified >= intervalMs) {
                  // Trigger Supervisor Notification
                  const msg = `[模拟] 已通过${supervisor.method === 'sms' ? '短信' : 'APP'}通知监督人 ${supervisor.name}：${user.nickname} 还没打卡哦！`;
                  console.log(msg);
                  // In a real app, this would call an API. Here we just update state and maybe show a toast.
                  // For this demo, we'll just update the timestamp to avoid loop, and rely on console log.
                  
                  updateUser({
                    settings: {
                        ...user.settings,
                        supervisor: {
                            ...supervisor,
                            lastNotified: nowTs
                        }
                    }
                });
              }
          }
      }
    };

    // Check every minute
    const timer = setInterval(checkReminder, 60000); 
    
    // Initial check after 3 seconds to simulate push on app open if overdue
    const initialTimer = setTimeout(checkReminder, 3000);

    return () => {
        clearInterval(timer);
        clearTimeout(initialTimer);
    };
  }, [user?.settings.reminder, getTodayCheckIn, updateUser]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-2">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-indigo-100 flex items-start gap-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full shrink-0">
            <Bell size={24} />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-gray-900">该打卡啦！</h3>
            <p className="text-sm text-gray-500 mt-1">
                已经过去 {user?.settings.reminder?.interval} 分钟了，快来完成今天的微目标吧～
            </p>
            <div className="flex gap-3 mt-3">
                <button 
                    onClick={() => {
                        setShowNotification(false);
                        navigate('/');
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-transform"
                >
                    去打卡
                </button>
                <button 
                    onClick={() => setShowNotification(false)}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                >
                    稍后
                </button>
            </div>
        </div>
        <button 
            onClick={() => setShowNotification(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  );
}
