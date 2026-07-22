import React, { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { BatteryCharging, Battery, Zap, AlertTriangle, BatteryMedium, TrendingUp, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const StorageIntelligence = () => {
  const { gridStates } = useSimulation();
  const [mitigating, setMitigating] = useState(false);

  if (Object.keys(gridStates).length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6 h-full items-center justify-center w-full">
        <div className="w-12 h-12 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Initializing BESS Physics Engine...</p>
      </div>
    );
  }

  // Calculate State of Charge Distribution for pie/bar chart logic
  const totalBessCapacity = Object.values(gridStates).length * 50000; // 50MW per city
  const currentCharge = Object.values(gridStates).reduce((sum, state) => sum + ((state.bess_soc / 100) * 50000), 0);
  const avgSoc = totalBessCapacity > 0 ? (currentCharge / totalBessCapacity) * 100 : 0;
  
  // Generating mock cyclic history for BESS chart
  const generateHistory = () => {
    const data = [];
    const now = new Date();
    for(let i=12; i>=0; i--) {
      data.push({
        time: new Date(now.getTime() - (i * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        soc: Math.max(20, Math.min(100, avgSoc + (Math.sin(i) * 15))),
        power: Math.sin(i) * 20
      });
    }
    return data;
  };

  const historyData = generateHistory();

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BatteryCharging className="w-8 h-8 text-emerald-400" /> Storage Intelligence
        </h1>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-200">Global SOC: {avgSoc.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-5" intensity="medium">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Capacity</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-white">{(totalBessCapacity/1000).toFixed(0)}</span>
              <span className="text-slate-500 font-medium mb-1">MWh</span>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5" intensity="medium">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Available Energy</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-emerald-400">{(currentCharge/1000).toFixed(1)}</span>
              <span className="text-slate-500 font-medium mb-1">MWh</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5" intensity="medium">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Current Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xl font-bold text-white">Discharging to Grid</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 bg-gradient-to-br from-slate-900/80 to-emerald-900/20" intensity="medium">
            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider mb-2">Estimated Lifespan</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-emerald-300">9.2</span>
              <span className="text-slate-500 font-medium mb-1">Years</span>
            </div>
          </GlassCard>
        </div>

        {/* Individual BESS Nodes */}
        <GlassCard className="p-6 lg:col-span-2 flex flex-col min-h-[400px]" intensity="high">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> BESS Fleet Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(gridStates).map(state => {
              const isCharging = state.bess_net_kw > 0;
              const isDischarging = state.bess_net_kw < 0;
              let statusColor = 'text-slate-400';
              if (isCharging) statusColor = 'text-emerald-400';
              if (isDischarging) statusColor = 'text-amber-400';

              return (
                <div key={state.city} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white">{state.city} Storage</h3>
                    <Battery className={`w-5 h-5 ${statusColor}`} />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">State of Charge (SOC)</span>
                        <span className="text-white font-medium">{state.bess_soc.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${state.bess_soc < 20 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                          style={{ width: `${state.bess_soc}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400">Power Flow</span>
                      <span className={`font-bold ${statusColor}`}>
                        {isCharging ? '+' : isDischarging ? '-' : ''}{Math.abs(state.bess_net_kw / 1000).toFixed(2)} MW
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* AI Optimization Insight */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex-1" intensity="medium">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Cycle Analytics
            </h3>
            <div className="h-48 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="soc" stroke="#10b981" strokeWidth={2} dot={false} name="SOC %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6" intensity="low">
            <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Degradation Warning
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Jodhpur BESS cluster is experiencing higher than normal cycle depth (averaging 85% DoD). This is accelerating cell degradation by an estimated 12% annually.
            </p>
            {mitigating ? (
              <div className="w-full py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/50 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> AI Mitigation Active
              </div>
            ) : (
              <button 
                onClick={() => setMitigating(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition-colors border border-slate-600"
              >
                Run AI Mitigation Strategy
              </button>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
