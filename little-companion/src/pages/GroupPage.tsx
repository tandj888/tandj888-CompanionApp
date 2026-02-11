import React, { useState, useEffect } from 'react';
import { useGroupStore } from '../stores/groupStore';
import { useUserStore } from '../stores/userStore';
import { useGoalStore } from '../stores/goalStore';
import { Users, Plus, Heart, Copy, Check, ArrowRight, Settings, LogOut, Trash2, Edit2, Crown, Calendar, Gift, ChevronLeft, Clock, History, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useCheckInStore } from '../stores/checkInStore';
import { CategoryIcon } from '../components/CategoryIcon';

export default function GroupPage() {
  const { groups, joinGroup, leaveGroup, dissolveGroup, kickMember, refreshInviteCode, updateGroup, syncWithBackend, checkInGroup, likeMember, remindMember } = useGroupStore();
  const { user } = useUserStore();
  const { goals, categories } = useGoalStore();
  const navigate = useNavigate();
  // Removed useCheckInStore dependency for likes
  
  // Sync with backend on mount to ensure list is up to date
  useEffect(() => {
      syncWithBackend();
  }, []);
  
  // View State
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Modal State
  const [showInvite, setShowInvite] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState<string | null>(null);

  const activeGroups = groups.filter(g => g.status === 'active' && g.members.some(m => m.id === user?.id));
  const dissolvedGroups = groups.filter(g => g.status === 'dissolved' && g.members.some(m => m.id === user?.id));
  
  const currentGroup = activeGroupId ? groups.find(g => g.id === activeGroupId) : null;

  // Auto-select if only one active group and not in history mode
  useEffect(() => {
    if (activeGroups.length === 1 && !activeGroupId && !showHistory) {
      // Optional: Auto-enter if only one group? 
      // User might want to see the list if they have history.
      // Let's keep it manual or auto only if no history.
      // setActiveGroupId(activeGroups[0].id);
    }
  }, [activeGroups.length]);

  const isLeader = currentGroup?.leaderId === user?.id;
  const maxStreak = currentGroup ? Math.max(...currentGroup.members.map(m => m.streak || 0)) : 0;
  const isDissolved = currentGroup?.status === 'dissolved';

  const handleGroupLike = async (memberId: string) => {
    if (!currentGroup || !user) return;
    const member = currentGroup.members.find(m => m.id === memberId);
    if (member?.todayLikes?.includes(user.id)) return; // Already liked

    try {
        await likeMember(currentGroup.id, memberId);
        setNotification('已点赞！对方会收到你的鼓励～');
    } catch (e) {
        setNotification('点赞失败，请稍后重试');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGroupRemind = async (memberId: string) => {
    if (!currentGroup || !user) return;
    try {
        await remindMember(currentGroup.id, memberId);
        setNotification('已发送提醒！');
    } catch (e) {
        setNotification('提醒发送失败，请稍后重试');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGroupCheckIn = async () => {
    if (!currentGroup) return;
    try {
        await checkInGroup(currentGroup.id);
        setNotification('打卡成功！');
    } catch (e: any) {
        alert(e.message || '打卡失败');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentGroup?.inviteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    if (!user) return;
    
    // Show loading state could be nice, but for now just await
    try {
        const result = await joinGroup(joinCode.trim(), user);
        
        if (result.success) {
             if (result.code === 'already_joined') {
                 alert(result.message || '你已经在该陪团中了');
             } else {
                 alert('加入成功！');
             }
             setJoinCode('');
        } else {
             alert(`加入失败：${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('Join error:', error);
        alert('加入遇到问题，请重试');
    }
  };

  const handleLeave = () => {
    if (!user || !currentGroup) return;
    if (confirm('确定要退出陪团吗？退出后打卡记录可能无法同步到团数据。')) {
        leaveGroup(currentGroup.id, user.id);
        setActiveGroupId(null);
        setShowManage(false);
    }
  };

  const handleDissolve = () => {
    if (!currentGroup) return;
    if (confirm('确定要解散陪团吗？解散后将保留历史数据，但无法继续打卡。')) {
        dissolveGroup(currentGroup.id);
        setActiveGroupId(null);
        setShowManage(false);
    }
  };

  const handleKick = (memberId: string, memberName: string) => {
    if (!currentGroup) return;
    if (confirm(`确定要将 ${memberName} 移出陪团吗？`)) {
        kickMember(currentGroup.id, memberId);
    }
  };

  const handleSaveEdit = () => {
    if (!currentGroup) return;
    if (!editName.trim()) {
        alert('团名不能为空');
        return;
    }
    updateGroup(currentGroup.id, { name: editName, description: editDesc });
    setShowEdit(false);
  };

  const openEdit = () => {
    if (currentGroup) {
        setEditName(currentGroup.name);
        setEditDesc(currentGroup.description || '');
        setShowEdit(true);
        setShowManage(false);
    }
  };

  // --- Render: Group List View ---
  if (!activeGroupId) {
    return (
      <div className="p-6 pt-12 min-h-screen pb-24">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {showHistory && (
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-2xl font-bold">我的小陪团</h1>
          </div>
          <button 
             onClick={() => setShowHistory(!showHistory)}
             className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
             <History size={24} />
          </button>
        </div>

        {/* Create / Join Section */}
        {!showHistory && (
            <div className="mb-8 space-y-4">
                <button 
                    onClick={() => navigate('/group/create')}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    <Plus size={24} /> 创建新陪团
                </button>

                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="输入邀请码"
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value)}
                        className="w-full bg-white border border-gray-200 py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button 
                        onClick={handleJoin}
                        disabled={!joinCode.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 disabled:text-gray-300 transition-colors hover:bg-indigo-50 rounded-lg"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 px-1">
                    * 仅支持邀请码加入
                </p>
            </div>
        )}

        {/* Groups List */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
                {showHistory ? '历史陪团 (已解散)' : '进行中'}
            </h2>
            
            {(showHistory ? dissolvedGroups : activeGroups).length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{showHistory ? '暂无历史陪团' : '暂无进行中的陪团'}</p>
                </div>
            ) : (
                (showHistory ? dissolvedGroups : activeGroups).map(g => (
                    <div 
                        key={g.id}
                        onClick={() => setActiveGroupId(g.id)}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-98 transition-transform cursor-pointer relative overflow-hidden"
                    >
                        {g.status === 'dissolved' && (
                            <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-bl-xl">
                                已解散
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                {g.name}
                                {g.leaderId === user?.id && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-1">{g.description || '暂无描述'}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <Users size={14} /> {g.members.length}/{g.maxMembers || 3}
                                </span>
                                {g.rewards && g.rewards.length > 0 && (
                                    <span className="flex items-center gap-1 text-pink-500">
                                        <Gift size={14} /> 奖励
                                    </span>
                                )}
                            </div>
                            <span>
                                {g.dissolvedAt 
                                    ? `解散于 ${g.dissolvedAt ? format(new Date(Number(g.dissolvedAt)), 'yyyy-MM-dd') : '未知'}` 
                                    : `创建于 ${g.createTime ? format(new Date(Number(g.createTime)), 'yyyy-MM-dd') : '未知'}`
                                }
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    );
  }

  // --- Render: Group Detail View ---
  if (!currentGroup) return null; // Should not happen

  return (
    <div className="p-6 pt-12 min-h-screen relative pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={() => setActiveGroupId(null)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-8">{currentGroup.name}</h1>
        {!isDissolved && (
            <button onClick={() => setShowManage(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <Settings size={24} />
            </button>
        )}
      </div>

      {/* Group Card Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        {isDissolved && (
            <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-white/90 border border-gray-200 px-4 py-2 rounded-full shadow-sm text-gray-500 font-medium text-sm">
                    此陪团已解散
                </div>
            </div>
        )}
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {currentGroup.name}
                    {isLeader && <Crown size={16} className="text-yellow-500 fill-yellow-500" />}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{currentGroup.description || '暂无描述'}</p>
                {/* Time Range Display */}
                {(currentGroup.startDate || currentGroup.startTime) && (
                     <div className="flex items-center gap-2 mt-2 text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                        <Clock size={12} />
                        <span>
                            {currentGroup.startDate ? format(new Date(currentGroup.startDate), 'MM/dd') : ''} 
                            {currentGroup.startTime} 
                            {currentGroup.endDate ? ` - ${format(new Date(currentGroup.endDate), 'MM/dd')}` : ''}
                        </span>
                     </div>
                )}
            </div>
            {isLeader && !isDissolved && (
                <button onClick={openEdit} className="text-gray-400 hover:text-indigo-600">
                    <Edit2 size={18} />
                </button>
            )}
        </div>
        
        <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div className="flex-1 text-center border-r border-gray-200">
                <p className="text-xs text-gray-400 mb-1">成员</p>
                <p className="font-bold text-lg">{currentGroup.members.length}/{currentGroup.maxMembers || 3}</p>
            </div>
            <div className="flex-1 text-center">
                <p className="text-xs text-gray-400 mb-1">最长连续</p>
                <p className="font-bold text-lg">{maxStreak}天</p>
            </div>
        </div>

        {/* Rewards Display */}
        {currentGroup.rewards && currentGroup.rewards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Gift size={12} /> 打卡奖励
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {currentGroup.rewards.map(reward => {
                        // Find current user's streak in this group
                        const myMemberInfo = currentGroup.members.find(m => m.id === user?.id);
                        const myStreak = myMemberInfo?.streak || 0;
                        const myTotal = myMemberInfo?.totalCheckIns || myStreak; // Fallback to streak if total not available
                        
                        const isUnlocked = 
                            (reward.consecutiveDays && myStreak >= reward.consecutiveDays) ||
                            (reward.cumulativeDays && myTotal >= reward.cumulativeDays);
                        
                        return (
                            <div 
                                key={reward.id} 
                                className={`flex-shrink-0 border px-3 py-2 rounded-xl flex items-center gap-2 min-w-[120px] transition-colors ${
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
                                    <div className={`text-[10px] flex flex-col ${isUnlocked ? 'text-yellow-600' : 'text-pink-400'}`}>
                                        {isUnlocked ? (
                                            <span>已达成</span>
                                        ) : (
                                            <>
                                                {reward.consecutiveDays && <span>连续 {myStreak}/{reward.consecutiveDays}</span>}
                                                {reward.cumulativeDays && <span>累计 {myTotal}/{reward.cumulativeDays}</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Member List */}
      <div className="space-y-4">
          <h3 className="font-bold text-gray-900">团员动态</h3>
          {currentGroup.members.map(member => {
            const isMe = member.id === user?.id;
            const isMemberLeader = member.id === currentGroup.leaderId;
            
            return (
                <div 
                    key={member.id} 
                    className={`flex items-center justify-between p-4 rounded-xl shadow-sm border transition-all ${
                        isMe 
                        ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-100' 
                        : 'bg-white border-gray-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={member.avatar} className="w-12 h-12 rounded-full bg-gray-200 object-cover border-2 border-white shadow-sm" />
                            {isMemberLeader && (
                                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white shadow-sm">
                                    <Crown size={10} className="text-white fill-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                {member.nickname}
                                {isMe && (
                                    <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm shadow-indigo-200">
                                        我
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                {member.hasCheckedInToday ? (
                                    <span className="text-green-500 flex items-center gap-0.5">
                                        <Check size={12} /> 今日已打卡
                                    </span>
                                ) : (
                                    <span>今日未打卡</span>
                                )}
                                <span className="text-gray-300">|</span>
                                <span>坚持{member.streak || 0}天</span>
                            </p>
                        </div>
                    </div>
                    
                    {!isDissolved && (
                        <div className="flex items-center gap-2">
                            {/* Me: Check In Button */}
                            {isMe && !member.hasCheckedInToday && (
                                <button 
                                    onClick={handleGroupCheckIn}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1"
                                >
                                    <Check size={14} /> 打卡
                                </button>
                            )}

                            {/* Like Button (Always visible for others) */}
                            {!isMe && (
                                <div className="flex items-center gap-2">
                                    {/* Remind Button (Only if not checked in) */}
                                    {!member.hasCheckedInToday && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleGroupRemind(member.id); }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-400 border border-gray-200 rounded-full hover:border-indigo-300 hover:text-indigo-500 transition-all"
                                        >
                                            <Bell size={16} />
                                            {/* <span className="text-xs font-bold">提醒</span> */}
                                        </button>
                                    )}

                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleGroupLike(member.id); }}
                                        disabled={member.todayLikes?.includes(user?.id || '')}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
                                            member.todayLikes?.includes(user?.id || '') 
                                            ? 'bg-pink-50 text-pink-400 border border-pink-100 cursor-default' 
                                            : 'bg-white text-gray-400 border border-gray-200 hover:border-pink-300 hover:text-pink-500'
                                        }`}
                                    >
                                        <Heart size={16} fill={member.todayLikes?.includes(user?.id || '') ? "currentColor" : "none"} />
                                        {/* <span className="text-xs font-bold">{member.todayLikes?.includes(user?.id || '') ? '已赞' : '点赞'}</span> */}
                                    </button>
                                </div>
                            )}
                            
                            {/* Kick Button (Leader Only) */}
                            {isLeader && !isMe && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleKick(member.id, member.nickname); }}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            )}

                            {/* Simulation removed */}
                        </div>
                    )}
                </div>
            );
          })}
          
          {!isDissolved && currentGroup.members.length < (currentGroup.maxMembers || 3) && (
             <div 
                onClick={() => setShowInvite(true)}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-gray-400 hover:text-indigo-500"
             >
                <Plus size={20} />
                <span className="font-medium">邀请新成员 ({currentGroup.members.length}/{currentGroup.maxMembers || 3})</span>
             </div>
          )}
      </div>

      {/* Removed dev simulation for new member */}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-gray-900">邀请好友加入</h3>
                <p className="text-gray-500 mb-6 text-sm">
                    邀请码24小时内有效，最多容纳{currentGroup.maxMembers || 3}人
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1 text-left">邀请码 (同设备/浏览器)</div>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-mono font-bold tracking-wider text-gray-800">
                            {currentGroup.inviteCode}
                        </span>
                        <button 
                            onClick={handleCopy} 
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>

                {/* Removed cross设备/浏览器专用口令区域 */}
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => refreshInviteCode(currentGroup.id)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        刷新邀请码
                    </button>
                    <button 
                        onClick={() => setShowInvite(false)}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Manage Modal */}
      {showManage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">陪团管理</h3>
                    <button onClick={() => setShowManage(false)} className="text-gray-400">关闭</button>
                </div>
                
                <div className="space-y-3">
                    {isLeader && (
                        <button 
                            onClick={openEdit}
                            className="w-full p-4 bg-gray-50 rounded-xl flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                        >
                            <Edit2 size={20} />
                            修改陪团信息
                        </button>
                    )}
                    
                    {isLeader ? (
                         <button 
                            onClick={handleDissolve}
                            className="w-full p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-100"
                        >
                            <Trash2 size={20} />
                            解散陪团
                        </button>
                    ) : (
                        <button 
                            onClick={handleLeave}
                            className="w-full p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-100"
                        >
                            <LogOut size={20} />
                            退出陪团
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
             <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
                <h3 className="text-lg font-bold mb-6">修改信息</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">陪团名称</label>
                        <input 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            maxLength={8}
                            className="w-full p-3 bg-gray-50 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">描述</label>
                        <input 
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            maxLength={20}
                            className="w-full p-3 bg-gray-50 rounded-xl"
                        />
                    </div>
                    <button 
                        onClick={handleSaveEdit}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium mt-4"
                    >
                        保存
                    </button>
                    <button 
                        onClick={() => setShowEdit(false)}
                        className="w-full text-gray-500 py-3 rounded-xl font-medium"
                    >
                        取消
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
            {notification}
        </div>
      )}
    </div>
  );
}
