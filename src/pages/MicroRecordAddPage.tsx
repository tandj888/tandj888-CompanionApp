import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckInStore } from '../stores/checkInStore';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { MicroRecord } from '../types';

export default function MicroRecordAddPage() {
  const navigate = useNavigate();
  const { checkIns, addRecordToToday } = useCheckInStore(); 
  
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text) {
        // Allow empty? "Text record (required, 1-50 chars)"
        alert('请输入1-50字的文字记录');
        return;
    }
    if (text.length > 50) {
        alert('文字记录最多50字');
        return;
    }

    addRecordToToday(text);
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
        
        <div className="border-t border-gray-100 pt-4">
          <button className="w-20 h-20 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <ImageIcon size={24} />
            <span className="text-xs mt-1">上传图片</span>
          </button>
        </div>
      </div>
    </div>
  );
}
