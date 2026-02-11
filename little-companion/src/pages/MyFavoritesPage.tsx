
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Heart, MessageCircle } from 'lucide-react';
import { useArticleStore } from '../stores/articleStore';
import { useUserStore } from '../stores/userStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function MyFavoritesPage() {
  const navigate = useNavigate();
  const { articles, fetchArticles, isLoading } = useArticleStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.id) {
        fetchArticles({ 
            filter: 'favorites',
            currentUserId: user.id
        });
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 mb-[-2rem] z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">我的收藏</h1>
            <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-12 space-y-4">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Heart size={32} />
            </div>
            <p className="text-gray-500 font-medium">暂无收藏的文章</p>
            <p className="text-gray-400 text-sm mt-1">快去伴文社看看吧</p>
            <button 
                onClick={() => navigate('/community')}
                className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
                去逛逛
            </button>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-[0.98] transition-all"
              onClick={() => navigate(`/community/article/${article.id}`)}
            >
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <img
                            src={article.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.id}`}
                            alt="Avatar"
                            className="w-5 h-5 rounded-full object-cover bg-gray-100"
                        />
                        <span className="text-xs text-gray-500 truncate">{article.author.nickname}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-2 text-base mb-2 leading-snug">{article.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">{article.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Flame size={12} className="text-orange-400" /> 
                                {article.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart size={12} className="text-pink-400" /> 
                                {article.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle size={12} className="text-blue-400" /> 
                                {article.commentCount || 0}
                            </span>
                        </div>
                        <span>{format(new Date(article.createdAt), 'MM-dd', { locale: zhCN })}</span>
                    </div>
                </div>
                {article.coverImage && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                        src={article.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover rounded-xl bg-gray-100" 
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
