import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Database, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DataIntelligence = () => {
  const { gridStates } = useSimulation();
  
  // Aggregate data quality across all cities
  const cities = Object.values(gridStates);
  const avgQuality = cities.length > 0 
    ? cities.reduce((acc, state) => acc + state.quality.overall_score, 0) / cities.length 
    : 0;

  // Mock historical data for the chart based on current avg quality
  const qualityHistory = [
    { time: '10:00', score: avgQuality - 0.02 },
    { time: '10:15', score: avgQuality - 0.01 },
    { time: '10:30', score: avgQuality + 0.01 },
    { time: '10:45', score: avgQuality },
    { time: '11:00', score: avgQuality },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-teal-400" /> Data Intelligence
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center gap-4" intensity="high">
          <div className="p-3 bg-teal-500/20 rounded-full">
            <Activity className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Avg Overall Quality</p>
            <p className="text-2xl font-bold text-white">{(avgQuality * 100).toFixed(1)}%</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-5 flex items-center gap-4" intensity="high">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Freshness Score</p>
            <p className="text-2xl font-bold text-white">99.8%</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4" intensity="high">
          <div className="p-3 bg-rose-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Missing Packets (1h)</p>
            <p className="text-2xl font-bold text-white">2</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mt-2" intensity="medium">
        <h2 className="text-lg font-bold text-white mb-6">Real-Time Data Quality Stream</h2>
        
        <div className="h-[300px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={qualityHistory}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[0.8, 1]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="score" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorScore)" name="Quality Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {cities.map((state) => (
          <GlassCard key={state.city} className="p-5" intensity="low">
            <h3 className="text-white font-bold mb-3">{state.city} Telemetry Node</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Freshness</span>
                <span className="text-emerald-400">{(state.quality.freshness_score * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Completeness</span>
                <span className="text-emerald-400">{(state.quality.completeness_score * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SLA Source</span>
                <span className="text-emerald-400">{(state.quality.reliability_score * 100).toFixed(1)}%</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
