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
      <div className="min-h-screen bg-gray-50/50 pb-24">
        {/* Header */}
        <div className="bg-indigo-600 pb-16 pt-6 px-6 rounded-b-[3rem] relative overflow-hidden mb-[-3rem]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="relative z-10 flex justify-between items-center text-white mb-2">
                <div className="flex items-center gap-2">
                    {showHistory && (
                    <button 
                        onClick={() => setShowHistory(false)} 
                        className="p-2 -ml-2 text-white/80 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    )}
                    <h1 className="text-2xl font-bold tracking-wide">我的小陪团</h1>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-white text-indigo-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    <History size={24} />
                </button>
            </div>
            <p className="relative z-10 text-indigo-100 text-sm opacity-90">与志同道合的朋友一起坚持</p>
        </div>

        <div className="px-4 relative z-10">
            {/* Create / Join Section */}
            {!showHistory && (
                <div className="mb-6 space-y-4">
                    <div className="bg-white p-4 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50">
                        <button 
                            onClick={() => navigate('/group/create')}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform transition-transform active:scale-98"
                        >
                            <Plus size={22} /> 创建新陪团
                        </button>

                        <div className="relative mt-4">
                            <input 
                                type="text" 
                                placeholder="输入邀请码加入..."
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 py-3 pl-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-colors text-sm"
                            />
                            <button 
                                onClick={handleJoin}
                                disabled={!joinCode.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-50 text-indigo-600 disabled:text-gray-300 disabled:bg-gray-50 transition-colors hover:bg-indigo-100 rounded-lg"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Groups List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
                    {showHistory ? <History size={18} className="text-gray-400"/> : <Users size={18} className="text-indigo-500"/>}
                    {showHistory ? '历史陪团 (已解散)' : '进行中'}
                </h2>
                
                {(showHistory ? dissolvedGroups : activeGroups).length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 mx-2">
                        <Users size={48} className="mx-auto mb-4 opacity-20 text-indigo-300" />
                        <p>{showHistory ? '暂无历史陪团' : '暂无进行中的陪团'}</p>
                    </div>
                ) : (
                    (showHistory ? dissolvedGroups : activeGroups).map(g => (
                        <div 
                            key={g.id}
                            onClick={() => setActiveGroupId(g.id)}
                            className="bg-white p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-98 transition-all cursor-pointer relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                        >
                            {g.status === 'dissolved' && (
                                <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-bl-2xl font-medium">
                                    已解散
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    {g.name}
                                    {g.leaderId === user?.id && <Crown size={16} className="text-yellow-500 fill-yellow-500" />}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed bg-gray-50/50 p-2 rounded-xl">{g.description || '暂无描述'}</p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                                        <Users size={12} /> <span className="font-bold">{g.members.length}</span>/{g.maxMembers || 3}
                                    </span>
                                    {g.rewards && g.rewards.length > 0 && (
                                        <span className="flex items-center gap-1 text-pink-500 bg-pink-50 px-2 py-1 rounded-lg">
                                            <Gift size={12} /> 奖励
                                        </span>
                                    )}
                                </div>
                                <span className="font-medium opacity-60">
                                    {g.dissolvedAt 
                                        ? format(new Date(Number(g.dissolvedAt)), 'MM-dd') 
                                        : format(new Date(Number(g.createTime)), 'MM-dd')
                                    }
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    );
  }

  // --- Render: Group Detail View ---
  if (!currentGroup) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 pb-10 pt-4 px-4 rounded-b-[2.5rem] relative overflow-hidden mb-[-2rem] shadow-lg shadow-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex justify-between items-center text-white">
            <button 
                onClick={() => setActiveGroupId(null)}
                className="p-2 -ml-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
            >
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center pr-8 truncate">{currentGroup.name}</h1>
            {!isDissolved && (
                <button onClick={() => setShowManage(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                    <Settings size={20} />
                </button>
            )}
        </div>
      </div>

      <div className="px-4 relative z-10 space-y-4">
        {/* Info Card */}
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50">
            <div className="flex justify-between items-start mb-3">
                <div className="text-xs text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg font-mono">
                    ID: {currentGroup.inviteCode}
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{currentGroup.description || '暂无描述'}</p>
            
            {!isDissolved && (
                <button 
                    onClick={handleGroupCheckIn}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                    <Check size={20} /> 一键打卡
                </button>
            )}
        </div>

        {/* Members List */}
        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 px-2">成员列表 ({currentGroup.members.length})</h3>
            {currentGroup.members.map((member, index) => {
                const isMe = member.id === user?.id;
                const isCheckedIn = member.lastCheckInDate === format(new Date(), 'yyyy-MM-dd');
                
                return (
                    <div key={member.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img 
                                    src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
                                    className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm"
                                />
                                {member.id === currentGroup.leaderId && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border border-white">
                                        <Crown size={10} fill="white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                                        {member.nickname}
                                    </span>
                                    {isCheckedIn && (
                                        <span className="bg-green-100 text-green-600 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                            已打卡
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    连续坚持 {member.streak} 天
                                </div>
                            </div>
                        </div>

                        {!isMe && !isDissolved && (
                            <div className="flex items-center gap-2">
                                {isCheckedIn ? (
                                    <button 
                                        onClick={() => handleGroupLike(member.id)}
                                        className={`p-2 rounded-full transition-colors ${member.todayLikes?.includes(user?.id || '') ? 'bg-pink-50 text-pink-500' : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-500'}`}
                                    >
                                        <Heart size={18} fill={member.todayLikes?.includes(user?.id || '') ? "currentColor" : "none"} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleGroupRemind(member.id)}
                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        <Bell size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm shadow-xl z-50 animate-in fade-in slide-in-from-top-4">
            {notification}
        </div>
      )}

      {/* Manage Modal */}
      {showManage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-6 text-center">团务管理</h3>
                <div className="space-y-3">
                    {isLeader ? (
                        <>
                            <button onClick={openEdit} className="w-full p-3 bg-gray-50 rounded-xl flex items-center gap-3 text-gray-700 hover:bg-gray-100 transition-colors">
                                <Edit2 size={20} className="text-indigo-500" /> 修改信息
                            </button>
                            <button onClick={handleDissolve} className="w-full p-3 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-100 transition-colors">
                                <Trash2 size={20} /> 解散陪团
                            </button>
                        </>
                    ) : (
                        <button onClick={handleLeave} className="w-full p-3 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-100 transition-colors">
                            <LogOut size={20} /> 退出陪团
                        </button>
                    )}
                    <button onClick={() => setShowManage(false)} className="w-full p-3 mt-4 text-gray-400 hover:text-gray-600 text-sm">
                        取消
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4">修改陪团信息</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">陪团名称</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                        <textarea 
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowEdit(false)} className="flex-1 py-3 text-gray-500 bg-gray-100 rounded-xl font-medium">
                            取消
                        </button>
                        <button onClick={handleSaveEdit} className="flex-1 py-3 text-white bg-indigo-600 rounded-xl font-bold shadow-lg shadow-indigo-200">
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}