import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PenTool, Flame, Clock, Heart } from 'lucide-react';
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
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索文章、作者、标签"
            className="bg-transparent flex-1 text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between mt-3 text-sm font-medium text-gray-500">
          <button
            className={`flex-1 pb-2 border-b-2 ${activeTab === 'hot' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
            onClick={() => setActiveTab('hot')}
          >
            热门推荐
          </button>
          <button
            className={`flex-1 pb-2 border-b-2 ${activeTab === 'latest' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
            onClick={() => setActiveTab('latest')}
          >
            最新发布
          </button>
          <button
            className={`flex-1 pb-2 border-b-2 ${activeTab === 'following' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
            onClick={() => setActiveTab('following')}
          >
            关注
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">加载中...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-10 text-gray-400">暂无内容，快来发布第一篇吧！</div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl p-4 shadow-sm"
              onClick={() => navigate(`/community/article/${article.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 line-clamp-2 flex-1 mr-2">{article.title}</h3>
                {article.coverImage && (
                  <img src={article.coverImage} alt="Cover" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.content}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.id}`}
                    alt="Avatar"
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{article.author.nickname}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Flame size={12} /> {article.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {article.likeCount}
                  </span>
                  <span>{format(new Date(article.createdAt), 'MM-dd', { locale: zhCN })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/community/editor')}
        className="fixed bottom-24 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-20"
      >
        <PenTool size={24} />
      </button>
    </div>
  );
}
