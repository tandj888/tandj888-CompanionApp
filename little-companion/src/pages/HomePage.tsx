import React, { useState } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { Plus, CheckCircle2, Award, ChevronRight, List, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function HomePage() {
  const { currentGoal } = useGoalStore();
  const { checkIn, getTodayCheckIn, getStreak } = useCheckInStore();
  const { user, addStars } = useUserStore();
  const navigate = useNavigate();
  
  const todayCheckIn = getTodayCheckIn();
  const isCheckedIn = !!todayCheckIn;
  const streak = getStreak();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [anonymousMsg, setAnonymousMsg] = useState<string | undefined>();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const CATEGORIES = [
    { id: 'water', name: '喝水', icon: '💧' },
    { id: 'reading', name: '阅读', icon: '📚' },
    { id: 'exercise', name: '运动', icon: '🏃' },
    { id: 'sleep', name: '作息', icon: '😴' },
    { id: 'other', name: '其他', icon: '✨' },
  ];

  const handleCheckIn = () => {
    if (!currentGoal) return;
    checkIn(currentGoal.id);
    addStars(1);
    
    setTimeout(() => {
        const today = getTodayCheckIn();
        if (today?.anonymousLike) {
            setAnonymousMsg(today.anonymousLike);
        }
    }, 0);

    setShowSuccessModal(true);
  };

  return (
    <div className="p-6 pt-12 min-h-screen relative overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            你好，{user?.nickname}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-medium">
                <Award size={16} />
                <span>{user?.stars} 星</span>
            </div>
            <button 
                onClick={() => setIsCategoryOpen(true)}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
            >
                <List size={20} />
            </button>
        </div>
      </div>

      {/* Goal Card or Empty State */}
      {!currentGoal ? (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center w-full">
            <div 
                onClick={() => navigate('/goal/select')}
                className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-indigo-200 transition-colors"
            >
                <Plus size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">还没有小目标哦</h2>
            <p className="text-gray-500 mb-6">点击右上角分类或下方按钮，开始改变自己</p>
            <button
                onClick={() => navigate('/goal/select')}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
                去设定目标
            </button>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
            <div>
                <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md mb-2 font-medium">
                当前目标
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{currentGoal.name}</h2>
                <p className="text-gray-500 text-sm mt-1">
                每次耗时 {currentGoal.duration} 分钟
                </p>
            </div>
            <div className="text-center bg-gray-50 px-3 py-2 rounded-xl">
                <p className="text-2xl font-bold text-indigo-600">{streak}</p>
                <p className="text-xs text-gray-400">连续坚持</p>
            </div>
            </div>

            {currentGoal.rewards && currentGoal.rewards.length > 0 && (
                <div className="mb-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <Gift size={12} /> 连续打卡奖励
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {currentGoal.rewards.map(reward => {
                            const isUnlocked = streak >= reward.days;
                            return (
                                <div 
                                    key={reward.id} 
                                    className={`flex-shrink-0 border px-3 py-2 rounded-xl flex items-center gap-2 min-w-[100px] transition-colors ${
                                        isUnlocked 
                                        ? 'bg-yellow-50 border-yellow-200' 
                                        : 'bg-pink-50 border-pink-100'
                                    }`}
                                >
                                    <span className="text-xl">{reward.icon}</span>
                                    <div>
                                        <p className={`text-xs font-bold ${isUnlocked ? 'text-yellow-700' : 'text-pink-600'}`}>
                                            {reward.name}
                                        </p>
                                        <p className={`text-[10px] ${isUnlocked ? 'text-yellow-600' : 'text-pink-400'}`}>
                                            {isUnlocked ? '已达成' : `${reward.days}天`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {isCheckedIn ? (
            <button
                disabled
                className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 cursor-not-allowed"
            >
                <CheckCircle2 size={20} />
                今日已打卡
            </button>
            ) : (
            <button
                onClick={handleCheckIn}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
                <CheckCircle2 size={24} />
                完成打卡
            </button>
            )}
        </div>
      )}

      {/* Category Drawer */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsCategoryOpen(false)} 
            />
            <div className="relative w-72 bg-white h-full shadow-2xl p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">目标分类</h2>
                    <button 
                        onClick={() => setIsCategoryOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {CATEGORIES.map(cat => (
                        <div key={cat.id}>
                            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                {cat.name}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsCategoryOpen(false);
                                    navigate(`/goal/custom?category=${cat.id}`);
                                }}
                                className="w-full bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 p-4 rounded-xl flex items-center justify-between group transition-all"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                                        新增{cat.name}目标
                                    </span>
                                </span>
                                <Plus size={18} className="text-gray-300 group-hover:text-indigo-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">打卡成功！</h3>
            <p className="text-gray-500 mb-8">
              你真棒～ 获得 1 颗陪伴星
            </p>
            
            {anonymousMsg && (
                <div className="bg-amber-50 text-amber-600 p-4 rounded-xl mb-6 text-sm font-medium animate-in slide-in-from-bottom-2">
                    <p>💌 收到一个匿名小赞：</p>
                    <p className="mt-1">"{anonymousMsg}"</p>
                </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/record/add');
                }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium"
              >
                添加微记录
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-50 text-gray-600 py-3 rounded-xl font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
