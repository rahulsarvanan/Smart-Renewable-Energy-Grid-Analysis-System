import React, { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { KPICard } from '../ui/KPICard';
import { Sun, Wind, Zap, BatteryCharging, ShieldCheck, Activity, Shield, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RAJASTHAN_CITIES } from '../../lib/constants';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const EnergyOperationsCenter = () => {
  const { gridStates } = useSimulation();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Aggregate totals across all cities
  const totalSolar = Object.values(gridStates).reduce((sum, state) => sum + state.solar_kw, 0);
  const totalWind = Object.values(gridStates).reduce((sum, state) => sum + state.wind_kw, 0);
  const totalDemand = Object.values(gridStates).reduce((sum, state) => sum + state.demand_kw, 0);
  
  // Calculate average Quality Grade
  const qualityScores = Object.values(gridStates).map(s => s.quality.overall_score);
  const avgQuality = qualityScores.length ? qualityScores.reduce((a,b) => a+b, 0) / qualityScores.length : 0;
  const avgGrade = avgQuality > 0.9 ? 'A' : avgQuality > 0.7 ? 'B' : 'C';

  // Calculate System Reliability from live AHI
  const avgAHI = Object.values(gridStates).length 
    ? Object.values(gridStates).reduce((sum, s) => sum + s.ahi, 0) / Object.values(gridStates).length 
    : 0.9998;

  // Format values
  const formatKw = (kw: number) => (kw / 1000).toFixed(2); // Convert to MW

  const position: [number, number] = [26.9124, 75.7873]; 
  const activeNode = selectedCity ? gridStates[selectedCity] : null;

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      {/* Header Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard 
          title="Solar Generation" 
          value={formatKw(totalSolar)} 
          unit="MW" 
          icon={Sun} 
          color="amber"
        />
        <KPICard 
          title="Wind Generation" 
          value={formatKw(totalWind)} 
          unit="MW" 
          icon={Wind} 
          color="cyan"
        />
        <KPICard 
          title="Grid Demand" 
          value={formatKw(totalDemand)} 
          unit="MW" 
          icon={Zap} 
          color="purple"
        />
        <KPICard 
          title="Net Balance" 
          value={formatKw(totalSolar + totalWind - totalDemand)} 
          unit="MW" 
          icon={Activity} 
          color={(totalSolar + totalWind - totalDemand >= 0 ? "green" : "purple") as any}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        
        {/* Geographic Flow Map */}
        <GlassCard className="xl:col-span-2 p-0 flex flex-col min-h-[500px] overflow-hidden relative" intensity="low">
          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <div className="bg-surface/70 backdrop-blur-2xl p-3 rounded-lg flex items-center gap-3 border border-white/10">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Grid Online</span>
            </div>
          </div>
          
          <div className="absolute inset-0 z-0">
            <MapContainer 
              center={position} 
              zoom={6} 
              style={{ height: '100%', width: '100%', background: '#060e20' }} 
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {RAJASTHAN_CITIES.map(city => {
                const state = gridStates[city.name];
                if (!state) return null;
                
                const isCritical = state.quality.status === 'ERROR' || state.bess_soc < 10 || state.demand_kw > (state.solar_kw + state.wind_kw + state.bess_net_kw + 1000);
                const color = isCritical ? '#ffb4ab' : '#00f2ff';
                const radius = isCritical ? 12 : 8;

                return (
                  <CircleMarker 
                    key={city.name}
                    center={[city.lat, city.lon]} 
                    radius={radius}
                    pathOptions={{ 
                      color: color, 
                      fillColor: color, 
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedCity(city.name),
                    }}
                  >
                    <Popup className="bg-surface-container border border-outline-variant text-on-surface">
                      <div className="font-bold">{city.name} Node</div>
                      <div className="text-xs text-on-surface-variant">Load: {state.demand_kw.toFixed(1)} kW</div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Telemetry Overlay Panel inside the Map Card */}
          {activeNode && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-20 transition-transform duration-500">
              <GlassCard intensity="high" className="rounded-2xl p-6 shadow-2xl border-primary-container/20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-fixed-dim leading-none">{activeNode.city}</h2>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mt-1 tracking-widest">Sector Hub</p>
                  </div>
                  <button onClick={() => setSelectedCity(null)}>
                    <ChevronDown className="text-primary-fixed-dim cursor-pointer w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-surface-container-highest/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Solar Gen</p>
                    <p className="text-lg font-mono font-medium text-primary-fixed-dim">{activeNode.solar_kw.toFixed(1)} <span className="text-[10px]">kW</span></p>
                  </div>
                  <div className="bg-surface-container-highest/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Wind Gen</p>
                    <p className="text-lg font-mono font-medium text-primary-fixed-dim">{activeNode.wind_kw.toFixed(1)} <span className="text-[10px]">kW</span></p>
                  </div>
                  <div className="bg-surface-container-highest/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Net Demand</p>
                    <p className="text-lg font-mono font-medium text-error">{activeNode.demand_kw.toFixed(1)} <span className="text-[10px]">kW</span></p>
                  </div>
                  <div className="bg-surface-container-highest/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">BESS SOC</p>
                    <p className="text-lg font-mono font-medium text-emerald-400">{activeNode.bess_soc.toFixed(1)} <span className="text-[10px]">%</span></p>
                  </div>
                </div>

                <div className={`border rounded-xl p-4 flex items-center justify-between ${
                  activeNode.quality.status === 'ERROR' 
                    ? 'bg-error-container/20 border-error/30' 
                    : 'bg-primary-container/10 border-primary-container/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${activeNode.quality.status === 'ERROR' ? 'bg-error shadow-[0_0_8px_#ffb4ab]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'}`}></div>
                    <span className={`font-mono text-sm font-bold ${activeNode.quality.status === 'ERROR' ? 'text-error' : 'text-emerald-400'}`}>
                      {activeNode.quality.status === 'ERROR' ? 'CRITICAL ANOMALY' : 'OPTIMAL STATUS'}
                    </span>
                  </div>
                  {activeNode.quality.status === 'ERROR' ? (
                    <Shield className="text-error w-5 h-5" />
                  ) : (
                    <Activity className="text-emerald-400 w-5 h-5" />
                  )}
                </div>
              </GlassCard>
            </div>
          )}
        </GlassCard>

        {/* Side Panels */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-5 flex-1" intensity="medium">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">System Reliability</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{(avgAHI * 100).toFixed(2)}</span>
              <span className="text-slate-400 mb-1">%</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex-1" intensity="medium">
            <div className="flex items-center gap-3 mb-4">
              <BatteryCharging className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Storage Intelligence</h3>
            </div>
            <div className="space-y-4">
              {Object.values(gridStates).slice(0, 3).map(state => (
                <div key={state.city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{state.city} BESS</span>
                    <span className="text-white">{state.bess_soc.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      style={{ width: `${state.bess_soc}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex-1" intensity="medium">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Data Fusion Quality</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Stream Grade</span>
              <span className={`text-2xl font-bold ${avgGrade === 'A' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {avgGrade}
              </span>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};
