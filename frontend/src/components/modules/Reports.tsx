import React, { useRef, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useSimulation } from '../../contexts/SimulationContext';
import { Download, FileText, CheckCircle, AlertTriangle, Activity, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { RAJASTHAN_CITIES } from '../../lib/constants';
import { logOperatorAction } from '../../lib/api/telemetry';

export const Reports = () => {
  const { gridStates, triggerOverride } = useSimulation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeTelemetry, setIncludeTelemetry] = useState(true);
  const [includeActions, setIncludeActions] = useState(true);
  const [includeMatrix, setIncludeMatrix] = useState(true);

  const states = Object.values(gridStates);
  const totalDemand = states.reduce((sum, s) => sum + s.demand_kw, 0) / 1000;
  const totalSolar = states.reduce((sum, s) => sum + s.solar_kw, 0) / 1000;
  const totalWind = states.reduce((sum, s) => sum + s.wind_kw, 0) / 1000;
  const totalSupply = totalSolar + totalWind;
  const netBalance = totalSupply - totalDemand;
  
  const avgSoc = states.length ? states.reduce((sum, s) => sum + s.bess_soc, 0) / states.length : 0;
  const avgAhi = states.length ? states.reduce((sum, s) => sum + s.ahi, 0) / states.length : 1;

  const criticalNodes = Object.entries(gridStates).filter(([_, state]) => 
    state.quality.status === 'ERROR' || state.demand_kw > (state.solar_kw + state.wind_kw + state.bess_net_kw + 1000)
  );

  // Generate actionable intelligence based on real-time data
  const generateActions = () => {
    const actions = [];
    states.forEach(state => {
      const supply = state.solar_kw + state.wind_kw;
      const deficit = state.demand_kw - supply;
      
      if (state.quality.status === 'ERROR') {
        actions.push({
          node: state.city,
          level: 'CRITICAL',
          issue: 'Telemetry synchronization failure or severe sensor drop.',
          action: 'Dispatch field team for manual sensor override and bypass automated quality filters.',
        });
      } else if (deficit > 5000 && state.bess_soc < 15) {
        actions.push({
          node: state.city,
          level: 'HIGH',
          issue: `Severe load deficit (${(deficit/1000).toFixed(1)} MW) with critically low BESS reserves.`,
          action: 'Initiate targeted 10% load shedding protocols to prevent localized grid collapse.',
        });
      } else if (deficit < -10000 && state.bess_soc > 95) {
        actions.push({
          node: state.city,
          level: 'MEDIUM',
          issue: 'Extreme power surplus with saturated BESS capacity.',
          action: 'Curtail solar generation by 15% or redirect flow to adjacent regional interconnects.',
        });
      }
    });

    if (avgAhi < 0.85) {
      actions.push({
        node: 'GLOBAL',
        level: 'CRITICAL',
        issue: 'System-wide Asset Health Index has dropped below 85% safety threshold.',
        action: 'Activate all Peaker Plants immediately to stabilize frequency.',
      });
    }

    return actions;
  };

  const recommendedActions = generateActions();

  const executeAction = async (action: any) => {
    let overrideType: 'PEAKER' | 'SHEDDING' | 'HYPERCHARGE' | null = null;
    
    if (action.level === 'CRITICAL' && action.node === 'GLOBAL') {
      overrideType = 'PEAKER';
    } else if (action.level === 'HIGH') {
      overrideType = 'SHEDDING';
    } else if (action.level === 'MEDIUM') {
      overrideType = 'HYPERCHARGE';
    }
    
    if (overrideType) {
      triggerOverride(overrideType);
      await logOperatorAction(overrideType, action.node, action.issue);
      alert(`Action Dispatched: ${overrideType} at ${action.node}`);
    } else {
      await logOperatorAction('MANUAL_OVERRIDE', action.node, action.issue);
      alert(`Field team dispatched to ${action.node}`);
    }
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const imgData = await toPng(reportRef.current, {
        backgroundColor: '#000f1f',
        pixelRatio: 2,
        // Ignore font fetching errors which can cause console noise
        skipFonts: true,
      });
      
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => { img.onload = resolve; });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Grid_Operator_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-2rem)]">
      
      {/* Report Preview Pane */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <GlassCard intensity="low" className="p-8 min-h-[800px] bg-slate-950" ref={reportRef}>
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Shift Operator Report</h1>
                <p className="text-slate-400 font-mono text-sm mt-1">
                  ID: REP-{Date.now().toString().slice(-6)} | Timestamp: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-sm tracking-wider uppercase ${
                criticalNodes.length > 0 ? 'bg-error-container/20 text-error border-error/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              }`}>
                <Activity className="w-4 h-4" />
                {criticalNodes.length > 0 ? 'DEFCON 3 - INTERVENTION REQ' : 'DEFCON 5 - NORMAL OPS'}
              </div>
            </div>
          </div>

          {/* Section 1: Global KPIs */}
          {includeTelemetry && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-primary pl-3">Global Macro Metrics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Supply</p>
                  <p className="text-2xl font-mono font-bold text-cyan-400">{totalSupply.toFixed(1)} MW</p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Demand</p>
                  <p className="text-2xl font-mono font-bold text-amber-400">{totalDemand.toFixed(1)} MW</p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Net Balance</p>
                  <p className={`text-2xl font-mono font-bold ${netBalance < 0 ? 'text-error' : 'text-emerald-400'}`}>
                    {netBalance > 0 ? '+' : ''}{netBalance.toFixed(1)} MW
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Avg BESS Reserve</p>
                  <p className="text-2xl font-mono font-bold text-purple-400">{avgSoc.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Actionable Intelligence */}
          {includeActions && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-error pl-3">Operator Action Matrix</h2>
              
              {recommendedActions.length === 0 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center flex flex-col items-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
                  <p className="text-emerald-400 font-bold text-lg">No Operator Intervention Required</p>
                  <p className="text-emerald-400/70 text-sm mt-1">Autonomous systems are managing the grid successfully.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedActions.map((action, idx) => (
                    <div key={idx} className={`rounded-xl p-5 border ${
                      action.level === 'CRITICAL' ? 'bg-error-container/20 border-error/40' : 
                      action.level === 'HIGH' ? 'bg-amber-500/10 border-amber-500/40' : 
                      'bg-primary-container/10 border-primary/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${
                           action.level === 'CRITICAL' ? 'bg-error text-on-error' : 
                           action.level === 'HIGH' ? 'bg-amber-500 text-slate-900' : 
                           'bg-primary text-on-primary'
                        }`}>
                          {action.level}
                        </span>
                        <span className="font-bold text-white">Target: {action.node}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2"><span className="text-slate-400 font-medium">Detected Condition:</span> {action.issue}</p>
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                            <Cpu className="w-4 h-4" /> Recommended Action:
                          </p>
                          <p className="text-sm text-white mt-1 pl-6">{action.action}</p>
                        </div>
                        <button
                          onClick={() => executeAction(action)}
                          className={`shrink-0 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors ${
                            action.level === 'CRITICAL' ? 'bg-error hover:bg-error/80 text-on-error' :
                            'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Operational Node Matrix */}
          {includeMatrix && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Detailed Node Telemetry</h2>
              <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-4">Node Sector</th>
                      <th className="p-4 text-right">Supply (MW)</th>
                      <th className="p-4 text-right">Demand (MW)</th>
                      <th className="p-4 text-right">Net Flow (MW)</th>
                      <th className="p-4 text-center">BESS</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {states.map((state) => {
                      const supply = (state.solar_kw + state.wind_kw) / 1000;
                      const demand = state.demand_kw / 1000;
                      const net = supply - demand;
                      const isError = state.quality.status === 'ERROR';

                      return (
                        <tr key={state.city} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isError ? 'bg-error animate-pulse' : 'bg-emerald-400'}`}></div>
                            {state.city}
                          </td>
                          <td className="p-4 text-right font-mono text-cyan-400">{supply.toFixed(1)}</td>
                          <td className="p-4 text-right font-mono text-amber-400">{demand.toFixed(1)}</td>
                          <td className={`p-4 text-right font-mono font-bold ${net < 0 ? 'text-error' : 'text-emerald-400'}`}>
                            {net > 0 ? '+' : ''}{net.toFixed(1)}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${state.bess_soc < 20 ? 'bg-error' : 'bg-purple-500'}`} style={{ width: `${state.bess_soc}%` }}></div>
                              </div>
                              <span className="font-mono text-xs text-slate-400">{state.bess_soc.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {isError ? (
                              <span className="px-2 py-1 text-[10px] font-bold bg-error/20 text-error rounded border border-error/30">FAULT</span>
                            ) : (
                              <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">NOMINAL</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </GlassCard>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <GlassCard intensity="high" className="p-6 sticky top-0">
          <h2 className="text-lg font-bold mb-6">Report Parameters</h2>
          
          <div className="space-y-4 mb-8">
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="font-medium text-sm text-white">Global Metrics</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-600 bg-slate-950 text-primary focus:ring-primary focus:ring-offset-slate-900"
                checked={includeTelemetry}
                onChange={(e) => setIncludeTelemetry(e.target.checked)}
              />
            </label>
            
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-sm text-white">Action Matrix</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-600 bg-slate-950 text-primary focus:ring-primary focus:ring-offset-slate-900"
                checked={includeActions}
                onChange={(e) => setIncludeActions(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-sm text-white">Node Telemetry</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-600 bg-slate-950 text-primary focus:ring-primary focus:ring-offset-slate-900"
                checked={includeMatrix}
                onChange={(e) => setIncludeMatrix(e.target.checked)}
              />
            </label>
          </div>

          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-primary hover:bg-primary-dim text-slate-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(87,191,255,0.3)]"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isGenerating ? 'Compiling PDF...' : 'Download Shift Report'}
          </button>
        </GlassCard>
      </div>

    </div>
  );
};
