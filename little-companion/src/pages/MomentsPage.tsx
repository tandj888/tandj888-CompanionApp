import React from 'react';
import { useCheckInStore } from '../stores/checkInStore';
import { Calendar, Award, ChevronRight, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MomentsPage() {
  const { checkIns } = useCheckInStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 pt-12 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden mb-[-3rem] shadow-xl shadow-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <h1 className="relative z-10 text-2xl font-bold text-white tracking-wide">时光馆</h1>
        <p className="relative z-10 text-indigo-100 text-sm mt-1 opacity-90">记录每一个闪闪发光的时刻</p>
      </div>
      
      <div className="px-4 relative z-10">
        <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Badge Entry */}
            <div 
                onClick={() => navigate('/badges')}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white flex flex-col justify-between cursor-pointer shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform duration-300 aspect-[1.4] border border-white/20 relative overflow-hidden group"
            >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                    <Award size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">勋章墙</h3>
                    <p className="text-xs text-indigo-100 mt-1 font-medium opacity-90">记录高光时刻</p>
                </div>
            </div>

            {/* Gift Shop Entry */}
            <div 
                onClick={() => navigate('/gift/shop')}
                className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-5 text-white flex flex-col justify-between cursor-pointer shadow-lg shadow-pink-200 hover:scale-[1.02] transition-transform duration-300 aspect-[1.4] border border-white/20 relative overflow-hidden group"
            >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                    <Gift size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">礼品馆</h3>
                    <p className="text-xs text-pink-100 mt-1 font-medium opacity-90">坚持打卡领奖</p>
                </div>
            </div>
        </div>

        <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2 px-2">
            <Calendar size={18} className="text-indigo-500" />
            成长足迹
        </h2>
        
        {checkIns.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="opacity-30 text-indigo-400" />
                </div>
                <p>暂无打卡记录</p>
                <p className="text-xs mt-1 opacity-60">快去完成第一个目标吧</p>
            </div>
        ) : (
            <div className="space-y-4">
            {checkIns.map(checkIn => (
                <div key={checkIn.id} className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 hover:transform hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                            {checkIn.date}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            checkIn.status === 'completed' 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-orange-50 text-orange-600'
                        }`}>
                            {checkIn.status === 'completed' ? '已完成' : '未完成'}
                        </span>
                    </div>
                    {checkIn.record && (
                        <div className="bg-indigo-50/50 p-4 rounded-2xl text-sm text-gray-700 leading-relaxed border border-indigo-50">
                            {checkIn.record.text}
                        </div>
                    )}
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
