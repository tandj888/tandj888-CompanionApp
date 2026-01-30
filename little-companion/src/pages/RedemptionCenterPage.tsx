import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGiftStore } from '../stores/giftStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft, Lock, CheckCircle, Award, Star, Clock, ShoppingBag, History } from 'lucide-react';
import { format } from 'date-fns';

export default function RedemptionCenterPage() {
  const navigate = useNavigate();
  const { gifts, redemptions, redeemGift } = useGiftStore();
  const { getStreak } = useCheckInStore();
  const { user } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<'star' | 'streak' | 'history'>('star');
  const [redeemModal, setRedeemModal] = useState<{ isOpen: boolean; giftId: string | null }>({ isOpen: false, giftId: null });

  const currentStreak = getStreak();
  const currentStars = user?.stars || 0;

  const handleRedeemClick = (giftId: string) => {
    setRedeemModal({ isOpen: true, giftId });
  };

  const confirmRedeem = () => {
    if (!user || !redeemModal.giftId) return;
    
    const result = redeemGift(user.id, redeemModal.giftId);
    
    if (result.success) {
      setRedeemModal({ isOpen: false, giftId: null });
      alert('🎉 兑换成功！请在“兑换记录”中查看详情');
    } else {
      alert(`❌ 兑换失败: ${result.message}`);
    }
  };

  const filteredGifts = gifts.filter(g => {
    if (activeTab === 'star') return g.type === 'star';
    if (activeTab === 'streak') return g.type === 'streak';
    return false;
  });

  const myRedemptions = redemptions
    .filter(r => r.userId === user?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const getRedeemStatus = (giftId: string) => {
    return redemptions.some(r => r.userId === user?.id && r.giftId === giftId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">兑换中心</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShoppingBag size={120} />
        </div>
        
        <div className="flex justify-between items-end relative z-10">
            <div>
                <p className="opacity-80 text-sm mb-1 flex items-center gap-1">
                    <Star size={14} className="text-yellow-300" /> 当前拥有陪伴星
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{currentStars}</span>
                    <span className="text-sm opacity-80">颗</span>
                </div>
            </div>
            <div className="text-right">
                <p className="opacity-80 text-sm mb-1 flex items-center justify-end gap-1">
                    <Clock size={14} className="text-blue-300" /> 连续坚持
                </p>
                <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-2xl font-bold">{currentStreak}</span>
                    <span className="text-sm opacity-80">天</span>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl mb-6 shadow-sm border border-gray-100">
        <button 
            onClick={() => setActiveTab('star')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'star' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <ShoppingBag size={16} /> 星星兑换
        </button>
        <button 
            onClick={() => setActiveTab('streak')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'streak' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <Award size={16} /> 坚持奖励
        </button>
        <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <History size={16} /> 兑换记录
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab !== 'history' ? (
            <div className="grid grid-cols-2 gap-4">
                {filteredGifts.map((gift) => {
                    const isStreakType = gift.type === 'streak';
                    const isUnlocked = isStreakType 
                        ? currentStreak >= (gift.requiredDays || 0) 
                        : currentStars >= (gift.cost || 0);
                    
                    const hasRedeemedStreak = isStreakType && getRedeemStatus(gift.id);
                    const isOutOfStock = gift.stock !== undefined && gift.stock <= 0;
                    
                    return (
                        <div key={gift.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                            <div className="h-24 bg-gray-50 flex items-center justify-center text-4xl">
                                {gift.image}
                            </div>
                            <div className="p-3 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{gift.name}</h3>
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{gift.description}</p>
                                
                                <div className="flex items-center justify-between mb-3">
                                    {isStreakType ? (
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            坚持{gift.requiredDays}天
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                            <Star size={12} fill="currentColor" /> {gift.cost}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-400">
                                        余 {gift.stock ?? '∞'}
                                    </span>
                                </div>

                                {hasRedeemedStreak ? (
                                    <button disabled className="w-full bg-gray-100 text-gray-400 text-xs py-2 rounded-lg font-medium cursor-not-allowed">
                                        已领取
                                    </button>
                                ) : isOutOfStock ? (
                                    <button disabled className="w-full bg-gray-100 text-gray-400 text-xs py-2 rounded-lg font-medium cursor-not-allowed">
                                        已抢光
                                    </button>
                                ) : isUnlocked ? (
                                    <button 
                                        onClick={() => handleRedeemClick(gift.id)}
                                        className="w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors"
                                    >
                                        立即兑换
                                    </button>
                                ) : (
                                    <button disabled className="w-full bg-gray-50 text-gray-400 text-xs py-2 rounded-lg font-medium cursor-not-allowed border border-gray-100">
                                        {isStreakType ? `还差 ${Math.max(0, (gift.requiredDays || 0) - currentStreak)} 天` : '陪伴星不足'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filteredGifts.length === 0 && (
                    <div className="col-span-2 py-10 text-center text-gray-400 text-sm">
                        暂无商品
                    </div>
                )}
            </div>
        ) : (
            // History Tab
            <div className="space-y-3">
                {myRedemptions.length > 0 ? (
                    myRedemptions.map(record => (
                        <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">{record.giftName}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {format(record.timestamp, 'yyyy-MM-dd HH:mm')}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-medium text-amber-600 mb-1">
                                    -{record.cost} 星
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${record.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                    {record.status === 'completed' ? '已发放' : '处理中'}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                        暂无兑换记录
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {redeemModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">确认兑换?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    确定要消耗陪伴星/机会兑换该礼品吗？
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setRedeemModal({ isOpen: false, giftId: null })}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium"
                    >
                        取消
                    </button>
                    <button 
                        onClick={confirmRedeem}
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium"
                    >
                        确认兑换
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
