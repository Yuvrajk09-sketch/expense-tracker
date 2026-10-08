import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3000';

const PremiumSections = () => {
  const { user } = useAuth();
  const config = { headers: { Authorization: user?.token } };

  const [leaderboard, setLeaderboard] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const loadLeaderboard = async () => {
    if (!user?.ispremiumuser) {
      alert('Buy premium to access the leaderboard!');
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/premium/leaderboard`, config);
      setLeaderboard(res.data);
    } catch (err) {
      alert('Error fetching leaderboard');
    }
  };

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

  return (
    <>
      <div className="card shadow p-4 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 text-warning">👑 Premium Dashboard</h4>
            <button onClick={loadDashboard} className="btn btn-outline-warning btn-sm">Load Dashboard</button>
        </div>
        
        {dashboardData && (
          <>
            <h5 className="mt-3">Daily Breakdown</h5>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Income</th>
                            <th>Expense</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.daily?.map((d, i) => (
                          <tr key={i}>
                            <td>{d.date}</td>
                            <td>{d.description}</td>
                            <td>{d.category}</td>
                            <td>${Number(d.income || 0).toFixed(2)}</td>
                            <td>${Number(d.expense || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h5 className="mt-4">Monthly/Yearly Summary</h5>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>Month</th>
                            <th>Income</th>
                            <th>Expense</th>
                            <th>Savings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.monthly?.map((m, i) => (
                          <tr key={i}>
                            <td>{m.month}</td>
                            <td>${Number(m.income || 0).toFixed(2)}</td>
                            <td>${Number(m.expense || 0).toFixed(2)}</td>
                            <td>${Number(m.savings || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </>
        )}
      </div>

      <div className="card shadow p-4 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 text-warning">👑 Premium Leaderboard</h4>
            <button onClick={loadLeaderboard} className="btn btn-outline-warning btn-sm">Show Leaderboard</button>
        </div>
        <ul className="list-group">
            {leaderboard.map((u, index) => (
              <li key={u.id || index} className="list-group-item d-flex justify-content-between">
                <span><strong>{index === 0 ? '🏆' : `#${index + 1}`}</strong> {u.username}</span>
                <span className="badge bg-primary rounded-pill">${u.totalExpenses}</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="card shadow p-4 mt-4 bg-light border-info mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 text-info">🤖 AI Financial Advisor</h4>
        </div>
        <div className="input-group mb-3">
            <input 
              type="text" 
              className="form-control" 
              value={aiPrompt} 
              onChange={e => setAiPrompt(e.target.value)} 
              placeholder="Ask AI anything about your expenses... (e.g., How can I save on food?)" 
            />
            <button onClick={handleAiAdvice} className="btn btn-info text-white" disabled={loadingAi}>
              {loadingAi ? 'Analyzing...' : 'Ask Gemini'}
            </button>
        </div>
        {aiResponse && (
          <div className="p-3 bg-white rounded border" style={{ fontStyle: 'italic' }}>
            <strong className="text-info">Advice:</strong> {aiResponse}
          </div>
        )}
      </div>
    </>
  );
};

export default PremiumSections;
