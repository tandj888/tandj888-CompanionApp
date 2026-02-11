import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Star, MoreHorizontal, Send, PenTool, Image as ImageIcon, X } from 'lucide-react';
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
    // Focus input? Not easy with just state, but user will tap input
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

  if (!currentArticle) return <div className="text-center py-20">加载中...</div>;

  // Defensive check for rendering
  const authorAvatar = currentArticle.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentArticle.author?.id || 'unknown'}`;
  const authorName = currentArticle.author?.nickname || 'Unknown User';

  // Helper to filter out broken base64 chunks from legacy simple-array storage
  const isValidImage = (url: string) => {
    if (!url) return false;
    // Filter out the "header" part of broken base64 strings caused by simple-array splitting
    if (url === 'data:image/jpeg;base64' || url === 'data:image/png;base64') return false;
    // Filter out the "body" part (random base64 chars) - naive check: assume valid images are http URLs
    // We only accept full URLs (new system) or valid full data URIs (if any survived)
    return url.startsWith('http') || (url.startsWith('data:') && url.length > 100);
  };

  const renderComment = (comment: Comment) => {
    // Only render root comments with this function
    const allReplies = getAllReplies(comment.id);
    
    // Filter valid images
    const validImages = comment.images?.filter(isValidImage) || [];
    
    return (
        <div key={comment.id} className="mb-6">
            <div className="flex gap-3">
                <img 
                    src={comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id || 'unknown'}`} 
                    className="w-9 h-9 rounded-full flex-shrink-0" 
                />
                <div className="flex-1">
                    <div 
                        className="cursor-pointer"
                        onClick={() => handleReply(comment)}
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-gray-600">{comment.user?.nickname || 'Unknown'}</span>
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
                                        className="max-w-[200px] max-h-[200px] object-contain rounded border cursor-zoom-in bg-gray-50" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(img);
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-2 flex items-center gap-4">
                            <span className="text-xs text-gray-400">
                                {(() => {
                                    try {
                                        return comment.createdAt ? format(new Date(comment.createdAt), 'MM-dd HH:mm', { locale: zhCN }) : '';
                                    } catch (e) {
                                        return '';
                                    }
                                })()}
                            </span>
                        </div>
                    </div>

                    {/* Nested Replies (Full Avatar Style) */}
                    {allReplies.length > 0 && (
                        <div className="mt-3 space-y-4">
                            {allReplies.map(reply => {
                                const parentComment = comments.find(c => c.id === reply.parentId);
                                const isDirectReply = reply.parentId === comment.id;
                                const replyValidImages = reply.images?.filter(isValidImage) || [];
                                
                                return (
                                    <div key={reply.id} className="flex gap-2">
                                        <img 
                                            src={reply.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.id || 'unknown'}`} 
                                            className="w-6 h-6 rounded-full flex-shrink-0 mt-1" 
                                        />
                                        <div className="flex-1">
                                            <div 
                                                className="cursor-pointer"
                                                onClick={() => handleReply(reply)}
                                            >
                                                <div className="flex items-center flex-wrap text-sm">
                                                    <span className="font-bold text-gray-500 text-xs">{reply.user?.nickname}</span>
                                                    {!isDirectReply && parentComment && (
                                                        <>
                                                            <span className="text-gray-400 text-xs mx-1">回复</span>
                                                            <span className="font-bold text-gray-500 text-xs">{parentComment.user?.nickname}</span>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <p className="text-gray-800 text-sm mt-0.5">
                                                    {reply.content}
                                                </p>

                                                {replyValidImages.length > 0 && (
                                                    <div className="mt-2">
                                                        {replyValidImages.map((img, idx) => (
                                                            <img 
                                                                key={idx} 
                                                                src={img} 
                                                                className="max-w-[150px] max-h-[150px] object-contain rounded border cursor-zoom-in bg-gray-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImage(img);
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="mt-1">
                                                    <span className="text-[10px] text-gray-400">
                                                        {(() => {
                                                            try {
                                                                return reply.createdAt ? format(new Date(reply.createdAt), 'MM-dd HH:mm', { locale: zhCN }) : '';
                                                            } catch (e) {
                                                                return '';
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
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
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-4 py-3 border-b">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
            <img src={authorAvatar} className="w-8 h-8 rounded-full" />
            <span className="font-medium text-sm">{authorName}</span>
            {user && currentArticle.author?.id !== user.id && (
                <button 
                    onClick={handleFollow}
                    className={`text-xs px-3 py-1 rounded-full font-medium ml-2 transition-colors ${
                        isFollowed 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                >
                    {isFollowed ? '已关注' : '关注'}
                </button>
            )}
        </div>
        <button onClick={handleShare}>
          <MoreHorizontal size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Article Content */}
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">{currentArticle.title}</h1>
        <div className="text-gray-500 text-xs mb-6 flex gap-4">
            <span>{(() => {
                try {
                    return currentArticle.createdAt ? format(new Date(currentArticle.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : '';
                } catch (e) {
                    return '';
                }
            })()}</span>
            <span>{currentArticle.viewCount || 0} 阅读</span>
        </div>
        
        <div className="prose prose-indigo max-w-none text-gray-800 leading-loose">
          {(currentArticle.content || '').split('\n').map((p, i) => (
            <p key={i} className="mb-4">{p}</p>
          ))}
        </div>

        {/* Article Images */}
        {currentArticle.images && currentArticle.images.length > 0 && (
            <div className="mt-6 space-y-4">
                {currentArticle.images.map((img, index) => (
                    <img 
                        key={index} 
                        src={img} 
                        alt={`插图 ${index + 1}`} 
                        className="w-full rounded-lg shadow-sm" 
                    />
                ))}
            </div>
        )}
        
        {currentArticle.tags?.length > 0 && (
            <div className="flex gap-2 mt-8">
                {currentArticle.tags.map(tag => (
                    <span key={tag} className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-xs">#{tag}</span>
                ))}
            </div>
        )}
      </div>

      <div className="h-2 bg-gray-50"></div>

      {/* Comments */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-4">全部评论 ({comments.length})</h3>
        <div className="space-y-2">
            {getRootComments().map(comment => renderComment(comment))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
        >
            <img 
                src={previewImage} 
                className="max-w-full max-h-full object-contain"
                alt="Preview" 
            />
            <button 
                className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2"
                onClick={() => setPreviewImage(null)}
            >
                <X size={24} />
            </button>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white border-t px-4 py-2 z-50">
        {/* Reply Context */}
        {replyTo && (
            <div className="flex justify-between items-center bg-gray-50 px-3 py-1 mb-2 rounded text-xs text-gray-600">
                <span>回复 @{replyTo.user?.nickname}</span>
                <button onClick={() => setReplyTo(null)}><X size={14} /></button>
            </div>
        )}
        
        {/* Image Preview */}
        {commentImage && (
            <div className="relative inline-block mb-2 ml-2">
                <img src={commentImage} className="h-16 rounded border" />
                <button 
                    onClick={() => setCommentImage(null)}
                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5"
                >
                    <X size={12} />
                </button>
            </div>
        )}

        <div className="flex items-center gap-4 pb-safe">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0">
                    <ImageIcon size={20} className="text-gray-500" />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageSelect}
                />
                <input 
                    type="text" 
                    placeholder={replyTo ? `回复 ${replyTo.user?.nickname}...` : "说点什么..."}
                    className="bg-transparent text-sm flex-1 outline-none min-w-0"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                />
                {(commentText.trim() || commentImage) && (
                    <button onClick={handleSendComment} className="text-indigo-600 font-bold text-sm px-2 flex-shrink-0">
                        发送
                    </button>
                )}
            </div>
            
            {!replyTo && !commentText && !commentImage && (
                <div className="flex items-center gap-4 text-gray-600">
                    <button className="flex flex-col items-center gap-0.5" onClick={handleLike}>
                        <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                        <span className="text-[10px]">{currentArticle.likeCount || 0}</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5" onClick={handleFavorite}>
                        <Star size={24} className={isFavorited ? "fill-yellow-500 text-yellow-500" : ""} />
                        <span className="text-[10px]">收藏</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
