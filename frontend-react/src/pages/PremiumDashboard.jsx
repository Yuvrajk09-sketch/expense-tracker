import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Crown, Sparkles, BarChart3 } from 'lucide-react';

const BASE_URL = 'http://localhost:3000';

export const PremiumDashboard = () => {
  const { user } = useAuth();
  const config = { headers: { Authorization: user?.token } };

  const [dashboardData, setDashboardData] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const loadDashboard = async () => {
    if (!user?.ispremiumuser) {
      alert('Buy premium to access the dashboard!');
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/premium/dashboard`, config);
      setDashboardData({
        daily: res.data.dailyBreakdown,
        monthly: res.data.monthlyBreakdown
      });
    } catch (err) {
      alert('Error fetching dashboard');
    }
  };

  const handleAiAdvice = async () => {
    if (!user?.ispremiumuser) {
      alert('Buy premium to unlock the AI Financial Advisor!');
      return;
    }
    if (!aiPrompt) return;
    setLoadingAi(true);
    try {
      const res = await axios.post(`${BASE_URL}/ai/advisor`, { prompt: aiPrompt }, config);
      setAiResponse(res.data.advice);
    } catch (err) {
      setAiResponse('Error fetching AI advice');
    }
    setLoadingAi(false);
  };

  if (!user?.ispremiumuser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Crown size={64} className="text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-700">Premium Feature</h2>
        <p className="text-slate-500 max-w-md">Upgrade to Premium to unlock advanced analytics and the AI Financial Advisor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Premium Hub</h1>
          <p className="text-slate-500 mt-1">Exclusive insights and advanced analytics.</p>
        </div>
        <Crown className="text-amber-500 w-12 h-12 opacity-20 hidden sm:block" />
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* AI Advisor Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-indigo-300">
              <Sparkles size={24} /> AI Financial Advisor
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Ask our Gemini-powered AI anything about your expenses. Get personalized tips on how to save money.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                value={aiPrompt} 
                onChange={e => setAiPrompt(e.target.value)} 
                placeholder="e.g., How can I reduce my food expenses?" 
              />
              <button 
                onClick={handleAiAdvice} 
                disabled={loadingAi}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                {loadingAi ? 'Analyzing...' : 'Ask AI'}
              </button>
            </div>
            {aiResponse && (
              <div className="mt-6 p-5 bg-white/5 border border-white/10 rounded-xl">
                <p className="italic text-slate-200">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <BarChart3 size={24} className="text-indigo-500" /> Financial Analytics
            </h2>
            <button 
              onClick={loadDashboard}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Load Data
            </button>
          </div>

          {dashboardData ? (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Daily Breakdown</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Description</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Income</th>
                        <th className="px-4 py-3 font-semibold">Expense</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashboardData.daily?.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{d.date}</td>
                          <td className="px-4 py-3">{d.description}</td>
                          <td className="px-4 py-3">{d.category}</td>
                          <td className="px-4 py-3 text-emerald-600">${Number(d.income || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-rose-600">${Number(d.expense || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Monthly Summary</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Month</th>
                        <th className="px-4 py-3 font-semibold">Income</th>
                        <th className="px-4 py-3 font-semibold">Expense</th>
                        <th className="px-4 py-3 font-semibold">Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashboardData.monthly?.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{m.month}</td>
                          <td className="px-4 py-3 text-emerald-600">${Number(m.income || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-rose-600">${Number(m.expense || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 font-semibold text-indigo-600">${Number(m.savings || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-500">
              Click "Load Data" to view your financial analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
