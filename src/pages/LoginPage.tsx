import React from 'react';
import { useUserStore } from '../stores/userStore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate WeChat login delay
    setTimeout(() => {
      login({});
      navigate('/');
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">小陪伴</h1>
        <p className="text-gray-500 text-lg">微目标 · 轻陪伴 · 悦自己</p>
      </div>

      <button
        onClick={handleLogin}
        className="w-full max-w-xs bg-[#07C160] hover:bg-[#06ad56] text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors"
      >
        <MessageCircle size={24} />
        微信一键登录
      </button>

      <div className="mt-8 text-xs text-gray-400 text-center">
        <p>登录即代表同意</p>
        <div className="flex gap-1 justify-center mt-1">
          <span className="text-blue-500">《用户协议》</span>
          <span>和</span>
          <span className="text-blue-500">《隐私政策》</span>
        </div>
      </div>
    </div>
  );
}
