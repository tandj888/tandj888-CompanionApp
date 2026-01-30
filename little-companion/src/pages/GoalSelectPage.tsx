import React from 'react';
import { useGoalStore, GOAL_TEMPLATES } from '../stores/goalStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Goal } from '../types';

export default function GoalSelectPage() {
  const setGoal = useGoalStore((state) => state.setGoal);
  const navigate = useNavigate();

  const handleSelect = (template: Omit<Goal, 'id'>) => {
    // Simple confirmation
    if (confirm(`确定要选择目标"${template.name}"吗？`)) {
      setGoal({
        ...template,
        id: 'goal-' + Date.now(),
      } as Goal);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">选择微目标</h1>
      </div>

      <div className="space-y-4">
        {/* Templates */}
        {GOAL_TEMPLATES.map((tpl, index) => (
          <div
            key={index}
            onClick={() => handleSelect(tpl)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-indigo-200 transition-colors"
          >
            <div>
              <h3 className="font-bold text-gray-900">{tpl.name}</h3>
              <div className="flex gap-2 mt-2">
                 <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                   {tpl.duration}分钟
                 </span>
                 <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                   {tpl.frequency === 'daily' ? '每日' : '其他'}
                 </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={16} />
            </div>
          </div>
        ))}

        {/* Custom Goal Button */}
        <div
            onClick={() => navigate('/goal/custom')}
            className="bg-dashed border-2 border-gray-200 p-5 rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-300 hover:text-indigo-500 transition-colors"
          >
            <span className="font-medium">+ 自定义目标</span>
        </div>
      </div>
    </div>
  );
}
