import React, { useState } from 'react';
import { useGroupStore } from '../stores/groupStore';
import { useUserStore } from '../stores/userStore';
import { Users, Plus, Heart, Copy, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GroupPage() {
  const { group, joinGroup } = useGroupStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [likedMembers, setLikedMembers] = useState<string[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleLike = (memberId: string) => {
    if (likedMembers.includes(memberId)) return;
    setLikedMembers([...likedMembers, memberId]);
    alert('已点赞！对方会收到你的鼓励哦～');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(group?.inviteCode || 'ABCDEF');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    if (!user) return;
    joinGroup(joinCode.trim(), user);
  };

  if (!group) {
    return (
      <div className="p-6 pt-12 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          <Users size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">加入小陪团</h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          和2-3位好友一起打卡，互相监督，共同进步
        </p>
        
        <div className="w-full max-w-xs space-y-4">
            <button 
                onClick={() => navigate('/group/create')}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-200"
            >
                创建小陪团
            </button>
            
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="输入邀请码加入"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    className="w-full bg-white border border-gray-200 py-3 pl-4 pr-12 rounded-xl text-center focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                    onClick={handleJoin}
                    disabled={!joinCode.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 disabled:text-gray-300 transition-colors hover:bg-indigo-50 rounded-lg"
                >
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 min-h-screen relative">
      <h1 className="text-2xl font-bold mb-6">我的小陪团</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">{group.name}</h2>
        <p className="text-gray-500 text-sm mb-6">{group.description || '暂无描述'}</p>

        <div className="space-y-4">
          {group.members.map(member => {
            const isMe = member.id === user?.id;
            // Mock check-in status for demo (except for me)
            const hasCheckedIn = isMe ? member.hasCheckedInToday : (Math.random() > 0.5); 
            
            return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <img src={member.avatar} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">{member.nickname}</p>
                            <p className="text-xs text-gray-500">
                                {hasCheckedIn ? '今日已打卡' : '今日未打卡'}
                            </p>
                        </div>
                    </div>
                    
                    {hasCheckedIn && !isMe && (
                        <button 
                            onClick={() => handleLike(member.id)}
                            className={`p-2 rounded-full transition-colors ${
                                likedMembers.includes(member.id) 
                                ? 'text-pink-500 bg-pink-50' 
                                : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                            }`}
                        >
                            <Heart size={20} fill={likedMembers.includes(member.id) ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>
            );
          })}
          
          {group.members.length < 3 && (
             <div 
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
             >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Plus size={20} />
                </div>
                <p className="text-sm text-gray-400 group-hover:text-indigo-500 font-medium">邀请新成员</p>
             </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">邀请好友加入</h3>
                <p className="text-gray-500 mb-6 text-sm">发送邀请码给好友，对方输入即可加入</p>
                
                <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between mb-8 border border-gray-100">
                    <span className="text-2xl font-mono font-bold tracking-wider text-gray-800">
                        {group.inviteCode || 'ABCDEF'}
                    </span>
                    <button 
                        onClick={handleCopy} 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
                
                <button 
                    onClick={() => setShowInvite(false)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                    关闭
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
