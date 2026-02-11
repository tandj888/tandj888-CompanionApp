import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Star, MoreHorizontal, Send, PenTool, Image as ImageIcon, X, ChevronRight, User } from 'lucide-react';
import { useArticleStore } from '../stores/articleStore';
import { useUserStore } from '../stores/userStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Comment } from '../types';
import { uploadFile } from '../api/client';
import { interactionApi } from '../api/interactionApi';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchArticle, currentArticle, comments, fetchComments, addComment, toggleLike, toggleFavorite } = useArticleStore();
  const { user } = useUserStore();
  
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false); // Optimistic UI
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
      fetchComments(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentArticle && user) {
        // Check statuses
        interactionApi.getLikeStatus(currentArticle.id, user.id)
            .then(res => setIsLiked(res.liked))
            .catch(console.error);
            
        interactionApi.getFavoriteStatus(currentArticle.id, user.id)
            .then(res => setIsFavorited(res.favorited))
            .catch(console.error);

        if (currentArticle.author?.id && currentArticle.author.id !== user.id) {
            interactionApi.getFollowStatus(user.id, currentArticle.author.id)
                .then(res => setIsFollowed(res.followed))
                .catch(console.error);
        }
    }
  }, [currentArticle, user]);

  const handleFollow = async () => {
    if (!user || !currentArticle?.author?.id) return;
    try {
        const result = await interactionApi.toggleFollow(user.id, currentArticle.author.id);
        setIsFollowed(result.followed);
    } catch (error) {
        console.error("Follow failed", error);
    }
  };

  const handleLike = async () => {
    if (!id || !user) return;
    setIsLiked(!isLiked);
    await toggleLike(id, user.id);
  };

  const handleFavorite = async () => {
    if (!id || !user) return;
    setIsFavorited(!isFavorited);
    await toggleFavorite(id, user.id);
  };

  const handleSendComment = async () => {
    if (!id || !user || (!commentText.trim() && !commentImage)) return;
    
    await addComment({
      articleId: id,
      userId: user.id,
      content: commentText,
      parentId: replyTo?.id,
      images: commentImage ? [commentImage] : undefined
    });
    
    setCommentText('');
    setReplyTo(null);
    setCommentImage(null);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setCommentImage(url);
      } catch (error) {
        console.error("Upload failed", error);
        alert("图片上传失败");
      }
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
  };

  const handleShare = async () => {
    if (!currentArticle) return;
    
    const shareData = {
      title: currentArticle.title,
      text: (currentArticle.content || '').substring(0, 50) + '...',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const getRootComments = () => {
    return comments.filter(c => !c.parentId);
  };

  // Recursively get all descendants
  const getAllReplies = (rootId: string) => {
    const replies: Comment[] = [];
    const findChildren = (parentId: string) => {
        const children = comments.filter(c => c.parentId === parentId);
        children.forEach(child => {
            replies.push(child);
            findChildren(child.id);
        });
    };
    findChildren(rootId);
    return replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  if (!currentArticle) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
    </div>
  );

  // Defensive check for rendering
  const authorAvatar = currentArticle.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentArticle.author?.id || 'unknown'}`;
  const authorName = currentArticle.author?.nickname || 'Unknown User';

  const isValidImage = (url: string) => {
    if (!url) return false;
    if (url === 'data:image/jpeg;base64' || url === 'data:image/png;base64') return false;
    return url.startsWith('http') || (url.startsWith('data:') && url.length > 100);
  };

  const renderComment = (comment: Comment) => {
    const allReplies = getAllReplies(comment.id);
    const validImages = comment.images?.filter(isValidImage) || [];
    
    return (
        <div key={comment.id} className="mb-6 group">
            <div className="flex gap-3">
                <img 
                    src={comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id || 'unknown'}`} 
                    className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-100 shadow-sm" 
                />
                <div className="flex-1 bg-gray-50/50 p-4 rounded-2xl rounded-tl-none hover:bg-gray-50 transition-colors">
                    <div 
                        className="cursor-pointer"
                        onClick={() => handleReply(comment)}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-gray-700">{comment.user?.nickname || 'Unknown'}</span>
                            <span className="text-[10px] text-gray-400">
                                {(() => {
                                    try {
                                        return comment.createdAt ? format(new Date(comment.createdAt), 'MM-dd HH:mm', { locale: zhCN }) : '';
                                    } catch (e) { return ''; }
                                })()}
                            </span>
                        </div>
                        
                        <p className="text-gray-800 text-sm mt-1 leading-relaxed">
                            {comment.content}
                        </p>
                        
                        {validImages.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {validImages.map((img, idx) => (
                                    <img 
                                        key={idx} 
                                        src={img} 
                                        className="max-w-[200px] max-h-[200px] object-contain rounded-xl border border-gray-200 cursor-zoom-in bg-white" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(img);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nested Replies */}
                    {allReplies.length > 0 && (
                        <div className="mt-4 space-y-3 pl-2 border-l-2 border-indigo-100">
                            {allReplies.map(reply => {
                                const parentComment = comments.find(c => c.id === reply.parentId);
                                const isDirectReply = reply.parentId === comment.id;
                                const replyValidImages = reply.images?.filter(isValidImage) || [];
                                
                                return (
                                    <div key={reply.id} className="flex gap-2">
                                        <img 
                                            src={reply.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.id || 'unknown'}`} 
                                            className="w-6 h-6 rounded-full flex-shrink-0 mt-1 shadow-sm" 
                                        />
                                        <div className="flex-1">
                                            <div 
                                                className="cursor-pointer bg-white p-3 rounded-xl shadow-sm border border-gray-100"
                                                onClick={() => handleReply(reply)}
                                            >
                                                <div className="flex items-center flex-wrap text-sm gap-1">
                                                    <span className="font-bold text-gray-600 text-xs">{reply.user?.nickname}</span>
                                                    {!isDirectReply && parentComment && (
                                                        <span className="text-gray-400 text-xs flex items-center gap-1">
                                                            <ChevronRight size={10} />
                                                            <span className="font-medium">{parentComment.user?.nickname}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <p className="text-gray-800 text-sm mt-1">
                                                    {reply.content}
                                                </p>

                                                {replyValidImages.length > 0 && (
                                                    <div className="mt-2">
                                                        {replyValidImages.map((img, idx) => (
                                                            <img 
                                                                key={idx} 
                                                                src={img} 
                                                                className="max-w-[150px] max-h-[150px] object-contain rounded-lg border cursor-zoom-in"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImage(img);
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Improved Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-20 flex justify-between items-center px-4 py-3 border-b border-gray-100/50 shadow-sm transition-all duration-300">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={authorAvatar} className="w-9 h-9 rounded-full border border-gray-100 shadow-sm" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="font-bold text-sm text-gray-800">{authorName}</span>
          {user && currentArticle.author?.id !== user.id && (
            <button 
                onClick={handleFollow}
                className={`text-xs px-4 py-1.5 rounded-full font-bold ml-1 transition-all duration-300 ${
                    isFollowed 
                    ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 active:scale-95'
                }`}
            >
                {isFollowed ? '已关注' : '关注'}
            </button>
          )}
        </div>
        <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Article Content */}
      <div className="p-6">
        <h1 className="text-2xl font-extrabold mb-4 text-gray-900 leading-tight tracking-tight">{currentArticle.title}</h1>
        
        <div className="flex items-center gap-4 mb-8 text-xs text-gray-400">
            <span className="bg-gray-100 px-2.5 py-1 rounded-md font-mono">
                {(() => {
                    try {
                        return currentArticle.createdAt ? format(new Date(currentArticle.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : '';
                    } catch (e) { return ''; }
                })()}
            </span>
            <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                {currentArticle.viewCount || 0} 阅读
            </span>
        </div>
        
        <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-loose">
          {(currentArticle.content || '').split('\n').map((p, i) => (
            <p key={i} className="mb-6">{p}</p>
          ))}
        </div>

        {/* Article Images */}
        {currentArticle.images && currentArticle.images.length > 0 && (
            <div className="mt-8 space-y-4">
                {currentArticle.images.map((img, index) => (
                    <img 
                        key={index} 
                        src={img} 
                        alt={`插图 ${index + 1}`} 
                        className="w-full rounded-2xl shadow-lg shadow-indigo-100/50" 
                    />
                ))}
            </div>
        )}
        
        {currentArticle.tags?.length > 0 && (
            <div className="flex gap-2 mt-10 flex-wrap">
                {currentArticle.tags.map(tag => (
                    <span key={tag} className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">#{tag}</span>
                ))}
            </div>
        )}
        
        {/* Interaction Bar (In-content) */}
        <div className="flex justify-center gap-8 mt-12 mb-4">
            <button 
                onClick={handleLike}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isLiked ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-pink-400'}`}
            >
                <div className={`p-4 rounded-full ${isLiked ? 'bg-pink-50 shadow-inner' : 'bg-gray-50'}`}>
                    <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                </div>
                <span className="text-xs font-medium">{currentArticle.likeCount + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button 
                onClick={handleFavorite}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isFavorited ? 'text-amber-500 scale-110' : 'text-gray-400 hover:text-amber-400'}`}
            >
                <div className={`p-4 rounded-full ${isFavorited ? 'bg-amber-50 shadow-inner' : 'bg-gray-50'}`}>
                    <Star size={28} fill={isFavorited ? "currentColor" : "none"} />
                </div>
                <span className="text-xs font-medium">{isFavorited ? '已收藏' : '收藏'}</span>
            </button>
        </div>
      </div>

      <div className="h-3 bg-gray-50 border-y border-gray-100/50"></div>

      {/* Comments */}
      <div className="p-6">
        <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
            <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
            全部评论 <span className="text-gray-400 text-sm font-normal">({comments.length})</span>
        </h3>
        <div className="space-y-2">
            {getRootComments().map(comment => renderComment(comment))}
        </div>
        {comments.length === 0 && (
            <div className="text-center py-12 text-gray-300">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                <p>快来发表第一条评论吧~</p>
            </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
        >
            <img 
                src={previewImage} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                alt="Preview" 
            />
            <button 
                className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-md transition-colors"
                onClick={() => setPreviewImage(null)}
            >
                <X size={24} />
            </button>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {/* Reply Context */}
        {replyTo && (
            <div className="flex justify-between items-center bg-indigo-50 px-4 py-2 mb-3 rounded-xl text-xs text-indigo-700 border border-indigo-100 animate-in slide-in-from-bottom-2">
                <span className="font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    回复 @{replyTo.user?.nickname}
                </span>
                <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-indigo-100 rounded-full"><X size={14} /></button>
            </div>
        )}

        {/* Image Preview in Input */}
        {commentImage && (
            <div className="relative inline-block mb-3 animate-in slide-in-from-bottom-2">
                <img src={commentImage} className="h-20 rounded-xl border border-gray-200 shadow-sm" alt="Selected" />
                <button 
                    onClick={() => setCommentImage(null)}
                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md hover:bg-gray-900"
                >
                    <X size={12} />
                </button>
            </div>
        )}

        <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100/80 rounded-full px-4 py-2.5 flex items-center gap-2 border border-transparent focus-within:bg-white focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-inner">
                <input
                    type="text"
                    placeholder={replyTo ? `回复 ${replyTo.user?.nickname}...` : "说点什么..."}
                    className="bg-transparent flex-1 text-sm outline-none placeholder:text-gray-400"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                >
                    <ImageIcon size={20} />
                </button>
            </div>
            
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
            />

            {commentText.trim() || commentImage ? (
                <button 
                    onClick={handleSendComment}
                    className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 transition-all"
                >
                    <Send size={18} />
                </button>
            ) : (
                <div className="flex items-center gap-4 text-gray-400 px-1">
                    <button onClick={handleLike} className={isLiked ? "text-pink-500" : ""}>
                         <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button onClick={handleFavorite} className={isFavorited ? "text-amber-500" : ""}>
                         <Star size={24} fill={isFavorited ? "currentColor" : "none"} />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
