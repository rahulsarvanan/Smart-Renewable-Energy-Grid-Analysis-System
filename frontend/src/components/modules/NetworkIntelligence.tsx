import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { Network, Activity, Zap, ShieldAlert, Cpu } from 'lucide-react';

export const NetworkIntelligence = () => {
  const { gridStates } = useSimulation();

  // Aggregate network metrics
  const totalDemand = Object.values(gridStates).reduce((sum, state) => sum + state.demand_kw, 0);
  const totalSupply = Object.values(gridStates).reduce((sum, state) => sum + state.solar_kw + state.wind_kw + (state.bess_net_kw < 0 ? Math.abs(state.bess_net_kw) : 0), 0);
  
  const lineFrequency = 50.0 + ((totalSupply - totalDemand) / 100000); // Base 50Hz, very loose physics mock for frequency deviation

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Network className="w-8 h-8 text-cyan-400" /> Network Intelligence
        </h1>
        <div className="px-4 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-200">Grid Synchronized</span>
        </div>
      </div>

      {/* High-level Network KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-5 flex flex-col justify-center" intensity="medium">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Grid Frequency</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-black ${Math.abs(lineFrequency - 50.0) > 0.1 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lineFrequency.toFixed(3)}
            </span>
            <span className="text-slate-500 font-medium mb-1">Hz</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="medium">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Network Topology</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-cyan-400">8</span>
            <span className="text-slate-500 font-medium mb-1">Active Nodes</span>
          </div>
        </GlassCard>
        
        <GlassCard className="p-5 flex flex-col justify-center" intensity="medium">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Line Congestion</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">42.5</span>
            <span className="text-slate-500 font-medium mb-1">%</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="medium">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Transmission Loss</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">1.8</span>
            <span className="text-slate-500 font-medium mb-1">%</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Node Power Flow Table */}
        <GlassCard className="p-6 lg:col-span-2 flex flex-col" intensity="high">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Active Power Flow Nodes
          </h2>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Substation Node</th>
                  <th className="px-4 py-3">Import (MW)</th>
                  <th className="px-4 py-3">Export (MW)</th>
                  <th className="px-4 py-3">Voltage (kV)</th>
                  <th className="px-4 py-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(gridStates).map((state, idx) => {
                  const isExporting = (state.solar_kw + state.wind_kw) > state.demand_kw;
                  const powerDiff = Math.abs((state.solar_kw + state.wind_kw) - state.demand_kw) / 1000;
                  // Stable per-city voltage: use charCode sum as seed, ±1kV band, updates only when physics ticks
                  const cityHash = state.city.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
                  const voltage = 399.5 + (cityHash % 100) / 100; // 399.5 – 400.5 kV stable range

                  return (
                    <tr key={state.city} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-slate-500" />
                        {state.city}-SS-{idx + 1}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {!isExporting ? <span className="text-amber-400 font-medium">{powerDiff.toFixed(1)}</span> : '-'}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {isExporting ? <span className="text-emerald-400 font-medium">{powerDiff.toFixed(1)}</span> : '-'}
                      </td>
                      <td className="px-4 py-4 text-slate-300">{voltage.toFixed(1)}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Anomaly Detection */}
        <GlassCard className="p-6 flex flex-col" intensity="low">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> AI Anomaly Detection
          </h2>
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Warning</span>
                <span className="text-[10px] text-slate-500">2 min ago</span>
              </div>
              <p className="text-sm text-slate-300">Minor harmonic distortion detected on Bikaner tie-line 4. PMU data suggests transient switching event.</p>
            </div>
            
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Resolved</span>
                <span className="text-[10px] text-slate-500">14 min ago</span>
              </div>
              <p className="text-sm text-slate-300">Voltage sag in Jaisalmer node automatically corrected via BESS rapid discharge.</p>
            </div>

            <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
              <p className="text-xs text-primary font-medium">Neural Net continuously analyzing Phasor Measurement Unit (PMU) streams...</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
