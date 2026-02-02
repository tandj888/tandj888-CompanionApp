import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoalStore } from '../stores/goalStore';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Gift } from 'lucide-react';
import { Goal, Reward } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

export default function GoalCustomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const { setGoal, goals, categories, addCategory, removeCategory } = useGoalStore();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState<string>(categoryParam || 'other');
  
  // Edit mode initialization
  const goalId = searchParams.get('id');
  
  React.useEffect(() => {
    if (goalId) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            setName(goal.name);
            setDuration(goal.duration.toString());
            setCategory(goal.category);
            setFrequency(goal.frequency);
            if (goal.intervalDays) setIntervalDays(goal.intervalDays.toString());
            
            // Time settings
            if (goal.startDate) setStartDate(goal.startDate);
            if (goal.endDate) setEndDate(goal.endDate);
            if (goal.startTime) setStartTime(goal.startTime);
            if (goal.endTime) setEndTime(goal.endTime);
            if (goal.timeRestriction?.enabled) {
                setTimeRestrictionEnabled(true);
            }
            if (goal.deadlineTime) setDeadlineTime(goal.deadlineTime);
            
            // Rewards - Critical fix: Load existing rewards
            if (goal.rewards) {
                setRewards(goal.rewards);
            }
            
            // Supervisor
            if (goal.supervisor?.enabled) {
                setEnableSupervisor(true);
                setSupervisorName(goal.supervisor.name);
                setSupervisorContact(goal.supervisor.contact);
                setSupervisorMethod(goal.supervisor.method);
                setNotifyOnCheckIn(goal.supervisor.notifyOnCheckIn ?? true);
                setNotifyOnOverdue(goal.supervisor.notifyOnOverdue ?? true);
            }
        }
    }
  }, [goalId, goals]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timeRestrictionEnabled, setTimeRestrictionEnabled] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState('');
  
  // Frequency settings
  const [frequency, setFrequency] = useState<Goal['frequency']>('daily');
  const [intervalDays, setIntervalDays] = useState('1');

  // Supervisor settings
  const [enableSupervisor, setEnableSupervisor] = useState(false);
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorContact, setSupervisorContact] = useState('');
  const [supervisorMethod, setSupervisorMethod] = useState<'app' | 'sms'>('app');
  const [notifyOnCheckIn, setNotifyOnCheckIn] = useState(true);
  const [notifyOnOverdue, setNotifyOnOverdue] = useState(true);

  // Rewards settings
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newRewardConsecutiveDays, setNewRewardConsecutiveDays] = useState('');
  const [newRewardCumulativeDays, setNewRewardCumulativeDays] = useState('');
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');

  const handleAddReward = () => {
    if (!newRewardName) {
        alert('请输入奖励名称');
        return;
    }
    const consDays = parseInt(newRewardConsecutiveDays);
    const cumDays = parseInt(newRewardCumulativeDays);
    
    if ((isNaN(consDays) || consDays <= 0) && (isNaN(cumDays) || cumDays <= 0)) {
        alert('请至少设置一种打卡天数要求');
        return;
    }
    
    setRewards([...rewards, {
      id: 'reward-' + Date.now(),
      consecutiveDays: !isNaN(consDays) && consDays > 0 ? consDays : undefined,
      cumulativeDays: !isNaN(cumDays) && cumDays > 0 ? cumDays : undefined,
      name: newRewardName,
      icon: newRewardIcon,
    }]);
    setIsAddingReward(false);
    setNewRewardConsecutiveDays('');
    setNewRewardCumulativeDays('');
    setNewRewardName('');
  };

  const removeReward = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const handleNext = async () => {
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
    const isEdit = !!goalId;
    if (confirm(isEdit ? `确定保存对"${name}"的修改吗？` : `确定创建目标"${name}"吗？`)) {
        try {
            await setGoal({
                id: goalId || 'goal-' + Date.now(),
                name,
                duration: durationNum,
                category,
                frequency,
                intervalDays: frequency === 'custom' ? parseInt(intervalDays) : undefined,
                templateId: 'custom',
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                timeRestriction: {
                    enabled: timeRestrictionEnabled
                },
                deadlineTime: deadlineTime || undefined,
                rewards: rewards.length > 0 ? rewards : undefined,
                supervisor: enableSupervisor ? {
                    enabled: true,
                    name: supervisorName,
                    contact: supervisorContact,
                    method: supervisorMethod,
                    notifyOnCheckIn,
                    notifyOnOverdue
                } : undefined,
            } as Goal);
            navigate('/');
        } catch (e: any) {
            console.error('Save goal error:', e);
            alert(e.message || '保存失败，请稍后重试');
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{goalId ? '编辑目标' : '创建自定义目标'}</h1>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">目标分类</label>
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
                    <CategoryIcon icon={cat.icon} />
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
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} /> 时间设置 (可选)
                </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">开始日期 (周期开始)</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">结束日期 (周期结束)</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 bg-white border rounded-lg text-sm"
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-900">开启时间段打卡限制</label>
                    <button 
                        onClick={() => setTimeRestrictionEnabled(!timeRestrictionEnabled)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                            timeRestrictionEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                            timeRestrictionEnabled ? 'left-6' : 'left-1'
                        }`} />
                    </button>
                </div>
                
                {timeRestrictionEnabled && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs text-gray-400 mb-3 bg-gray-50 p-2 rounded-lg">
                            开启后，您只能在设置的时间段内打卡。
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">打卡开始时间</label>
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
                                <label className="block text-xs text-gray-500 mb-1">打卡结束时间</label>
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
                )}
            </div>
            
            <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">截止时间 (超过此时间未打卡通知)</label>
                <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                    <Clock size={14} className="text-red-400" />
                    <input 
                        type="time" 
                        value={deadlineTime}
                        onChange={(e) => setDeadlineTime(e.target.value)}
                        className="w-full text-sm outline-none"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">若设置了监督人，超过该时间未打卡将通知监督人</p>
            </div>
        </div>

        <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">👀</span> 监督人设置
                </h3>
                <button 
                    onClick={() => setEnableSupervisor(!enableSupervisor)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                        enableSupervisor ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                        enableSupervisor ? 'left-7' : 'left-1'
                    }`} />
                </button>
            </div>
            
            {enableSupervisor && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-4 animate-in slide-in-from-top-2">
                    {/* ... existing supervisor inputs ... */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">监督人称呼</label>
                        <input 
                            value={supervisorName}
                            onChange={(e) => setSupervisorName(e.target.value)}
                            className="w-full p-2 border rounded-lg text-sm"
                            placeholder="例如：妈妈"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">联系方式 (手机/ID)</label>
                        <input 
                            value={supervisorContact}
                            onChange={(e) => setSupervisorContact(e.target.value)}
                            className="w-full p-2 border rounded-lg text-sm"
                            placeholder="手机号"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">通知方式</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSupervisorMethod('app')}
                                className={`flex-1 py-2 rounded-lg text-xs border ${
                                    supervisorMethod === 'app' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'
                                }`}
                            >APP通知</button>
                            <button
                                onClick={() => setSupervisorMethod('sms')}
                                className={`flex-1 py-2 rounded-lg text-xs border ${
                                    supervisorMethod === 'sms' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'
                                }`}
                            >短信通知</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">触发场景</label>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">打卡后通知</span>
                            <input type="checkbox" checked={notifyOnCheckIn} onChange={(e) => setNotifyOnCheckIn(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">超时未打卡通知</span>
                            <input type="checkbox" checked={notifyOnOverdue} onChange={(e) => setNotifyOnOverdue(e.target.checked)} />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Gift size={18} className="text-pink-500" /> 打卡奖励
                </h3>
                <button 
                    onClick={() => setIsAddingReward(true)}
                    className="text-xs text-indigo-600 flex items-center gap-1"
                >
                    <Plus size={14} /> 添加奖励
                </button>
            </div>

            <div className="space-y-3">
                {rewards.map(reward => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl border border-pink-100">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{reward.icon}</span>
                            <div>
                                <p className="font-medium text-gray-900">{reward.name}</p>
                                <div className="text-xs text-gray-500 flex flex-col">
                                    {reward.consecutiveDays && <span>连续打卡 {reward.consecutiveDays} 天</span>}
                                    {reward.cumulativeDays && <span>累计打卡 {reward.cumulativeDays} 天</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => removeReward(reward.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {rewards.length === 0 && !isAddingReward && (
                    <p className="text-center text-sm text-gray-400 py-4">
                        给自己设置一些奖励吧，更有动力！
                    </p>
                )}

                {isAddingReward && (
                    <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-2">
                        <p className="text-xs text-gray-500 mb-2">设置奖励条件 (可多选)</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">连续打卡</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        value={newRewardConsecutiveDays}
                                        onChange={e => setNewRewardConsecutiveDays(e.target.value)}
                                        className="w-full p-2 border rounded-lg text-sm"
                                        placeholder="天数"
                                    />
                                    <span className="text-sm text-gray-500">天</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">累计打卡</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        value={newRewardCumulativeDays}
                                        onChange={e => setNewRewardCumulativeDays(e.target.value)}
                                        className="w-full p-2 border rounded-lg text-sm"
                                        placeholder="天数"
                                    />
                                    <span className="text-sm text-gray-500">天</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-3">
                            <input 
                                value={newRewardIcon}
                                onChange={e => setNewRewardIcon(e.target.value)}
                                className="w-12 p-2 border rounded-lg text-center"
                                placeholder="🎁"
                            />
                            <input 
                                value={newRewardName}
                                onChange={e => setNewRewardName(e.target.value)}
                                className="flex-1 p-2 border rounded-lg text-sm"
                                placeholder="奖励名称 (如: 看一场电影)"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAddingReward(false)} className="px-3 py-1.5 text-sm text-gray-500">取消</button>
                            <button onClick={handleAddReward} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg">确定</button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors mt-8"
        >
          {goalId ? '保存修改' : '创建目标'}
        </button>
      </div>
    </div>
  );
}
