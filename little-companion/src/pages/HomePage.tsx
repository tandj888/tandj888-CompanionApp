import React, { useState } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { Plus, CheckCircle2, Award, List, X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { GoalCard } from '../components/GoalCard';

export default function HomePage() {
  const { goals, categories } = useGoalStore();
  const { checkIn, getTodayCheckIn } = useCheckInStore();
  const { user, addStars } = useUserStore();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [anonymousMsg, setAnonymousMsg] = useState<string | undefined>();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCheckIn = (goalId: string) => {
    checkIn(goalId);
    addStars(1);
    
    setTimeout(() => {
        const today = getTodayCheckIn(goalId);
        if (today?.anonymousLike) {
            setAnonymousMsg(today.anonymousLike);
        }
    }, 0);

    setShowSuccessModal(true);
  };

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === selectedCategory);

  const currentCategoryName = selectedCategory === 'all' 
    ? '全部目标' 
    : categories.find(c => c.id === selectedCategory)?.name || '未知分类';

  return (
    <div className="p-6 pt-12 min-h-screen relative overflow-x-hidden bg-gray-50">
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
                className="p-2 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
            >
                <List size={20} />
            </button>
        </div>
      </div>

      {/* Filter Status */}
      {selectedCategory !== 'all' && (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
                <Filter size={16} />
                <span className="font-medium">{currentCategoryName}</span>
            </div>
            <button 
                onClick={() => setSelectedCategory('all')}
                className="text-sm text-indigo-600 font-medium"
            >
                显示全部
            </button>
        </div>
      )}

      {/* Goals List or Empty State */}
      {goals.length === 0 ? (
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
      ) : filteredGoals.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full">
                <p className="text-gray-500 mb-4">"{currentCategoryName}" 分类下暂无目标</p>
                <button
                    onClick={() => navigate(`/goal/custom?category=${selectedCategory}`)}
                    className="text-indigo-600 font-medium hover:underline"
                >
                    去添加一个？
                </button>
            </div>
         </div>
      ) : (
        <div className="pb-24">
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
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                添加新目标
            </button>
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
                
                <div className="space-y-4">
                    {/* All Goals Option */}
                    <button 
                        onClick={() => {
                            setSelectedCategory('all');
                            setIsCategoryOpen(false);
                        }}
                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-all ${
                            selectedCategory === 'all' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 text-gray-700'
                        }`}
                    >
                         <span className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <span className="font-medium">全部目标</span>
                        </span>
                        {selectedCategory === 'all' && <CheckCircle2 size={18} className="text-indigo-600" />}
                    </button>

                    <div className="h-px bg-gray-100 my-2" />

                    {categories.filter(c => c.id !== 'all').map(cat => (
                        <div key={cat.id}>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setIsCategoryOpen(false);
                                    }}
                                    className={`flex-1 p-4 rounded-xl flex items-center justify-between group transition-all ${
                                        selectedCategory === cat.id ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 text-gray-700'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="font-medium">{cat.name}</span>
                                    </span>
                                    {selectedCategory === cat.id && <CheckCircle2 size={18} className="text-indigo-600" />}
                                </button>
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
