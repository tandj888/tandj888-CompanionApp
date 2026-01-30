import React, { useEffect, useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useGoalStore } from '../stores/goalStore';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReminderManager() {
  const { user, updateUser } = useUserStore();
  const { goals, updateGoal } = useGoalStore(); // Use goals list
  const { getTodayCheckIn } = useCheckInStore();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const nowTs = Date.now();
      
      // Check each goal
      goals.forEach(goal => {
          const isCheckedIn = !!getTodayCheckIn(goal.id);

          // 1. Check Goal Deadline / Supervisor Notification
          if (goal.deadlineTime && !isCheckedIn) {
              const [deadHour, deadMinute] = goal.deadlineTime.split(':').map(Number);
              const deadMinutes = deadHour * 60 + deadMinute;
              
              if (currentMinutes > deadMinutes) {
                  const lastNotified = goal.lastDeadlineNotified || 0;
                  // Notify every 30 mins if overdue
                  if (nowTs - lastNotified > 30 * 60 * 1000) {
                      // Notify User (Just show one notification for simplicity for now, or queue them)
                      setShowNotification(true);
                      
                      // Notify Supervisor
                      if (goal.supervisor?.enabled && goal.supervisor.notifyOnOverdue) {
                          const msg = `[模拟] 已通过${goal.supervisor.method === 'sms' ? '短信' : 'APP'}通知监督人 ${goal.supervisor.name}：${user?.nickname} 截止 ${goal.deadlineTime} 仍未打卡 ${goal.name}！`;
                          console.log(msg);
                      }

                      // Update goal state to record notification
                      updateGoal(goal.id, {
                          lastDeadlineNotified: nowTs
                      });
                  }
              }
          }
      });
      
      // Global Reminder (Deprecated or fallback)
      // if (user?.settings.reminder?.enabled) { ... }
    };

    const timer = setInterval(checkReminder, 60000); 
    const initialTimer = setTimeout(checkReminder, 3000);

    return () => {
        clearInterval(timer);
        clearTimeout(initialTimer);
    };
  }, [user, goals, getTodayCheckIn, updateGoal]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-2">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-indigo-100 flex items-start gap-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full shrink-0">
            <Bell size={24} />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-gray-900">打卡提醒</h3>
            <p className="text-sm text-gray-500 mt-1">
                你设定的目标时间已过，快去完成吧！
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
                    知道了
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
