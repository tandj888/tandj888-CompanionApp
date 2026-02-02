import React from 'react';
import { CheckCircle2, Gift } from 'lucide-react';
import { Goal } from '../types';
import { useCheckInStore } from '../stores/checkInStore';

interface GoalCardProps {
  goal: Goal;
  onCheckIn: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onCheckIn }) => {
  const { getTodayCheckIn, getStreak, getCumulativeCheckIns } = useCheckInStore();
  const todayCheckIn = getTodayCheckIn(goal.id);
  const isCheckedIn = !!todayCheckIn;
  const streak = getStreak(goal.id);
  const cumulative = getCumulativeCheckIns(goal.id);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm mb-4 border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          {/* <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md mb-2 font-medium">
            目标
          </span> */}
          <h2 className="text-2xl font-bold text-gray-900">{goal.name}</h2>
          <p className="text-gray-500 text-sm mt-1">
            每次耗时 {goal.duration} 分钟
          </p>
        </div>
        <div className="flex gap-2">
            <div className="text-center bg-gray-50 px-3 py-2 rounded-xl">
            <p className="text-2xl font-bold text-indigo-600">{streak}</p>
            <p className="text-xs text-gray-400">连续</p>
            </div>
            <div className="text-center bg-gray-50 px-3 py-2 rounded-xl">
            <p className="text-2xl font-bold text-indigo-600">{cumulative}</p>
            <p className="text-xs text-gray-400">累计</p>
            </div>
        </div>
      </div>

      {goal.rewards && goal.rewards.length > 0 && (
        <div className="mb-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Gift size={12} /> 打卡奖励
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {goal.rewards.map(reward => {
              const consecutiveDays = reward.consecutiveDays || 0;
              const cumulativeDays = reward.cumulativeDays || 0;
              
              // Determine if unlocked:
              // If only consecutive set, check streak
              // If only cumulative set, check cumulative
              // If both set, either condition unlocks? Or both?
              // Let's assume ANY condition met is good enough for now, or display both.
              // Actually based on GroupPage logic, we should probably check if ALL non-zero conditions are met, or just display them.
              // Let's simplify and follow the merged display logic:
              
              const isStreakUnlocked = consecutiveDays > 0 && streak >= consecutiveDays;
              const isCumulativeUnlocked = cumulativeDays > 0 && cumulative >= cumulativeDays;
              
              // If both exist, it's unlocked if BOTH are met? Or EITHER? 
              // Usually merged rewards imply "Reach 7 days streak AND 10 days cumulative"? 
              // Or maybe it's "7 days streak OR 10 days cumulative"?
              // The request was "merged display".
              // Let's assume if a reward has multiple conditions, ALL must be met to be "unlocked".
              // But for partial progress, we show what is needed.
              
              const isUnlocked = (consecutiveDays > 0 ? isStreakUnlocked : true) && 
                                 (cumulativeDays > 0 ? isCumulativeUnlocked : true) &&
                                 (consecutiveDays > 0 || cumulativeDays > 0);

              return (
                <div 
                  key={reward.id} 
                  className={`flex-shrink-0 border px-3 py-2 rounded-xl flex items-center gap-2 min-w-[100px] transition-colors ${
                    isUnlocked 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-pink-50 border-pink-100'
                  }`}
                >
                  <span className="text-xl">{reward.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${isUnlocked ? 'text-yellow-700' : 'text-pink-600'}`}>
                      {reward.name}
                    </p>
                    <p className={`text-[10px] ${isUnlocked ? 'text-yellow-600' : 'text-pink-400'}`}>
                      {isUnlocked ? '已达成' : (
                          <>
                             {consecutiveDays > 0 && `连${consecutiveDays} `}
                             {cumulativeDays > 0 && `累${cumulativeDays}`}
                          </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCheckedIn ? (
        <button
          disabled
          className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <CheckCircle2 size={20} />
          今日已打卡
        </button>
      ) : (
        <button
          onClick={() => onCheckIn(goal.id)}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={24} />
          完成打卡
        </button>
      )}
    </div>
  );
};
