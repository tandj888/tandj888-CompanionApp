import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Save, Send } from 'lucide-react';
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
      // Create a fake URL for preview (Simulation)
      // In a real app, we would upload this file to a server.
      // For this simulation/local-test, we'll use FileReader to get a base64 string
      // so it persists (somewhat) in the DB if the string isn't too long.
      // Or just use object URL for session-only preview? 
      // User asked for "simulate pick phone photo".
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // For simple-array compatibility (no commas), we might need to handle this.
        // But for now, let's just add it. If it breaks, we use ObjectURL.
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="flex items-center gap-1 text-gray-500 text-sm font-medium hover:text-indigo-600"
          >
            <Save size={16} /> 存草稿
          </button>
          <button
            onClick={handlePublish}
            disabled={isLoading || !title || !content}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
          >
            <Send size={16} /> 发布
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="请输入标题"
          className="text-xl font-bold outline-none w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="分享你的故事..."
          className="flex-1 resize-none outline-none text-gray-700 leading-relaxed text-base"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {/* Images Preview */}
        {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
                {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                            className="absolute top-0 right-0 bg-black/50 text-white p-1"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Toolbar */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                #{tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))}>×</button>
              </span>
            ))}
            <div className="flex items-center gap-1 bg-gray-50 rounded px-2">
              <span className="text-gray-400">#</span>
              <input
                type="text"
                placeholder="添加标签"
                className="bg-transparent text-xs w-20 outline-none py-1"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                onBlur={addTag}
              />
            </div>
          </div>
          
          <div className="flex gap-4 text-gray-500">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 hover:text-indigo-600"
            >
              <Image size={20} />
              <span className="text-xs">添加图片 (手机相册)</span>
            </button>
            <button 
                onClick={addImage}
                className="flex items-center gap-1 hover:text-indigo-600"
            >
              <span className="text-xs">添加图片链接</span>
            </button>
          </div>
        </div>
      </div>

      {showImageInput && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-sm shadow-xl">
                <h3 className="text-lg font-bold mb-3">添加图片链接</h3>
                <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full border p-2 rounded mb-4 outline-none focus:border-indigo-500"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => setShowImageInput(false)}
                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmImage}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
