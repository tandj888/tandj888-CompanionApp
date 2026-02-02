import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGiftStore } from '../stores/giftStore';
import { useCheckInStore } from '../stores/checkInStore';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">时光礼品馆</h1>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-indigo-200">
        <p className="opacity-80 mb-1">当前连续坚持</p>
        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{currentStreak}</span>
            <span className="text-sm">天</span>
        </div>
        <p className="text-sm mt-4 opacity-90 bg-white/20 inline-block px-3 py-1 rounded-full">
            坚持打卡，兑换心仪好礼 ✨
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {streakGifts.map((gift) => {
            const requiredDays = gift.requiredDays || 999;
            const isUnlocked = currentStreak >= requiredDays;
            const progress = Math.min(100, (currentStreak / requiredDays) * 100);

            return (
                <div key={gift.id} className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${isUnlocked ? 'border-indigo-100 hover:border-indigo-300' : 'border-transparent opacity-80'}`}>
                    <div className="text-4xl mb-3 text-center">{gift.image}</div>
                    <h3 className="font-bold text-gray-800 text-center mb-1">{gift.name}</h3>
                    <p className="text-xs text-gray-500 text-center mb-3">{gift.description}</p>
                    
                    {!isUnlocked && (
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    {isUnlocked ? (
                        <button 
                            onClick={() => handleRedeem(gift.id, gift.name)}
                            className="w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                        >
                            <CheckCircle size={12} /> 立即兑换
                        </button>
                    ) : (
                        <button disabled className="w-full bg-gray-100 text-gray-400 text-xs py-2 rounded-lg font-medium flex items-center justify-center gap-1 cursor-not-allowed">
                            <Lock size={12} /> 还差 {Math.max(0, requiredDays - currentStreak)} 天
                        </button>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}
