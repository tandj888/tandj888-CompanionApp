import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticleStore } from '../stores/articleStore';
import { useUserStore } from '../stores/userStore';
import { useNotificationStore } from '../stores/notificationStore';
import { ArrowLeft, Edit2, Eye, Heart, MessageSquare, Trash2, FileText, Send, User as UserIcon, BarChart3, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 mb-[-2rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex items-center justify-between text-white mb-6">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">创作中心</h1>
            <div className="w-10"></div>
        </div>

        {/* Stats Summary */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-bold text-white">{userArticles.length}</div>
                <div className="text-[10px] text-indigo-100 opacity-80 uppercase tracking-wider mt-1">作品</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-bold text-white">{totalLikes}</div>
                <div className="text-[10px] text-indigo-100 opacity-80 uppercase tracking-wider mt-1">获赞</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                <div className="text-xl font-bold text-white">{totalViews}</div>
                <div className="text-[10px] text-indigo-100 opacity-80 uppercase tracking-wider mt-1">阅读</div>
            </div>
        </div>
      </div>

      <div className="px-4 relative z-10 space-y-4 mt-4">
        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-white/50 flex gap-1 mb-4">
          <button 
            onClick={() => setActiveTab('works')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'works' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Edit2 size={14} /> 我的作品
          </button>
          <button 
            onClick={() => setActiveTab('interactions')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'interactions' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={14} /> 互动消息
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'data' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={14} /> 数据
          </button>
        </div>

        {activeTab === 'works' && (
          <div className="space-y-4">
            <button 
                onClick={() => navigate('/community/editor')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform transition-transform active:scale-98"
            >
                <Edit2 size={18} /> 写新文章
            </button>
            
            {userArticles.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-lg shadow-indigo-100/50 border border-white/50">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">开启创作之旅</h3>
                    <p className="text-gray-500 text-sm">分享你的故事，记录美好时刻</p>
                </div>
            ) : (
                userArticles.map(article => (
                    <div 
                        key={article.id}
                        onClick={() => navigate(`/community/article/${article.id}`)}
                        className="bg-white p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 relative group active:scale-98 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-8">
                                <h3 className="font-bold text-gray-900 line-clamp-1 text-lg mb-1">{article.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                                        article.status === 'published' 
                                        ? 'bg-green-50 text-green-600' 
                                        : 'bg-amber-50 text-amber-600'
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
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors absolute top-4 right-4"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                                <Eye size={12} /> {article.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1.5 bg-pink-50 text-pink-500 px-2 py-1 rounded-lg">
                                <Heart size={12} /> {article.likeCount || 0}
                            </span>
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-500 px-2 py-1 rounded-lg">
                                <MessageSquare size={12} /> {article.commentCount || 0}
                            </span>
                        </div>
                    </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'interactions' && (
            <div className="space-y-3">
                {interactionNotifications.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-lg shadow-indigo-100/50 border border-white/50">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-gray-500">暂无互动消息</p>
                    </div>
                ) : (
                    interactionNotifications.map(notification => (
                        <div key={notification.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
                            <div className={`p-3 rounded-2xl h-fit shrink-0 ${
                                notification.type === 'like' ? 'bg-pink-100 text-pink-500' :
                                notification.type === 'comment' ? 'bg-blue-100 text-blue-500' :
                                'bg-indigo-100 text-indigo-500'
                            }`}>
                                {notification.type === 'like' && <Heart size={18} className="fill-current" />}
                                {notification.type === 'comment' && <MessageSquare size={18} className="fill-current" />}
                                {notification.type === 'follow' && <UserIcon size={18} className="fill-current" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.content}</p>
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
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-indigo-600" />
                        数据概览
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">总发布量</span>
                                <span className="font-bold text-indigo-600">{userArticles.length} 篇</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">已发布 (公开)</span>
                                <span className="font-bold text-green-600">{userArticles.filter(a => a.status === 'published').length} 篇</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-green-500 h-full rounded-full" style={{ width: `${userArticles.length ? (userArticles.filter(a => a.status === 'published').length / userArticles.length * 100) : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-3xl border border-pink-100">
                        <div className="text-pink-500 mb-2"><Heart size={24} className="fill-current" /></div>
                        <div className="text-2xl font-bold text-gray-800">{totalLikes}</div>
                        <div className="text-xs text-gray-500 mt-1">总获得喜欢</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-3xl border border-blue-100">
                        <div className="text-blue-500 mb-2"><MessageSquare size={24} className="fill-current" /></div>
                        <div className="text-2xl font-bold text-gray-800">{totalComments}</div>
                        <div className="text-xs text-gray-500 mt-1">总获得评论</div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
