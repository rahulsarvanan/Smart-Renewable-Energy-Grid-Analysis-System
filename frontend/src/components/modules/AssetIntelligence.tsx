import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { Cpu, Activity, AlertTriangle, Thermometer } from 'lucide-react';

export const AssetIntelligence = () => {
  const { gridStates } = useSimulation();

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white">Asset Intelligence</h1>
        <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-300">Live Health Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.values(gridStates).map(state => {
          const healthScore = Math.round((state.ahi ?? 0.95) * 100);
          const isCritical = healthScore < 70;
          const isWarning = healthScore < 85 && !isCritical;
          
          let statusColor = 'text-emerald-400';
          let bgColor = 'bg-emerald-500/10';
          if (isCritical) {
            statusColor = 'text-rose-400';
            bgColor = 'bg-rose-500/10';
          } else if (isWarning) {
            statusColor = 'text-amber-400';
            bgColor = 'bg-amber-500/10';
          }

          // Simulate transformer thermal load
          const thermalLoad = state.telemetry.temperature + (state.demand_kw / 500);

          return (
            <GlassCard key={state.city} className="p-5 flex flex-col" intensity="medium" hoverEffect>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{state.city} Substation</h3>
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Transformer T-01</span>
                </div>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Cpu className={`w-5 h-5 ${statusColor}`} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Health Score (AHI)</span>
                    <span className={`font-bold ${statusColor}`}>{healthScore}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Thermal Load</span>
                  </div>
                  <span className={`text-sm font-medium ${thermalLoad > 85 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {thermalLoad.toFixed(1)}°C
                  </span>
                </div>
                
                {isCritical && (
                  <div className="flex items-start gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5" />
                    <span className="text-xs text-rose-200">Critical thermal stress detected. Predictive failure in 48h.</span>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
