import React, { useState } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { Plus, CheckCircle2, Award, List, X, Filter, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { GoalCard } from '../components/GoalCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { getIconForCategory } from '../utils/iconMapper';

export default function HomePage() {
  const { goals, categories, addCategory, removeCategory } = useGoalStore();
  const { checkIn, getTodayCheckIn } = useCheckInStore();
  const { user, addStars } = useUserStore();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentCheckInGoalId, setCurrentCheckInGoalId] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('✨');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
        // Auto-select icon if it's still the default
        const icon = newCategoryIcon === '✨' ? getIconForCategory(newCategoryName.trim()) : newCategoryIcon;
        addCategory(newCategoryName.trim(), icon);
        setNewCategoryName('');
        setNewCategoryIcon('✨');
        setIsAddingCategory(false);
    }
  };


  const handleCheckIn = (goalId: string) => {
    setCurrentCheckInGoalId(goalId);
    checkIn(goalId);
    addStars(1);

    setShowSuccessModal(true);
  };

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === selectedCategory);

  const currentCategoryName = selectedCategory === 'all' 
    ? '全部目标' 
    : categories.find(c => c.id === selectedCategory)?.name || '未知分类';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative overflow-x-hidden">
      {/* Header with Gradient */}
      <div className="bg-indigo-600 pt-12 pb-24 px-6 rounded-b-[3rem] relative overflow-hidden mb-[-4rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-2xl font-bold tracking-wide">
              你好，{user?.nickname}
            </h1>
            <p className="text-indigo-100 text-sm mt-1 opacity-90">
              {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
            </p>
          </div>
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20 shadow-sm">
                  <Award size={16} className="text-yellow-300" />
                  <span>{user?.stars} 星</span>
              </div>
              <button 
                  onClick={() => setIsCategoryOpen(true)}
                  className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors shadow-sm border border-white/20"
              >
                  <List size={20} />
              </button>
          </div>
        </div>
      </div>

      <div className="px-6 relative z-10">
        {/* Filter Status */}
        {selectedCategory !== 'all' && (
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-indigo-50 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Filter size={16} />
                    </div>
                    <span className="font-medium">{currentCategoryName}</span>
                </div>
                <button 
                    onClick={() => setSelectedCategory('all')}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                    显示全部
                </button>
            </div>
        )}

        {/* Goals List or Empty State */}
        {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 text-center w-full">
                <div 
                    onClick={() => navigate('/goal/select')}
                    className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 cursor-pointer shadow-lg shadow-indigo-200 transform transition-transform hover:scale-105"
                >
                    <Plus size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">还没有小目标哦</h2>
                <p className="text-gray-500 mb-6 text-sm">点击右上角分类或下方按钮，开始改变自己</p>
                <button
                    onClick={() => navigate('/goal/select')}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    去设定目标
                </button>
                </div>
            </div>
        ) : filteredGoals.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100/50 w-full border border-white/50">
                    <p className="text-gray-500 mb-4">"{currentCategoryName}" 分类下暂无目标</p>
                    <button
                        onClick={() => navigate(`/goal/custom?category=${selectedCategory}`)}
                        className="text-indigo-600 font-medium hover:underline bg-indigo-50 px-4 py-2 rounded-lg"
                    >
                        去添加一个？
                    </button>
                </div>
             </div>
        ) : (
            <div className="pb-4 space-y-4">
                {filteredGoals.map(goal => (
                    <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        onCheckIn={handleCheckIn} 
                    />
                ))}
                
                {/* Add Goal Button */}
                 <button
                    onClick={() => navigate('/goal/select')}
                    className="w-full mt-4 py-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-3xl text-indigo-400 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    添加新目标
                </button>
            </div>
        )}
      </div>

      {/* Category Drawer */}
      {isCategoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsCategoryOpen(false)} 
            />
            <div className="relative w-72 bg-white/90 backdrop-blur-xl h-full shadow-2xl p-6 animate-in slide-in-from-right duration-300 overflow-y-auto border-l border-white/50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">目标分类</h2>
                    <button 
                        onClick={() => setIsCategoryOpen(false)}
                        className="p-2 hover:bg-gray-100/50 rounded-full text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* All Goals Option */}
                    <button 
                        onClick={() => {
                            setSelectedCategory('all');
                            setIsCategoryOpen(false);
                        }}
                        className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all shadow-sm ${
                            selectedCategory === 'all' 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-200' 
                            : 'bg-white hover:bg-indigo-50 text-gray-700 border border-gray-100'
                        }`}
                    >
                         <span className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <span className="font-medium">全部目标</span>
                        </span>
                        {selectedCategory === 'all' && <CheckCircle2 size={18} className="text-white" />}
                    </button>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                    {categories.filter(c => c.id !== 'all').map(cat => (
                        <div key={cat.id}>
                            <div className="flex items-center gap-2 relative group">
                                <button 
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setIsCategoryOpen(false);
                                    }}
                                    className={`flex-1 p-4 rounded-2xl flex items-center justify-between group transition-all shadow-sm ${
                                        selectedCategory === cat.id 
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-200' 
                                        : 'bg-white hover:bg-indigo-50 text-gray-700 border border-gray-100'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <CategoryIcon icon={cat.icon} className="text-2xl" />
                                        <span className="font-medium">{cat.name}</span>
                                    </span>
                                    {selectedCategory === cat.id && <CheckCircle2 size={18} className="text-indigo-600" />}
                                </button>
                                {/* Delete Custom Category Button */}
                                {cat.isCustom && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(confirm(`确定删除"${cat.name}"分类吗？`)) {
                                                if (selectedCategory === cat.id) setSelectedCategory('all');
                                                removeCategory(cat.id);
                                            }
                                        }}
                                        className="absolute right-14 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                        title="删除分类"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                {/* Quick Add Button for this category */}
                                <button
                                     onClick={() => {
                                        setIsCategoryOpen(false);
                                        navigate(`/goal/custom?category=${cat.id}`);
                                    }}
                                    className="p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"
                                    title={`新增${cat.name}目标`}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add Custom Category Section */}
                    <div className="pt-2">
                        {isAddingCategory ? (
                            <div className="p-4 bg-gray-50 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2">
                                <div className="mb-3">
                                    <input 
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="分类名称"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAddCategory} 
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                                    >
                                        添加
                                    </button>
                                    <button 
                                        onClick={() => setIsAddingCategory(false)} 
                                        className="flex-1 bg-white text-gray-500 py-2 rounded-lg text-sm border hover:bg-gray-50"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                添加自定义分类
                            </button>
                        )}
                    </div>
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
            
           

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/record/add?goalId=${currentCheckInGoalId}`);
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
