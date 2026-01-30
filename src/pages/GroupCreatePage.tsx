import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { useUserStore } from '../stores/userStore';
import { ArrowLeft } from 'lucide-react';

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const { createGroup } = useGroupStore();
  const { user } = useUserStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name) {
      alert('请输入陪团名称（1-8字）');
      return;
    }
    if (name.length > 8) {
      alert('陪团名称不可超过8字');
      return;
    }
    if (description.length > 20) {
      alert('陪团描述不可超过20字');
      return;
    }
    
    if (!user) return;

    createGroup(name, description, user);
    
    // Show success modal then navigate (simplified)
    alert('建团成功！');
    navigate('/group');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">创建小陪团</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">陪团名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：早起打卡团（1-8字）"
            maxLength={8}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">陪团描述（可选）</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：一起坚持喝水（1-20字）"
            maxLength={20}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors mt-8"
        >
          邀请成员
        </button>
      </div>
    </div>
  );
}
