import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGiftStore } from '../stores/giftStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft, Award, Star, Clock, ShoppingBag, History, Gift, Sparkles, ChevronRight } from 'lucide-react';
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

  const confirmRedeem = async () => {
    if (!user || !redeemModal.giftId) return;
    
    const result = await redeemGift(user.id, redeemModal.giftId);
    
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
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-20 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex items-center gap-4 text-white">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">兑换中心</h1>
        </div>
      </div>

      {/* Balance Card - Floating */}
      <div className="mx-6 -mt-12 relative z-20 mb-8">
        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-xl shadow-indigo-100/50 border border-white/50 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-60"></div>
            
            <div className="flex justify-between items-end relative z-10">
                <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" /> 当前拥有
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tight">{currentStars}</span>
                        <span className="text-sm font-medium text-gray-400">陪伴星</span>
                    </div>
                </div>
                <div className="text-right pl-8 border-l border-gray-100">
                    <p className="text-gray-500 text-xs font-medium mb-1 flex items-center justify-end gap-1.5 uppercase tracking-wider">
                        <Clock size={12} className="text-indigo-400" /> 连续坚持
                    </p>
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-2xl font-black text-gray-900">{currentStreak}</span>
                        <span className="text-sm font-medium text-gray-400">天</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button 
                onClick={() => setActiveTab('star')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'star' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Sparkles size={16} className={activeTab === 'star' ? 'fill-indigo-600' : ''} /> 星星兑换
            </button>
            <button 
                onClick={() => setActiveTab('streak')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'streak' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Award size={16} className={activeTab === 'streak' ? 'fill-indigo-600' : ''} /> 坚持奖励
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <History size={16} /> 记录
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
                            <div key={gift.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <div className="h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-5xl relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                    <span className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">{gift.image}</span>
                                    
                                    {isStreakType && (
                                        <div className="absolute top-2 right-2 bg-blue-500/10 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-200/50">
                                            坚持奖励
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{gift.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1 leading-relaxed">{gift.description}</p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        {isStreakType ? (
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                {gift.requiredDays}天
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                                                <Star size={12} fill="currentColor" /> {gift.cost}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            余 {gift.stock ?? '∞'}
                                        </span>
                                    </div>

                                    {hasRedeemedStreak ? (
                                        <button disabled className="w-full bg-gray-100 text-gray-400 text-xs py-2.5 rounded-xl font-bold cursor-not-allowed">
                                            已领取
                                        </button>
                                    ) : isOutOfStock ? (
                                        <button disabled className="w-full bg-gray-100 text-gray-400 text-xs py-2.5 rounded-xl font-bold cursor-not-allowed">
                                            已抢光
                                        </button>
                                    ) : isUnlocked ? (
                                        <button 
                                            onClick={() => handleRedeemClick(gift.id)}
                                            className="w-full bg-indigo-600 text-white text-xs py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                                        >
                                            立即兑换
                                        </button>
                                    ) : (
                                        <button disabled className="w-full bg-gray-50 text-gray-400 text-xs py-2.5 rounded-xl font-bold cursor-not-allowed border border-gray-100">
                                            {isStreakType ? `还差 ${Math.max(0, (gift.requiredDays || 0) - currentStreak)} 天` : '星星不足'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {filteredGifts.length === 0 && (
                        <div className="col-span-2 py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">暂无商品上架</p>
                        </div>
                    )}
                </div>
            ) : (
                // History Tab
                <div className="space-y-3">
                    {myRedemptions.length > 0 ? (
                        myRedemptions.map(record => (
                            <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Gift size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{record.giftName}</h4>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            {format(record.timestamp, 'yyyy-MM-dd HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-gray-900 mb-1">
                                        -{record.cost} <span className="text-xs font-normal text-gray-500">星</span>
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${record.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        {record.status === 'completed' ? '已发放' : '处理中'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">暂无兑换记录</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {redeemModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">确认兑换?</h3>
                <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
                    确定要消耗陪伴星或机会兑换该礼品吗？
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setRedeemModal({ isOpen: false, giftId: null })}
                        className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={confirmRedeem}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
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
