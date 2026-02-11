import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useGoalStore } from '../stores/goalStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useGroupStore } from '../stores/groupStore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Smartphone, ArrowRight, Lock, User as UserIcon, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 text-white">
          <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-wide">小陪伴</h1>
          <p className="text-indigo-100 text-lg font-light tracking-wider opacity-90">微目标 · 轻陪伴 · 悦自己</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-indigo-900/20 border border-white/50">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
            </div>
          )}

          {loginMethod === 'wechat' ? (
            <div className="space-y-4">
                <button
                    onClick={handleWeChatLogin}
                    disabled={isLoading}
                    className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-medium py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:scale-100"
                >
                    <MessageCircle size={24} />
                    {isLoading ? '登录中...' : '微信一键登录 (模拟)'}
                </button>
                
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/0 text-gray-400 bg-white">或者</span>
                    </div>
                </div>

                <button
                    onClick={() => setLoginMethod('phone')}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 hover:border-gray-300"
                >
                    <Smartphone size={22} />
                    手机号码登录/注册
                </button>
            </div>
          ) : (
            <div className="space-y-5">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{isRegistering ? '注册新账号' : '欢迎回来'}</h2>
                    <p className="text-sm text-gray-400 mt-1">{isRegistering ? '填写以下信息完成注册' : '使用手机号码登录'}</p>
                </div>

                <div className="space-y-4">
                    {isRegistering && (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all">
                            <UserIcon size={20} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="你的昵称"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="bg-transparent flex-1 outline-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>
                    )}
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all">
                        <Smartphone size={20} className="text-gray-400" />
                        <input
                            type="tel"
                            placeholder="手机号码"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="bg-transparent flex-1 outline-none text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all">
                        <Lock size={20} className="text-gray-400" />
                        <input
                            type="password"
                            placeholder="密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent flex-1 outline-none text-gray-800 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <button
                    onClick={handleAuth}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:scale-100 mt-6"
                >
                    {isLoading ? (
                        '处理中...'
                    ) : (
                        <>
                            {isRegistering ? '立即注册' : '登录'}
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>

                <div className="flex items-center justify-between text-sm mt-6">
                    <button 
                        onClick={() => setLoginMethod('wechat')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ← 返回微信登录
                    </button>
                    <button 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
                    </button>
                </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-white/60 text-xs">
            <p>© 2024 Little Companion. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}