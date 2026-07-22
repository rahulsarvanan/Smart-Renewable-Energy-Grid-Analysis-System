import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Leaf, Zap, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ExecutiveDecision = () => {
  const { gridStates } = useSimulation();
  const [credits, setCredits] = useState(12450);
  const [rec1Active, setRec1Active] = useState(false);
  const [rec2Active, setRec2Active] = useState(false);

  // Live Carbon Credits Tick
  useEffect(() => {
    let totalRenewableKw = 0;
    Object.values(gridStates).forEach(state => {
      totalRenewableKw += state.solar_kw + state.wind_kw;
    });
    // 2s tick = 2/3600 hours. MWh = Kw / 1000 * hours.
    // 1 MWh = 0.7 credits.
    if (totalRenewableKw > 0) {
      const addedCredits = (totalRenewableKw / 1000) * (2/3600) * 0.7;
      setCredits(prev => prev + addedCredits);
    }
  }, [gridStates]);
  // Mock data for Executive financial charts
  const financialData = [
    { month: 'Jan', opex: 120, savings: 45 },
    { month: 'Feb', opex: 115, savings: 52 },
    { month: 'Mar', opex: 110, savings: 60 },
    { month: 'Apr', opex: 105, savings: 65 },
    { month: 'May', opex: 95, savings: 75 },
    { month: 'Jun', opex: 90, savings: 82 },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-amber-500" /> Executive Dashboard
        </h1>
        <div className="px-4 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">Q2 2026 Fiscal Quarter</span>
        </div>
      </div>

      {/* Top Level Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Grid Savings (YTD)</p>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-emerald-400">$4.2M</span>
          </div>
          <p className="text-xs text-emerald-500 mt-2">+15% vs Last Year</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">OPEX Reduction</p>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">18.5</span>
            <span className="text-slate-500 font-medium mb-1">%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Driven by predictive maintenance.</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Renewable Curtailment</p>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">2.1</span>
            <span className="text-slate-500 font-medium mb-1">%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Target &lt; 5% achieved.</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Carbon Credits Earned</p>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-emerald-400">{credits.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
          </div>
          <p className="text-xs text-emerald-500 mt-2">Est. Value: ${(credits * 68.27).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Financial Trends Chart */}
        <GlassCard className="p-6 flex flex-col" intensity="medium">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" /> OPEX vs AI-Driven Savings
          </h2>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="opex" stroke="#f43f5e" strokeWidth={3} name="Grid OPEX" />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} name="AI Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Strategic Recommendations */}
        <GlassCard className="p-6 flex flex-col" intensity="low">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Strategic AI Recommendations
          </h2>
          
          <div className="space-y-4 flex-1">
            <div 
              onClick={() => setRec1Active(true)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer ${rec1Active ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-900/80 border-slate-700/50 hover:border-primary/50'}`}
            >
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                Expand BESS Capacity in Jodhpur {rec1Active && <CheckCircle className="w-4 h-4 text-emerald-400"/>}
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Simulations indicate a 50MW expansion in Jodhpur will yield a 3-year ROI due to increasing daily solar curtailment.
              </p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold">{rec1Active ? 'Approved & Initiated' : 'Est ROI: 28%'}</span>
                <span className="text-slate-500">CAPEX: $15M</span>
              </div>
            </div>

            <div 
              onClick={() => setRec2Active(true)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer ${rec2Active ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-900/80 border-slate-700/50 hover:border-primary/50'}`}
            >
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                Upgrade Bikaner Transmission Corridor {rec2Active && <CheckCircle className="w-4 h-4 text-emerald-400"/>}
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Current line congestion is forcing sub-optimal dispatch 14% of the time. Upgrading to 765kV will unlock 200MW of stranded wind.
              </p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold">{rec2Active ? 'Approved & Initiated' : 'Est Payback: 4.2 Yrs'}</span>
                <span className="text-slate-500">CAPEX: $45M</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
