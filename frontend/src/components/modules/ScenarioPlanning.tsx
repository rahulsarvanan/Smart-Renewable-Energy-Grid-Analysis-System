import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Play, Settings2, BarChart2, CloudRain, Sun, Wind, CloudLightning } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ScenarioPlanning = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [tempOffset, setTempOffset] = useState(5);
  const [loadSurge, setLoadSurge] = useState(25);
  const [activeEvent, setActiveEvent] = useState('Heatwave');
  const [bessAvail, setBessAvail] = useState(80);
  
  // Dynamic data based on state
  const [scenarioData, setScenarioData] = useState([
    { time: '00:00', baseline: 200, scenario: 200 },
    { time: '04:00', baseline: 180, scenario: 175 },
    { time: '08:00', baseline: 350, scenario: 280 },
    { time: '12:00', baseline: 420, scenario: 310 },
    { time: '16:00', baseline: 380, scenario: 290 },
    { time: '20:00', baseline: 450, scenario: 410 },
    { time: '24:00', baseline: 250, scenario: 240 },
  ]);

  const handleRunSimulation = () => {
    setIsRunning(true);
    // Simulate Edge Function processing
    setTimeout(() => {
      setScenarioData(prev => prev.map(pt => {
        const multiplier = 1 + (tempOffset * 0.02) + (loadSurge * 0.005);
        
        // Monte Carlo: 10,000 iterations
        const results = new Float32Array(10000);
        for(let i = 0; i < 10000; i++) {
          const u = 1 - Math.random();
          const v = Math.random();
          const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
          const noise = z * (pt.baseline * 0.05); // 5% standard dev
          results[i] = pt.baseline * multiplier + noise;
        }
        
        results.sort();
        const p95 = results[Math.floor(10000 * 0.95)];

        return {
          ...pt,
          scenario: Math.max(pt.baseline * 0.5, Math.round(p95))
        };
      }));
      setIsRunning(false);
    }, 1500); 
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-400" /> Scenario Planning
        </h1>
        <button 
          onClick={handleRunSimulation}
          disabled={isRunning}
          className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
            isRunning ? 'bg-indigo-500/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
          }`}
        >
          {isRunning ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Running...</>
          ) : (
            <><Play className="w-4 h-4 fill-current" /> Run Simulation</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Scenario Controls (Left Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-5" intensity="high">
            <h2 className="text-lg font-bold text-white mb-4">Scenario Parameters</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm text-slate-300 mb-2 font-medium">
                  <span>Weather Event</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['Monsoon', 'Heatwave', 'Sandstorm', 'Low Wind'].map(event => (
                    <button 
                      key={event}
                      onClick={() => setActiveEvent(event)}
                      className={`p-3 rounded-xl border text-sm font-bold text-center transition-colors ${
                        activeEvent === event
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm text-slate-300 mb-2 font-medium">
                  <span>Temperature Offset</span>
                  <span className="text-indigo-400">{tempOffset >= 0 ? `+${tempOffset}` : tempOffset}°C</span>
                </label>
                <input type="range" min="-10" max="10" value={tempOffset} onChange={e => setTempOffset(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>

              <div>
                <label className="flex justify-between text-sm text-slate-300 mb-2 font-medium">
                  <span>EV Charging Load Surge</span>
                  <span className="text-indigo-400">+{loadSurge}%</span>
                </label>
                <input type="range" min="0" max="100" value={loadSurge} onChange={e => setLoadSurge(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              
              <div>
                <label className="flex justify-between text-sm text-slate-300 mb-2 font-medium">
                  <span>BESS Availability</span>
                  <span className="text-indigo-400">{bessAvail}%</span>
                </label>
                <input type="range" min="0" max="100" value={bessAvail} onChange={(e) => setBessAvail(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex-1" intensity="medium">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Monte Carlo Settings
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Iterations</span>
                <span className="text-white font-medium">10,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Confidence Interval</span>
                <span className="text-white font-medium">95%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Horizon</span>
                <span className="text-white font-medium">24 Hours</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Results Area (Right) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard className="p-6 flex-1 min-h-[300px]" intensity="medium">
            <h2 className="text-lg font-bold text-white mb-6">Net Load Profile: Baseline vs. Scenario</h2>
            <div className="h-[300px] w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scenarioData}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="baseline" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBaseline)" name="Baseline (Expected)" />
                  <Area type="monotone" dataKey="scenario" stroke="#818cf8" fillOpacity={1} fill="url(#colorScenario)" name="Heatwave Scenario" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-5" intensity="high">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Peak Shortfall Risk</p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-rose-400">18.4</span>
                 <span className="text-slate-500 font-medium mb-1">%</span>
               </div>
               <p className="text-xs text-rose-500 mt-2">Up 12% from baseline.</p>
            </GlassCard>

            <GlassCard className="p-5" intensity="high">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Max Dispatch Cost</p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-amber-400">$124</span>
                 <span className="text-slate-500 font-medium mb-1">/ MWh</span>
               </div>
               <p className="text-xs text-amber-500 mt-2">Requires peaking gas plants.</p>
            </GlassCard>

            <GlassCard className="p-5" intensity="high">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Required BESS Reserve</p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-indigo-400">140</span>
                 <span className="text-slate-500 font-medium mb-1">MW</span>
               </div>
               <p className="text-xs text-indigo-300 mt-2">To maintain frequency stability.</p>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};
