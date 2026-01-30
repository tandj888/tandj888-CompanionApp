import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useGoalStore } from '../stores/goalStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useGroupStore } from '../stores/groupStore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Smartphone, ArrowLeft, Lock, User as UserIcon } from 'lucide-react';
import { userApi } from '../api/userApi';

export default function LoginPage() {
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone'>('wechat');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWeChatLogin = () => {
    setIsLoading(true);
    // Simulate WeChat login delay
    setTimeout(() => {
      login({
        nickname: '微信用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      });
      navigate('/');
    }, 1000);
  };

  const handleAuth = async () => {
    if (!phoneNumber || !password) {
        setError('请输入手机号和密码');
        return;
    }
    if (isRegistering && !nickname) {
        setError('注册需要填写昵称');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        if (isRegistering) {
            await userApi.register(phoneNumber, password, nickname);
            // Auto login after register
            await login({ phone: phoneNumber, password });
        } else {
            await login({ phone: phoneNumber, password });
        }
        
        // Trigger syncs
        await Promise.all([
            useGoalStore.getState().syncWithBackend(),
            useCheckInStore.getState().syncWithBackend(),
            useGroupStore.getState().syncWithBackend()
        ]);

        navigate('/');
    } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || (isRegistering ? '注册失败' : '登录失败，请检查账号密码'));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">小陪伴</h1>
        <p className="text-gray-500 text-lg">微目标 · 轻陪伴 · 悦自己</p>
      </div>

      {loginMethod === 'wechat' ? (
        <div className="w-full max-w-xs space-y-4">
            <button
                onClick={handleWeChatLogin}
                disabled={isLoading}
                className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                <MessageCircle size={24} />
                {isLoading ? '登录中...' : '微信一键登录 (模拟)'}
            </button>
            
            <button
                onClick={() => setLoginMethod('phone')}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors"
            >
                <Smartphone size={24} />
                手机号码登录/注册
            </button>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-4">
            <div className="text-left mb-6">
                <button 
                    onClick={() => {
                        setLoginMethod('wechat');
                        setError('');
                        setIsRegistering(false);
                    }}
                    className="flex items-center text-gray-400 hover:text-gray-600 mb-4"
                >
                    <ArrowLeft size={20} className="mr-1" /> 返回
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {isRegistering ? '注册账号' : '手机号码登录'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {isRegistering ? '创建一个新账号开启旅程' : '欢迎回来，请登录'}
                </p>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Smartphone className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input
                        type="tel"
                        placeholder="手机号码"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>

                {isRegistering && (
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="昵称"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full pl-12 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                )}

                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>

                {error && <p className="text-red-500 text-sm px-1">{error}</p>}
            </div>

            <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors mt-6 disabled:opacity-50"
            >
                {isLoading ? '处理中...' : (isRegistering ? '注册并登录' : '登录')}
            </button>

            <button
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                }}
                className="w-full text-indigo-600 text-sm font-medium py-2 text-center hover:underline"
            >
                {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
        </div>
      )}

      <div className="mt-12 text-xs text-gray-400 text-center">
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