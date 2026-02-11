import React from 'react';
import { useGoalStore, GOAL_TEMPLATES } from '../stores/goalStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, Zap, Clock, Repeat } from 'lucide-react';
import { Goal } from '../types';

export default function GoalSelectPage() {
  const setGoal = useGoalStore((state) => state.setGoal);
  const navigate = useNavigate();

  const handleSelect = async (template: Omit<Goal, 'id'>) => {
    if (confirm(`确定要选择目标"${template.name}"吗？`)) {
      try {
          await setGoal({
            ...template,
            id: 'goal-' + Date.now(),
          } as Goal);
          navigate('/');
      } catch (e: any) {
          console.error('Create goal error:', e);
          alert(e.message || '创建失败，请检查网络');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex items-center gap-4 text-white">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-xl font-bold tracking-wide">选择微目标</h1>
                <p className="text-indigo-100 text-xs mt-0.5 opacity-90">选择一个模板开始你的旅程</p>
            </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-4">
        {/* Templates */}
        {GOAL_TEMPLATES.map((tpl, index) => (
          <div
            key={index}
            onClick={() => handleSelect(tpl)}
            className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-white/50 flex justify-between items-center cursor-pointer hover:shadow-md hover:shadow-indigo-100 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Target size={16} />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{tpl.name}</h3>
              </div>
              <div className="flex gap-2 pl-10">
                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg flex items-center gap-1">
                   <Clock size={10} />
                   {tpl.duration}分钟
                 </span>
                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg flex items-center gap-1">
                   <Repeat size={10} />
                   {tpl.frequency === 'daily' ? '每日' : '其他'}
                 </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
              <Plus size={20} />
            </div>
          </div>
        ))}

        {/* Custom Goal Button */}
        <div
            onClick={() => navigate('/goal/custom')}
            className="mt-6 border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-5 rounded-3xl flex flex-col items-center justify-center text-indigo-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-1">
                <Zap size={24} className="fill-current" />
            </div>
            <span className="font-medium">自定义目标</span>
            <span className="text-xs opacity-70">创建一个完全属于你的目标</span>
        </div>
      </div>
    </div>
  );
}
