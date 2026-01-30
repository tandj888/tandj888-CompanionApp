import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoalStore } from '../stores/goalStore';
import { ArrowLeft, Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { Goal } from '../types';

export default function GoalCustomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const { setGoal, categories, addCategory, removeCategory } = useGoalStore();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState<string>(categoryParam || 'other');
  
  // New time settings
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Frequency settings
  const [frequency, setFrequency] = useState<Goal['frequency']>('daily');
  const [intervalDays, setIntervalDays] = useState('1');

  // Category management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('✨');

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    addCategory(newCategoryName, newCategoryIcon);
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleNext = () => {
    if (!name || !duration) {
      alert('请填写目标名称和单次耗时');
      return;
    }
    if (name.length > 12) {
      alert('目标名称不可超过12字');
      return;
    }
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum > 30 || durationNum <= 0) {
      alert('请设置单次耗时≤30分钟的微目标');
      return;
    }

    // Confirm
    if (confirm(`确定创建目标"${name}"吗？`)) {
        setGoal({
            id: 'goal-' + Date.now(),
            name,
            duration: durationNum,
            category,
            frequency: 'daily',
            templateId: 'custom',
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
        } as Goal);
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">创建自定义目标</h1>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">目标分类</label>
            <button 
                onClick={() => setIsAddingCategory(true)}
                className="text-xs text-indigo-600 flex items-center gap-1"
            >
                <Plus size={14} /> 自定义分类
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <div key={cat.id} className="relative group">
                <button
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    category === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                </button>
                {cat.isCustom && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm(`删除分类"${cat.name}"?`)) removeCategory(cat.id);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={10} />
                    </button>
                )}
              </div>
            ))}
          </div>
          
          {isAddingCategory && (
            <div className="mt-2 p-3 bg-white rounded-xl border border-indigo-100 animate-in slide-in-from-top-2">
                <div className="flex gap-2">
                    <input 
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        className="w-10 p-2 border rounded-lg text-center"
                        placeholder="图标"
                    />
                    <input 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 p-2 border rounded-lg"
                        placeholder="分类名称"
                    />
                    <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-3 rounded-lg text-sm">添加</button>
                    <button onClick={() => setIsAddingCategory(false)} className="text-gray-400 px-2">取消</button>
                </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">目标名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：冥想（1-12字）"
            maxLength={12}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">单次耗时（分钟）</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="例如：5"
            max={30}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-2">建议设置微小目标，更容易坚持哦～</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">打卡频率</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
              <button 
                  onClick={() => setFrequency('daily')}
                  className={`py-2 text-sm rounded-lg border ${frequency === 'daily' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                  每天
              </button>
              <button 
                  onClick={() => setFrequency('alternate')}
                  className={`py-2 text-sm rounded-lg border ${frequency === 'alternate' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                  隔天
              </button>
              <button 
                  onClick={() => setFrequency('custom')}
                  className={`py-2 text-sm rounded-lg border ${frequency === 'custom' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                  自定义间隔
              </button>
          </div>
          {frequency === 'custom' && (
              <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                  <span className="text-sm text-gray-600">每隔</span>
                  <input 
                      type="number" 
                      min="1"
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(e.target.value)}
                      className="w-20 p-2 border rounded-lg text-center"
                  />
                  <span className="text-sm text-gray-600">天打卡一次</span>
              </div>
          )}
        </div>

        <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={18} /> 时间设置 (可选)
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">每日开始时间</label>
                    <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                        <Clock size={14} className="text-gray-400" />
                        <input 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full text-sm outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">每日结束时间</label>
                    <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                        <Clock size={14} className="text-gray-400" />
                        <input 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full text-sm outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors mt-8"
        >
          创建目标
        </button>
      </div>
    </div>
  );
}
