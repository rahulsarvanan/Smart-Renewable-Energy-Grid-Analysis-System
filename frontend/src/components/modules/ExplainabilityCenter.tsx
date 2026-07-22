import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Lightbulb, Network, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ExplainabilityCenter = () => {
  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-primary" /> AI Explainability Center
        </h1>
        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Model Transparency: High</span>
        </div>
      </div>

      <p className="text-slate-400 mb-2">Understand the "Why" behind autonomous grid optimizations and dispatch decisions.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Autonomous Decisions */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" /> Recent Dispatch Actions
          </h2>

          <GlassCard className="p-5 border-l-4 border-l-indigo-500" intensity="high">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Action Taken</span>
              <span className="text-xs text-slate-500">10:45 AM</span>
            </div>
            <p className="text-white font-medium mb-4">Ramped down Jaisalmer Solar by 15 MW; Discharged Jodhpur BESS at 10 MW.</p>
            
            <div className="bg-slate-900/60 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Reasoning Chain</h4>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Observation:</strong> Local line congestion detected on Jaisalmer-Bikaner 400kV corridor (Load &gt; 95%).</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Constraint:</strong> Thermal limit of transmission line approaches critical threshold in 15 mins.</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-emerald-200"><strong>Resolution:</strong> Curtailed solar generation upstream (15 MW) to relieve congestion, and utilized downstream BESS (10 MW) to meet local demand without stressing the corridor.</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-l-4 border-l-emerald-500" intensity="high">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Action Taken</span>
              <span className="text-xs text-slate-500">09:12 AM</span>
            </div>
            <p className="text-white font-medium mb-4">Initiated aggressive charging for all BESS units at 40 MW total.</p>
            
            <div className="bg-slate-900/60 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Reasoning Chain</h4>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Observation:</strong> Solar generation hit peak efficiency earlier than forecasted due to clearing cloud cover.</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Forecast:</strong> Demand is predicted to spike in 4 hours due to extreme temperature rise (45°C).</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-emerald-200"><strong>Resolution:</strong> Captured excess cheap solar now to shave the impending expensive evening peak.</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </div>

        {/* Feature Importance & Model Confidence */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6" intensity="medium">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" /> Current Feature Importance (Load Forecast Model)
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Temperature (Ambient)</span>
                  <span className="text-cyan-400 font-bold">42%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: '42%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Historical Demand (t-24h)</span>
                  <span className="text-cyan-400 font-bold">28%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400/80" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Time of Day (Cyclic)</span>
                  <span className="text-cyan-400 font-bold">15%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400/60" style={{ width: '15%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Day of Week</span>
                  <span className="text-cyan-400 font-bold">9%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400/40" style={{ width: '9%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Cloud Cover</span>
                  <span className="text-cyan-400 font-bold">6%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400/20" style={{ width: '6%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 text-right">Calculated via SHAP (SHapley Additive exPlanations) values.</p>
          </GlassCard>

          <GlassCard className="p-6" intensity="low">
             <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Uncertainty Warning
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              The 24-hour wind generation forecast for the Jaisalmer region currently has a lower confidence score (65%) due to conflicting inputs from two external weather APIs. The system has automatically increased spinning reserve requirements to compensate.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
