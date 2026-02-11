import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckInStore } from '../stores/checkInStore';
import { ArrowLeft, Camera as CameraIcon, X, Check, Image as ImageIcon } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function MicroRecordAddPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const goalId = searchParams.get('goalId');
  const { addRecordToToday } = useCheckInStore(); 
  
  const [text, setText] = useState('');
  const [image, setImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Camera error:', error);
      // Fallback to file input if camera fails
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };


  const handleSave = () => {
    if (!text && !image) {
        alert('请输入文字或拍摄照片');
        return;
    }
    if (text.length > 50) {
        alert('文字记录最多50字');
        return;
    }

    if (goalId) {
        addRecordToToday(goalId, text, image || undefined);
    } else {
        alert('未找到关联的打卡记录');
        navigate('/');
        return;
    }
    
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Header */}
      <div className="bg-indigo-600 pt-8 pb-12 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-lg shadow-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="relative z-10 flex items-center justify-between text-white">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold tracking-wide">添加微记录</h1>
            <button 
                onClick={handleSave} 
                className="bg-white/20 px-4 py-1.5 rounded-full font-bold text-sm backdrop-blur-md hover:bg-white/30 transition-colors shadow-inner flex items-center gap-1"
            >
              <Check size={14} /> 保存
            </button>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 space-y-4">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="说说你今天的小收获吧（1-50字）"
            maxLength={50}
            className="w-full h-32 p-4 bg-gray-50/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
            />
            
            {image && (
                <div className="relative group">
                    <img src={image} alt="Preview" className="w-full rounded-2xl object-cover max-h-64 shadow-md" />
                    <button 
                        onClick={() => setImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="border-t border-gray-100 pt-4 flex gap-3">
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                />
                
                <button 
                    onClick={handleTakePhoto}
                    className="flex-1 h-14 bg-indigo-50 hover:bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 gap-2 transition-colors font-medium text-sm"
                >
                    <CameraIcon size={20} />
                    <span>拍摄照片</span>
                </button>
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-14 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 gap-2 transition-colors font-medium text-sm"
                >
                    <ImageIcon size={20} />
                    <span>相册上传</span>
                </button>
            </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-400">
            记录美好，留下回忆
        </div>
      </div>
    </div>
  );
}
