import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckInStore } from '../stores/checkInStore';
import { ArrowLeft, Camera as CameraIcon, X } from 'lucide-react';
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
      // Fallback to file input if camera fails (e.g. on web without secure context)
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
        // Fallback: try to add to the first checkin of today if goalId missing
        // But better to just alert
        alert('未找到关联的打卡记录');
        navigate('/');
        return;
    }
    
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">添加微记录</h1>
        <button onClick={handleSave} className="text-indigo-600 font-medium">
          保存
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="说说你今天的小收获吧（1-50字）"
          maxLength={50}
          className="w-full h-32 p-0 border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400"
        />
        
        {image && (
            <div className="relative">
                <img src={image} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />
                <button 
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                >
                    <X size={16} />
                </button>
            </div>
        )}

        <div className="border-t border-gray-100 pt-4">
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
            className="w-20 h-20 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <CameraIcon size={24} />
            <span className="text-xs mt-1">拍照</span>
          </button>
        </div>
      </div>
    </div>
  );
}
