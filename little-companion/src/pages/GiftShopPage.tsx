
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGiftStore } from '../stores/giftStore';
import { useCheckInStore } from '../stores/checkInStore';
import { ArrowLeft, Lock, CheckCircle, Sparkles } from 'lucide-react';

export default function GiftShopPage() {
  const navigate = useNavigate();
  const { gifts } = useGiftStore();
  const { getStreak } = useCheckInStore();
  
  const currentStreak = getStreak();

  const handleRedeem = (giftName: string) => {
    alert(`🎉 兑换成功！\n请截图联系管理员领取"${giftName}"`);
  };

  // Only show streak-based gifts for Time Capsule compatibility
  const streakGifts = gifts.filter(g => g.type === 'streak' || !g.type);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 mb-[-2rem] z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">时光礼品馆</h1>
            <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 pt-12">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-3xl p-6 text-indigo-900 mb-8 shadow-xl shadow-indigo-100/50 border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <p className="opacity-60 mb-1 text-sm font-medium">当前连续坚持</p>
            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold tracking-tight text-indigo-600">{currentStreak}</span>
                <span className="text-sm font-bold text-indigo-400">天</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-indigo-100/50 px-3 py-1.5 rounded-full">
                <Sparkles size={14} className="text-indigo-500" />
                <p className="text-xs font-medium text-indigo-600">
                    坚持打卡，兑换心仪好礼
                </p>
            </div>
          </div>
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-2 gap-4">
          {streakGifts.map((gift) => {
              const requiredDays = gift.requiredDays || 999;
              const isUnlocked = currentStreak >= requiredDays;
              const progress = Math.min(100, (currentStreak / requiredDays) * 100);

              return (
                  <div key={gift.id} className={`bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all duration-300 ${isUnlocked ? 'border-indigo-100 hover:-translate-y-1' : 'border-gray-100 opacity-80'}`}>
                      <div className="text-5xl mb-4 text-center transform hover:scale-110 transition-transform duration-300 cursor-default">{gift.image}</div>
                      <h3 className="font-bold text-gray-800 text-center mb-1">{gift.name}</h3>
                      <p className="text-xs text-gray-400 text-center mb-4 line-clamp-2">{gift.description}</p>
                      
                      {!isUnlocked && (
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                              <div className="bg-indigo-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                          </div>
                      )}

                      {isUnlocked ? (
                          <button 
                              onClick={() => handleRedeem(gift.name)}
                              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                          >
                              <CheckCircle size={14} /> 立即兑换
                          </button>
                      ) : (
                          <button disabled className="w-full bg-gray-50 text-gray-400 text-xs py-2.5 rounded-xl font-medium flex items-center justify-center gap-1.5 cursor-not-allowed border border-gray-100">
                              <Lock size={14} /> 还差 {Math.max(0, requiredDays - currentStreak)} 天
                          </button>
                      )}
                  </div>
              );
          })}
        </div>
      </div>
    </div>
  );
}
