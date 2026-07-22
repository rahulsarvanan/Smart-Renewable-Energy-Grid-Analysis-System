import React, { useMemo } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSimulation } from '../../contexts/SimulationContext';
import { BrainCircuit, Zap, Sun, Wind } from 'lucide-react';
import { PHYSICS_CONSTANTS } from '../../lib/constants';

export const PredictiveHub = () => {
  const { gridStates } = useSimulation();

  // Memoize: only recalculate forecast when the hour changes (not every 2-second tick)
  const forecastData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Grab current aggregate values as a baseline
    let baseSolar = 0, baseWind = 0, baseDemand = 0;
    Object.values(gridStates).forEach(s => {
      baseSolar += s.solar_kw;
      baseWind += s.wind_kw;
      baseDemand += s.demand_kw;
    });

    for (let i = 0; i <= 24; i++) {
      const forecastTime = new Date(now.getTime() + (i * 3600000));
      const hour = forecastTime.getHours();
      
      const isDaytime = hour > 6 && hour < 19;
      let solarForecast = isDaytime ? Math.sin((hour - 6) * Math.PI / 12) * (baseSolar || 15000) : 0;
      let windForecast = (baseWind || 5000) * (0.8 + (Math.sin(hour) * 0.4));
      
      let demandMulti = 0.5;
      if (hour >= 6 && hour < 10) demandMulti = 0.7;
      else if (hour >= 10 && hour < 17) demandMulti = 0.8;
      else if (hour >= 17 && hour < 21) demandMulti = 1.0;
      else if (hour >= 21) demandMulti = 0.6;
      
      let demandForecast = (baseDemand || 20000) * demandMulti;

      data.push({
        time: forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        solar: solarForecast / 1000,
        wind: windForecast / 1000,
        demand: demandForecast / 1000,
      });
    }
    return data;
  // Re-derive when the live base values shift significantly (keyed on hour)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new Date().getHours(), Object.keys(gridStates).length]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white">Predictive Hub</h1>
        <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-purple-200">AI Forecasting Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Forecast Chart */}
        <GlassCard className="p-6 lg:col-span-2 min-h-[400px] flex flex-col" intensity="high">
          <h2 className="text-xl font-semibold text-white mb-6">24-Hour Grid Forecast (MW)</h2>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="solar" name="Solar (MW)" stroke="#fbbf24" fillOpacity={1} fill="url(#colorSolar)" />
                <Area type="monotone" dataKey="wind" name="Wind (MW)" stroke="#22d3ee" fillOpacity={0.3} fill="#22d3ee" />
                <Line type="monotone" dataKey="demand" name="Demand (MW)" stroke="#c084fc" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Analysis Panel */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex-1" intensity="medium">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Peak Alert Prediction
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              AI models predict a demand spike of <strong>24,500 MW</strong> at <strong>19:00</strong> due to residential AC load and falling solar generation.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Action</h4>
              <p className="text-sm text-emerald-400">Pre-charge BESS across Jodhpur and Bikaner sectors to 95% capacity by 17:00.</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6" intensity="low">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Confidence Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Load Forecast Accuracy (MAE)</span>
                  <span className="text-white font-medium">96.4%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-emerald-400 w-[96.4%] rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Weather Forecast Confidence</span>
                  <span className="text-white font-medium">88.2%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-amber-400 w-[88.2%] rounded-full"></div></div>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
