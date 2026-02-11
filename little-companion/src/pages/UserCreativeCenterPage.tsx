import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticleStore } from '../stores/articleStore';
import { useUserStore } from '../stores/userStore';
import { useNotificationStore } from '../stores/notificationStore';
import { ArrowLeft, Edit2, Eye, Heart, MessageSquare, Trash2, FileText, Send, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function UserCreativeCenterPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { articles, fetchArticles, deleteArticle } = useArticleStore();
  const { notifications } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState<'works' | 'interactions' | 'data'>('works');

  useEffect(() => {
    if (user) {
      // Fetch user's articles (ArticleController modified to support userId filter)
      fetchArticles({ search: '', category: '', sort: '', userId: user.id } as any);
    }
  }, [user, fetchArticles]);

  const userArticles = articles.filter(a => a.authorId === user?.id);
  
  // Calculate stats
  const totalViews = userArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
  const totalLikes = userArticles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
  const totalComments = userArticles.reduce((sum, a) => sum + (a.commentCount || 0), 0);

  // Filter interaction notifications
  const interactionNotifications = notifications.filter(n => 
    ['like', 'comment', 'follow'].includes(n.type)
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这篇文章吗？')) {
      await deleteArticle(id);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">我的创作中心</h1>
        </div>

        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('works')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'works' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
            }`}
          >
            我的创作
          </button>
          <button 
            onClick={() => setActiveTab('interactions')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'interactions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
            }`}
          >
            互动消息
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'data' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
            }`}
          >
            创作数据
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'works' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">共 {userArticles.length} 篇作品</span>
                <button 
                    onClick={() => navigate('/community/editor')}
                    className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
                >
                    <Edit2 size={16} /> 写文章
                </button>
            </div>
            
            {userArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>暂无作品，快去创作吧</p>
                </div>
            ) : (
                userArticles.map(article => (
                    <div 
                        key={article.id}
                        onClick={() => navigate(`/community/article/${article.id}`)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{article.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        article.status === 'published' 
                                        ? 'bg-green-50 text-green-600' 
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {article.status === 'published' ? '已发布' : '草稿'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(article.createdAt), 'yyyy-MM-dd HH:mm')}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleDelete(e, article.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                            <span className="flex items-center gap-1">
                                <Eye size={14} /> {article.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart size={14} /> {article.likeCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={14} /> {article.commentCount || 0}
                            </span>
                        </div>
                    </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'interactions' && (
            <div className="space-y-4">
                {interactionNotifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                        <p>暂无互动消息</p>
                    </div>
                ) : (
                    interactionNotifications.map(notification => (
                        <div key={notification.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                            <div className={`p-2 rounded-full h-fit ${
                                notification.type === 'like' ? 'bg-pink-50 text-pink-500' :
                                notification.type === 'comment' ? 'bg-blue-50 text-blue-500' :
                                'bg-indigo-50 text-indigo-500'
                            }`}>
                                {notification.type === 'like' && <Heart size={16} />}
                                {notification.type === 'comment' && <MessageSquare size={16} />}
                                {notification.type === 'follow' && <UserIcon size={16} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {format(new Date(notification.createdAt), 'MM-dd HH:mm')}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'data' && (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                        <p className="text-2xl font-bold text-indigo-600">{totalViews}</p>
                        <p className="text-xs text-gray-500 mt-1">总阅读量</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                        <p className="text-2xl font-bold text-pink-500">{totalLikes}</p>
                        <p className="text-xs text-gray-500 mt-1">总获赞</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                        <p className="text-2xl font-bold text-blue-500">{totalComments}</p>
                        <p className="text-xs text-gray-500 mt-1">总评论</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">数据概览</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">发布文章</span>
                                <span className="font-bold">{userArticles.length} 篇</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">已发布</span>
                                <span className="font-bold">{userArticles.filter(a => a.status === 'published').length} 篇</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${userArticles.length ? (userArticles.filter(a => a.status === 'published').length / userArticles.length * 100) : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
