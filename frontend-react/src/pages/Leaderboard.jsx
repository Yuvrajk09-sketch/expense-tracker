import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown } from 'lucide-react';

const BASE_URL = 'http://localhost:3000';

export const Leaderboard = () => {
  const { user } = useAuth();
  const config = { headers: { Authorization: user?.token } };
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.ispremiumuser) {
      loadLeaderboard();
    }
  }, [user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/premium/leaderboard`, config);
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!user?.ispremiumuser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Crown size={64} className="text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-700">Premium Feature</h2>
        <p className="text-slate-500 max-w-md">Upgrade to Premium to see how you rank among the top savers on the platform.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4 shadow-inner">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-black">Leaderboard</h1>
        <p className="text-slate-500 mt-2">See how you rank among the top savers.</p>
      </header>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading rankings...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No data available yet.</div>
        ) : (
          <div className="p-2 sm:p-6">
            {leaderboard.map((u, index) => (
              <div 
                key={u.id || index} 
                className={`flex items-center justify-between p-4 border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 ${index === 0 ? 'bg-amber-50/30' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${index === 0 ? 'bg-amber-100 text-amber-600 shadow-sm' : 
                      index === 1 ? 'bg-slate-200 text-slate-600 shadow-sm' : 
                      index === 2 ? 'bg-orange-100 text-orange-700 shadow-sm' : 
                      'bg-slate-100 text-slate-500'}`}
                  >
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">{u.username || 'Anonymous'}</p>
                    {index === 0 && <p className="text-xs font-medium text-amber-600">Top Saver</p>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600 text-lg">
                    ${Number(u.totalExpenses || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Total Expenses</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
