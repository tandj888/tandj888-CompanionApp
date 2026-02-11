import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Save, Send, X, Plus } from 'lucide-react';
import { useArticleStore } from '../stores/articleStore';
import { useUserStore } from '../stores/userStore';

export default function ArticleEditorPage() {
  const navigate = useNavigate();
  const { createArticle, isLoading } = useArticleStore();
  const { user } = useUserStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages([...images, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) return;
    if (!user) return;

    await createArticle({
      title: title || '无标题草稿',
      content,
      tags,
      images,
      userId: user.id,
      status: 'draft'
    });
    navigate('/community');
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    if (!user) return;

    await createArticle({
      title,
      content,
      tags,
      images,
      userId: user.id,
      status: 'published'
    });
    navigate('/community');
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const addImage = () => {
    setShowImageInput(true);
  };

  const handleConfirmImage = () => {
    if (imageUrl) {
        setImages([...images, imageUrl]);
        setImageUrl('');
        setShowImageInput(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200 mb-[-2rem] shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex items-center justify-between text-white">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-wide">写文章</h1>
            <button 
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="text-sm font-medium hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
                <Save size={16} /> 存草稿
            </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 px-4 relative z-10 pb-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 h-full flex flex-col overflow-hidden">
            {/* Title Input */}
            <div className="p-5 border-b border-gray-100">
                <input
                    type="text"
                    placeholder="请输入标题..."
                    className="w-full text-xl font-bold outline-none bg-transparent placeholder:text-gray-300 text-gray-800"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Content Textarea */}
            <div className="flex-1 p-5 relative">
                <textarea
                    placeholder="分享你的故事，记录每一个感动的瞬间..."
                    className="w-full h-full resize-none outline-none text-gray-700 leading-relaxed text-base bg-transparent placeholder:text-gray-300"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {/* Images Preview Area */}
            {images.length > 0 && (
                <div className="px-5 py-2 overflow-x-auto flex gap-3 border-t border-gray-50 bg-gray-50/30">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden shadow-sm group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Toolbar */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <span key={tag} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                            #{tag}
                            <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-indigo-800"><X size={10} /></button>
                        </span>
                    ))}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                        <span className="text-gray-400 text-xs">#</span>
                        <input
                            type="text"
                            placeholder="添加标签"
                            className="bg-transparent text-xs w-16 outline-none"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTag()}
                            onBlur={addTag}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
                        >
                            <Image size={18} />
                            <span className="text-xs font-medium">相册</span>
                        </button>
                        <button 
                            onClick={addImage}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
                        >
                            <Plus size={18} />
                            <span className="text-xs font-medium">链接</span>
                        </button>
                    </div>

                    <button
                        onClick={handlePublish}
                        disabled={isLoading || !title || !content}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                        <Send size={16} /> 发布
                    </button>
                </div>
            </div>
        </div>
      </div>

      {showImageInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <h3 className="text-lg font-bold mb-4 text-gray-800">添加图片链接</h3>
                <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl mb-6 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setShowImageInput(false)}
                        className="px-5 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmImage}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                    >
                        确认
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
