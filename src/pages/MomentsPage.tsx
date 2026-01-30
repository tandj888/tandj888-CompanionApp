import React from 'react';
import { useCheckInStore } from '../stores/checkInStore';
import { Calendar, Award, ChevronRight, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MomentsPage() {
  const { checkIns } = useCheckInStore();
  const navigate = useNavigate();

  return (
    <div className="p-6 pt-12 pb-24">
      <h1 className="text-2xl font-bold mb-6">时光馆</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Badge Entry */}
        <div 
            onClick={() => navigate('/badges')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white flex flex-col justify-between cursor-pointer shadow-lg shadow-indigo-200 aspect-[1.5]"
        >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Award size={20} />
            </div>
            <div>
                <h3 className="font-bold">勋章墙</h3>
                <p className="text-xs text-indigo-100 mt-1">记录高光时刻</p>
            </div>
        </div>

        {/* Gift Shop Entry */}
        <div 
            onClick={() => navigate('/gift/shop')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-4 text-white flex flex-col justify-between cursor-pointer shadow-lg shadow-pink-200 aspect-[1.5]"
        >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Gift size={20} />
            </div>
            <div>
                <h3 className="font-bold">礼品馆</h3>
                <p className="text-xs text-pink-100 mt-1">坚持打卡领奖</p>
            </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">成长足迹</h2>
      {checkIns.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p>暂无打卡记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checkIns.map(checkIn => (
            <div key={checkIn.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-900">{checkIn.date}</span>
                <span className="text-xs text-indigo-600 font-medium">
                  {checkIn.status === 'completed' ? '已完成' : '未完成'}
                </span>
              </div>
              {checkIn.record && (
                <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 mt-2">
                  {checkIn.record.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
