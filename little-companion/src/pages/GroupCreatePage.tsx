import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Gift, Users, Shield, Bell } from 'lucide-react';
import { Reward } from '../types';

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const { createGroup } = useGroupStore();
  const { user } = useUserStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState('3');
  
  // Time settings
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timeRestrictionEnabled, setTimeRestrictionEnabled] = useState(false);

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

  const handleCreate = async () => {
    if (!name) {
      alert('请输入陪团名称（1-8字）');
      return;
    }
    if (name.length > 8) {
      alert('陪团名称不可超过8字');
      return;
    }
    if (description.length > 20) {
      alert('陪团描述不可超过20字');
      return;
    }
    const max = parseInt(maxMembers);
    if (isNaN(max) || max < 2 || max > 50) {
        alert('人数限制请设置在2-50人之间');
        return;
    }
    
    if (!user) {
        alert('请先登录');
        return;
    }

    try {
        await createGroup({
            name,
            description,
            creator: user,
            maxMembers: max,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            timeRestriction: {
                enabled: timeRestrictionEnabled
            },
            rewards: rewards.length > 0 ? rewards : undefined,
            supervisor: enableSupervisor ? {
                enabled: true,
                name: supervisorName,
                contact: supervisorContact,
                method: supervisorMethod,
                notifyOnCheckIn,
                notifyOnOverdue
            } : undefined
        });
        
        alert('建团成功！');
        navigate('/group');
    } catch (e: any) {
        console.error('Create group error:', e);
        alert(e.message || '创建失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 mb-[-2rem] z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">创建小陪团</h1>
            <div className="w-10"></div>
        </div>
      </div>

      <div className="px-5 space-y-6 pt-12 relative z-0">
        {/* Basic Info */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">陪团名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：早起打卡团（1-8字）"
                maxLength={8}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">陪团描述（可选）</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：一起坚持喝水（1-20字）"
                maxLength={20}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">人数上限 (含团长)</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <Users size={20} className="text-gray-400" />
                    <input
                        type="number"
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        placeholder="3"
                        min={2}
                        max={50}
                        className="w-full bg-transparent outline-none"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">最少2人，最多50人</p>
            </div>
        </div>

        {/* Time Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                        <Calendar size={18} />
                    </div>
                    时间设置 <span className="text-xs font-normal text-gray-400">(可选)</span>
                </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">开始日期</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5 ml-1">结束日期</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                 <div className="flex items-center justify-between mb-2">
                     <label className="text-sm font-medium text-gray-900">开启时间段打卡限制</label>
                     <button 
                         onClick={() => setTimeRestrictionEnabled(!timeRestrictionEnabled)}
                         className={`w-11 h-6 rounded-full transition-colors relative ${
                             timeRestrictionEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                         }`}
                     >
                         <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                             timeRestrictionEnabled ? 'left-6' : 'left-1'
                         }`} />
                     </button>
                 </div>
                 <p className="text-xs text-gray-400 mb-4 bg-gray-50 p-2.5 rounded-lg leading-relaxed">
                     {timeRestrictionEnabled 
                         ? "开启后，只能在设定时间段内打卡，其他时间无法打卡。" 
                         : "关闭后，可随时打卡，时间仅作参考。"}
                </p>

                {timeRestrictionEnabled && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5 ml-1">打卡开始时间</label>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 focus-within:ring-2 focus-within:ring-indigo-500">
                                <Clock size={16} className="text-gray-400" />
                                <input 
                                    type="time" 
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full text-sm bg-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5 ml-1">打卡结束时间</label>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 focus-within:ring-2 focus-within:ring-indigo-500">
                                <Clock size={16} className="text-gray-400" />
                                <input 
                                    type="time" 
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full text-sm bg-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Supervisor Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                        <Shield size={18} />
                    </div>
                    监督人设置
                </h3>
                <button 
                    onClick={() => setEnableSupervisor(!enableSupervisor)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                        enableSupervisor ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                        enableSupervisor ? 'left-6' : 'left-1'
                    }`} />
                </button>
            </div>
            
            {enableSupervisor && (
                <div className="space-y-4 mt-4 animate-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5 ml-1">监督人称呼</label>
                        <input 
                            value={supervisorName}
                            onChange={(e) => setSupervisorName(e.target.value)}
                            placeholder="如：妈妈、教练"
                            className="w-full p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5 ml-1">联系方式 (电话/微信)</label>
                        <input 
                            value={supervisorContact}
                            onChange={(e) => setSupervisorContact(e.target.value)}
                            placeholder="输入号码"
                            className="w-full p-2.5 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                         <label className="flex items-center gap-2 text-sm text-gray-600">
                             <input 
                                 type="checkbox" 
                                 checked={notifyOnCheckIn}
                                 onChange={(e) => setNotifyOnCheckIn(e.target.checked)}
                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                             />
                             打卡通知TA
                         </label>
                         <label className="flex items-center gap-2 text-sm text-gray-600">
                             <input 
                                 type="checkbox" 
                                 checked={notifyOnOverdue}
                                 onChange={(e) => setNotifyOnOverdue(e.target.checked)}
                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                             />
                             逾期通知TA
                         </label>
                    </div>
                </div>
            )}
        </div>

        {/* Rewards Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                     <div className="p-1.5 bg-pink-50 text-pink-500 rounded-lg">
                        <Gift size={18} />
                     </div>
                     团内奖励
                 </h3>
                 <button 
                     onClick={() => setIsAddingReward(true)}
                     className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform"
                 >
                     <Plus size={14} /> 添加奖励
                 </button>
             </div>
 
             <div className="space-y-3">
                 {rewards.map(reward => (
                     <div key={reward.id} className="flex items-center justify-between p-3.5 bg-pink-50/50 rounded-xl border border-pink-100/50">
                         <div className="flex items-center gap-3">
                             <span className="text-2xl">{reward.icon}</span>
                             <div>
                                 <p className="font-medium text-gray-900 text-sm">{reward.name}</p>
                                 <div className="text-xs text-gray-500 flex flex-col">
                                     {reward.consecutiveDays && <span>连续打卡 {reward.consecutiveDays} 天</span>}
                                     {reward.cumulativeDays && <span>累计打卡 {reward.cumulativeDays} 天</span>}
                                 </div>
                             </div>
                         </div>
                         <button onClick={() => removeReward(reward.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                             <Trash2 size={16} />
                         </button>
                     </div>
                 ))}
                 
                 {rewards.length === 0 && !isAddingReward && (
                     <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                         <p className="text-xs text-gray-400">设置奖励激励大家坚持打卡吧～</p>
                     </div>
                 )}
 
                 {isAddingReward && (
                     <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-2">
                        <p className="text-xs font-medium text-gray-500 mb-3">设置奖励条件 (可多选)</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1.5">连续打卡</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        value={newRewardConsecutiveDays}
                                        onChange={e => setNewRewardConsecutiveDays(e.target.value)}
                                        className="w-full p-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                                        placeholder="天数"
                                    />
                                    <span className="text-sm text-gray-500 shrink-0">天</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1.5">累计打卡</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        value={newRewardCumulativeDays}
                                        onChange={e => setNewRewardCumulativeDays(e.target.value)}
                                        className="w-full p-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                                        placeholder="天数"
                                    />
                                    <span className="text-sm text-gray-500 shrink-0">天</span>
                                </div>
                            </div>
                        </div>
                         
                         <div className="flex gap-2 mb-4">
                             <input 
                                 value={newRewardIcon}
                                 onChange={e => setNewRewardIcon(e.target.value)}
                                 className="w-12 p-2 bg-gray-50 border-none rounded-lg text-center focus:ring-1 focus:ring-indigo-500"
                                 placeholder="🎁"
                             />
                             <input 
                                 value={newRewardName}
                                 onChange={e => setNewRewardName(e.target.value)}
                                 className="flex-1 p-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                                 placeholder="奖励名称 (如: 奶茶一杯)"
                             />
                         </div>
                         <div className="flex justify-end gap-2">
                             <button onClick={() => setIsAddingReward(false)} className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">取消</button>
                             <button onClick={handleAddReward} className="px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">确定</button>
                         </div>
                     </div>
                 )}
             </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] transition-all active:scale-95"
        >
          创建并邀请
        </button>
      </div>
    </div>
  );
}
