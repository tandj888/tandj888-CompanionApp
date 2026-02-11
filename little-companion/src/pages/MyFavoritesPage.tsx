
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Heart } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold">我的收藏</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">加载中...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-10 text-gray-400">暂无收藏的文章</div>
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
    </div>
  );
}
