import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { Leaf, Wind, Sun, Factory, Droplets } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const CarbonAnalytics = () => {
  const { gridStates } = useSimulation();

  // Aggregate current generation
  const totalSolar = Object.values(gridStates).reduce((sum, state) => sum + state.solar_kw, 0);
  const totalWind = Object.values(gridStates).reduce((sum, state) => sum + state.wind_kw, 0);
  const totalDemand = Object.values(gridStates).reduce((sum, state) => sum + state.demand_kw, 0);
  
  const totalRenewable = totalSolar + totalWind;
  const gridShortfall = Math.max(0, totalDemand - totalRenewable);
  
  // Calculate Renewable Penetration
  const renewableShare = totalDemand > 0 ? (totalRenewable / totalDemand) * 100 : 0;

  // Mock CO2 Displacement (Assume 0.82 kg CO2 per kWh of coal displaced)
  const co2DisplacedKgPerHour = (totalRenewable) * 0.82; 
  
  const generationMix = [
    { name: 'Solar', value: totalSolar, color: '#fbbf24' },
    { name: 'Wind', value: totalWind, color: '#38bdf8' },
    { name: 'Fossil / Grid', value: gridShortfall, color: '#475569' },
  ];

  // Mock historical emission data
  const emissionData = [
    { time: '00:00', emissions: 120 },
    { time: '04:00', emissions: 115 },
    { time: '08:00', emissions: 80 }, // Sun comes up
    { time: '12:00', emissions: 20 }, // Peak sun
    { time: '16:00', emissions: 45 },
    { time: '20:00', emissions: 140 }, // Evening peak
  ];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-emerald-400" /> Carbon Analytics
        </h1>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
          <span className="text-sm font-bold text-emerald-400">Net Zero Target: 2030</span>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Renewable Penetration</p>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">{Math.min(100, renewableShare).toFixed(1)}</span>
            <span className="text-slate-500 font-medium mb-1">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3">
             <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, renewableShare)}%` }}></div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Real-time CO2 Displacement</p>
            <Factory className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-emerald-400">{(co2DisplacedKgPerHour / 1000).toFixed(2)}</span>
            <span className="text-slate-500 font-medium mb-1">tons / hr</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Equates to removing ~{(co2DisplacedKgPerHour/0.52).toFixed(0)} cars from road.</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center bg-gradient-to-br from-slate-900/80 to-emerald-900/20 border-emerald-500/30" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider">Carbon Credits Generated</p>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
             <span className="text-3xl font-black text-emerald-300">4,280</span>
             <span className="text-emerald-500/50 font-medium mb-1">CERs</span>
          </div>
          <p className="text-[10px] text-emerald-400/60 mt-2">Verified via blockchain ledger.</p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-center" intensity="high">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Water Saved</p>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-blue-400">12.4</span>
            <span className="text-slate-500 font-medium mb-1">M Liters</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Thermal plant cooling water averted.</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Real-time Generation Mix Pie */}
        <GlassCard className="p-6 flex flex-col items-center justify-center" intensity="medium">
           <h2 className="text-lg font-bold text-white mb-2 self-start">Generation Mix</h2>
           <p className="text-xs text-slate-400 mb-6 self-start">Current instantaneous power sources.</p>
           
           <div className="w-full h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={generationMix}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {generationMix.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                     formatter={(value: any) => [`${(Number(value || 0)/1000).toFixed(1)} MW`, 'Power']}
                   />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-black text-white">{Math.min(100, renewableShare).toFixed(0)}%</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase">Clean</span>
             </div>
           </div>

           <div className="flex gap-4 w-full justify-center mt-4">
              {generationMix.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  {item.name}
                </div>
              ))}
           </div>
        </GlassCard>

        {/* Emissions Trend Line */}
        <GlassCard className="p-6 lg:col-span-2 flex flex-col" intensity="medium">
          <h2 className="text-lg font-bold text-white mb-6">Grid Carbon Intensity (gCO2eq/kWh)</h2>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionData}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="emissions" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" name="Carbon Intensity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
