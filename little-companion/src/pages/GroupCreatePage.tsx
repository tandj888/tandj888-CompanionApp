import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Gift, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">创建小陪团</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">陪团名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：早起打卡团（1-8字）"
            maxLength={8}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">陪团描述（可选）</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：一起坚持喝水（1-20字）"
            maxLength={20}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">人数上限 (含团长)</label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-4">
                <Users size={20} className="text-gray-400" />
                <input
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    placeholder="3"
                    min={2}
                    max={50}
                    className="w-full outline-none"
                />
            </div>
            <p className="text-xs text-gray-400 mt-2">最少2人，最多50人</p>
        </div>

        <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} /> 时间设置 (可选)
                </h3>
            </div>
            
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
                 <p className="text-xs text-gray-400 mb-3 bg-gray-50 p-2 rounded-lg">
                     {timeRestrictionEnabled 
                         ? "开启后，您只能在下方设置的“打卡开始时间”到“打卡结束时间”范围内进行打卡，其他时间将无法打卡。" 
                         : "关闭后，您可以随时打卡，下方的开始/结束时间仅作为参考提醒。"}
                </p>

                {timeRestrictionEnabled && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
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
                )}
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
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">监督人称呼</label>
                        <input 
                            value={supervisorName}
                            onChange={(e) => setSupervisorName(e.target.value)}
                            placeholder="如：妈妈、教练"
                            className="w-full p-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">联系方式 (电话/微信)</label>
                        <input 
                            value={supervisorContact}
                            onChange={(e) => setSupervisorContact(e.target.value)}
                            placeholder="输入号码"
                            className="w-full p-2 border rounded-lg text-sm"
                        />
                    </div>
                    
                    <div className="flex gap-2 text-sm">
                         <label className="flex items-center gap-2">
                             <input 
                                 type="checkbox" 
                                 checked={notifyOnCheckIn}
                                 onChange={(e) => setNotifyOnCheckIn(e.target.checked)}
                             />
                             打卡通知TA
                         </label>
                         <label className="flex items-center gap-2">
                             <input 
                                 type="checkbox" 
                                 checked={notifyOnOverdue}
                                 onChange={(e) => setNotifyOnOverdue(e.target.checked)}
                             />
                             逾期通知TA
                         </label>
                    </div>
                </div>
            )}
        </div>

        <div className="border-t pt-4">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                     <Gift size={18} className="text-pink-500" /> 团内奖励
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
                         设置奖励激励大家坚持打卡吧～
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
                                 placeholder="奖励名称 (如: 奶茶一杯)"
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
          onClick={handleCreate}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors mt-8 shadow-lg shadow-indigo-200"
        >
          创建并邀请
        </button>
      </div>
    </div>
  );
}
