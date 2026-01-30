import React from 'react';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock badges data based on requirements
const BADGES = [
  { id: 'water_1', name: '喝水小能手', icon: '💧', condition: '累计打卡喝水类目标10次', category: 'water', requiredLevel: 1 },
  { id: 'reading_1', name: '读书小标兵', icon: '📚', condition: '累计打卡读书类目标10次', category: 'reading', requiredLevel: 1 },
  { id: 'exercise_1', name: '运动小达人', icon: '🏃', condition: '累计打卡运动类目标10次', category: 'exercise', requiredLevel: 1 },
  { id: 'sleep_1', name: '不熬夜超人', icon: '🌙', condition: '累计打卡不熬夜类目标15次', category: 'sleep', requiredLevel: 2 },
  { id: 'social_1', name: '团内小太阳', icon: '☀️', condition: '累计给团内成员点赞30次', category: 'social', requiredLevel: 3 },
  { id: 'streak_1', name: '坚持不懈', icon: '🔥', condition: '最长连续打卡天数达到7天', category: 'streak', requiredLevel: 1 },
  { id: 'streak_2', name: '持之以恒', icon: '🌟', condition: '最长连续打卡天数达到30天', category: 'streak', requiredLevel: 4 },
];

export default function BadgePage() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">我的勋章</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = user.unlockedBadges.includes(badge.id); // In real app, check store
          // For demo, let's pretend some are unlocked
          const isActuallyUnlocked = isUnlocked || (badge.requiredLevel <= user.level); 

          return (
            <div 
              key={badge.id}
              className={`p-4 rounded-2xl border ${
                isActuallyUnlocked 
                  ? 'bg-white border-indigo-100 shadow-sm' 
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 ${
                 isActuallyUnlocked ? 'bg-indigo-50' : 'bg-gray-200 grayscale'
              }`}>
                {badge.icon}
              </div>
              <h3 className={`font-bold ${isActuallyUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                {badge.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{badge.condition}</p>
              {!isActuallyUnlocked && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                  <Lock size={12} />
                  <span>Lv.{badge.requiredLevel} 解锁</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
