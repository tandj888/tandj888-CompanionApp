import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PenTool, Flame, Clock, Heart, Users, Sparkles } from 'lucide-react';
import { useArticleStore } from '../stores/articleStore';
import { useUserStore } from '../stores/userStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function CommunityPage() {
  const navigate = useNavigate();
  const { articles, fetchArticles, isLoading } = useArticleStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<'hot' | 'latest' | 'following'>('hot');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles({ 
        sort: activeTab === 'hot' ? 'hot' : undefined, 
        search: searchQuery,
        filter: activeTab === 'following' ? 'following' : undefined,
        currentUserId: user?.id
    });
  }, [activeTab, searchQuery, user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Gradient */}
      <div className="bg-indigo-600 pt-8 pb-6 px-4 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 mb-[-2rem] z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">伴文社</h1>
                    <p className="text-indigo-100 text-xs mt-1 opacity-90">分享你的每一个微小进步</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Sparkles className="text-yellow-300" size={20} />
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 transition-all focus-within:bg-white/20 focus-within:border-white/40">
                <Search size={18} className="text-indigo-100" />
                <input
                    type="text"
                    placeholder="搜索文章、作者、标签"
                    className="bg-transparent flex-1 text-sm outline-none text-white placeholder:text-indigo-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>
        
      {/* Tabs */}
      <div className="px-4 relative z-10 mb-4">
        <div className="flex justify-between p-1.5 bg-white rounded-2xl shadow-lg shadow-indigo-100/50 border border-white/50">
          <button
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeTab === 'hot' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('hot')}
          >
            <Flame size={16} className={activeTab === 'hot' ? 'animate-pulse' : ''} />
            热门
          </button>
          <button
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeTab === 'latest' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('latest')}
          >
            <Clock size={16} />
            最新
          </button>
          <button
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activeTab === 'following' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('following')}
          >
            <Users size={16} />
            关注
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">正在加载精彩内容...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">暂无内容，快来发布第一篇吧！</p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 border border-gray-100/50 active:scale-[0.99]"
              onClick={() => navigate(`/community/article/${article.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1 mr-4 leading-snug">{article.title}</h3>
                {article.coverImage && (
                  <img src={article.coverImage} alt="Cover" className="w-20 h-20 object-cover rounded-2xl shadow-sm flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed font-light">{article.content}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.id}`}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full border border-white shadow-sm"
                  />
                  <span className="font-medium text-gray-600">{article.author.nickname}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg">
                    <Flame size={12} className={article.viewCount > 100 ? "text-orange-500" : "text-gray-400"} /> 
                    {article.viewCount}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg">
                    <Heart size={12} className={article.likeCount > 0 ? "text-pink-500" : "text-gray-400"} /> 
                    {article.likeCount}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/community/editor')}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-300 hover:shadow-indigo-400 hover:scale-105 transition-all z-20 active:scale-95"
      >
        <PenTool size={24} />
      </button>
    </div>
  );
}
