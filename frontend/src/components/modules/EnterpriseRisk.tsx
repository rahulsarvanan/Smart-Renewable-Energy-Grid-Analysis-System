import React, { useMemo } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { ShieldAlert, AlertOctagon, Shield, Crosshair, AlertTriangle, Loader2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export const EnterpriseRisk = () => {
  const { gridStates } = useSimulation();

  const { riskData, avgAhi } = useMemo(() => {
    const states = Object.values(gridStates);
    if (states.length === 0) return { riskData: [], avgAhi: 1 };

    let totalAhi = 0, totalSpi = 0, totalWpi = 0, totalDsi = 0, totalRai = 0;
    states.forEach(s => {
      totalAhi += s.ahi;
      totalSpi += s.spi;
      totalWpi += s.wpi;
      totalDsi += s.dsi;
      totalRai += s.rai;
    });

    const avgAhi = totalAhi / states.length;
    const avgSpi = totalSpi / states.length;
    const avgWpi = totalWpi / states.length;
    const avgDsi = totalDsi / states.length;
    const avgRai = totalRai / states.length;

    return {
      avgAhi,
      riskData: [
        { subject: 'Cyber/Physical (AHI)', A: (1 - avgAhi) * 150, B: 30, fullMark: 150 },
        { subject: 'Weather Volatility', A: (1 - avgRai) * 150, B: 60, fullMark: 150 },
        { subject: 'Grid Congestion (DSI)', A: avgDsi * 150, B: 40, fullMark: 150 },
        { subject: 'Hardware Failure', A: (1 - avgAhi) * 120, B: 50, fullMark: 150 },
        { subject: 'Market Price', A: avgDsi * 130, B: 70, fullMark: 150 },
        { subject: 'Regulatory', A: 45, B: 45, fullMark: 150 },
      ]
    };
  }, [gridStates]);

  if (riskData.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6 h-full items-center justify-center w-full">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading Risk Models...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-500" /> Enterprise Risk
        </h1>
        <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2">
          <span className="text-sm font-bold text-rose-400">Global Threat Level: {avgAhi < 0.7 ? 'CRITICAL' : avgAhi < 0.9 ? 'ELEVATED' : 'NORMAL'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">System Reliability (SAIDI)</p>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">{(avgAhi * 100).toFixed(1)}</span>
            <span className="text-slate-500 font-medium mb-1">% Health</span>
          </div>
          <p className="text-xs text-emerald-500 mt-2">Well below 90 min regulatory cap.</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">N-1 Contingency Violations</p>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-amber-400">2</span>
            <span className="text-slate-500 font-medium mb-1">Nodes at Risk</span>
          </div>
          <p className="text-xs text-amber-500 mt-2">Bikaner & Jaisalmer sub-transmission.</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center bg-gradient-to-br from-slate-900/80 to-rose-900/20 border-rose-500/30" intensity="high">
           <div className="flex justify-between items-start mb-2">
            <p className="text-rose-400/80 text-xs font-bold uppercase tracking-wider">Cybersecurity Anomalies</p>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-rose-400">14</span>
            <span className="text-rose-500/50 font-medium mb-1">Blocked / 24h</span>
          </div>
          <p className="text-xs text-rose-400/60 mt-2">DDoS attempt mitigated at edge firewall.</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Risk Radar */}
        <GlassCard className="p-6 flex flex-col" intensity="medium">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-indigo-400" /> Multi-Dimensional Risk Matrix
          </h2>
          <p className="text-xs text-slate-400 mb-6">Comparing Current Risk Profile (Blue) vs Historical Average (Gray)</p>
          
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Historical Avg" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.3} />
                <Radar name="Current Risk" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Contingency Planning Log */}
        <GlassCard className="p-6 flex flex-col" intensity="medium">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> Active Contingency Plans
          </h2>
          
          <div className="space-y-4 overflow-y-auto pr-2">
            
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">Loss of Jaisalmer Solar Park (500MW)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">READY</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Immediate dispatch of Jodhpur & Bikaner BESS (100MW total) + ramp up of secondary thermal reserves. No load shedding expected.
              </p>
              <div className="text-xs text-slate-500 font-medium">Auto-execution confidence: 98%</div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">Bikaner 400kV Tie-Line Trip</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">AT RISK</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Loss of primary evacuation route for wind generation. Will require immediate 40% curtailment of local wind and potential localized brownouts in Northern sector.
              </p>
              <div className="text-xs text-rose-500/70 font-medium">Auto-execution confidence: 65% (Manual review recommended)</div>
            </div>

             <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">Cyber: SCADA Network Intrusion</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">AIR-GAPPED</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Pre-computed fallback state ready. Hard disconnect of external telemetry APIs; switch to local physics simulation for state estimation.
              </p>
              <div className="text-xs text-slate-500 font-medium">Last drill: 14 days ago</div>
            </div>

          </div>
        </GlassCard>
      </div>

    </div>
  );
};
