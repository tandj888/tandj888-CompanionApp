import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGiftStore } from '../stores/giftStore';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft, Trash2, Plus, Gift as GiftIcon } from 'lucide-react';

export default function GiftAdminPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { gifts, addGift, removeGift } = useGiftStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [days, setDays] = useState('');
  const [image, setImage] = useState('🎁');
  const [desc, setDesc] = useState('');

  // Protect Admin Route
  if (user?.role !== 'admin') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-800 mb-2">无权访问</h1>
            <p className="text-gray-500 mb-4">该页面仅限超级管理员访问</p>
            <button 
                onClick={() => navigate('/profile')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
            >
                返回个人中心
            </button>
        </div>
    );
  }

  const handleAdd = () => {
    if (!name || !days || !desc) {
        alert('请完整填写礼品信息');
        return;
    }
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum <= 0) {
        alert('所需天数必须为正整数');
        return;
    }
    addGift(name, daysNum, image, desc);
    setIsAdding(false);
    setName('');
    setDays('');
    setDesc('');
    setImage('🎁');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">礼品管理</h1>
        </div>
        <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm"
        >
            <Plus size={16} /> 新增礼品
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 animate-in slide-in-from-top-4 border border-indigo-100">
            <h3 className="font-bold mb-4">添加新礼品</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">礼品名称</label>
                    <input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="例如：可爱发夹"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">所需打卡天数</label>
                    <input 
                        type="number"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="例如：7"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">礼品图标 (Emoji)</label>
                    <input 
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="例如：🎀"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">描述文案</label>
                    <input 
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="例如：坚持打卡7天可领取"
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">确认添加</button>
                    <button onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg">取消</button>
                </div>
            </div>
        </div>
      )}

      <div className="space-y-3">
        {gifts.map((gift) => (
            <div key={gift.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-2xl">
                        {gift.image}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{gift.name}</h3>
                        <p className="text-xs text-gray-500">需打卡 {gift.requiredDays} 天</p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        if(confirm(`确定删除礼品"${gift.name}"吗？`)) removeGift(gift.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
        {gifts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                <GiftIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>暂无礼品，请点击右上角添加</p>
            </div>
        )}
      </div>
    </div>
  );
}
