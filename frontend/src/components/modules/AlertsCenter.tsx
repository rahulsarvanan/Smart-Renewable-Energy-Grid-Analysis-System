import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { Bell, AlertTriangle, Info, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const AlertsCenter = () => {
  const { gridStates } = useSimulation();
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'critical', title: 'Substation Voltage Sag', message: 'Jaisalmer node reporting voltage below 0.95 p.u. BESS rapid response initiated.', time: '2 mins ago', acknowledged: false },
    { id: 2, type: 'warning', title: 'Wind Forecast Deviation', message: 'Actual wind generation is 15% lower than T-1 hour forecast in Bikaner region.', time: '14 mins ago', acknowledged: false },
    { id: 3, type: 'info', title: 'AI Model Retrained', message: 'Demand forecasting neural network successfully updated with latest daily weights.', time: '1 hour ago', acknowledged: true },
    { id: 4, type: 'critical', title: 'Thermal Overload Warning', message: 'Tie-line Jodhpur-Bikaner approaching 98% thermal capacity limit.', time: '2 hours ago', acknowledged: true },
    { id: 5, type: 'warning', title: 'Telemetry Latency', message: 'OpenMeteo API response time exceeding 2000ms. Switched to fallback local predictions.', time: '5 hours ago', acknowledged: true },
  ]);

  useEffect(() => {
    Object.values(gridStates).forEach(state => {
      if (state.ahi < 0.6) {
        setAlerts(prev => {
          const exists = prev.find(a => a.title === `Critical AHI: ${state.city}`);
          if (exists) return prev;
          return [{
            id: Date.now() + Math.random(),
            type: 'critical',
            title: `Critical AHI: ${state.city}`,
            message: `Asset Health Index dropped to ${(state.ahi * 100).toFixed(1)}%. Immediate inspection required due to thermal/load stress.`,
            time: 'Just now',
            acknowledged: false
          }, ...prev];
        });
      }
    });
  }, [gridStates]);

  const handleAcknowledge = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-amber-500" /> Alerts & Notifications
        </h1>
        <div className="px-4 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg flex items-center gap-2">
           <span className="text-sm font-medium text-slate-300">
             {alerts.filter(a => !a.acknowledged).length} Unacknowledged
           </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.map(alert => {
          
          let icon = <Info className="w-5 h-5 text-blue-400" />;
          let borderClass = 'border-l-4 border-l-blue-500';
          let titleColor = 'text-blue-400';
          let bgClass = alert.acknowledged ? 'bg-slate-900/40' : 'bg-slate-900/80';

          if (alert.type === 'critical') {
            icon = <ShieldAlert className="w-5 h-5 text-rose-500" />;
            borderClass = 'border-l-4 border-l-rose-500';
            titleColor = 'text-rose-500';
          } else if (alert.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            borderClass = 'border-l-4 border-l-amber-500';
            titleColor = 'text-amber-500';
          }

          return (
            <GlassCard key={alert.id} className={`p-5 ${borderClass} ${bgClass} transition-all`} intensity={alert.acknowledged ? 'low' : 'medium'}>
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="mt-1">
                    {icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${titleColor} mb-1 flex items-center gap-2`}>
                      {alert.title}
                      {alert.type === 'critical' && !alert.acknowledged && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 animate-pulse">ACTION REQUIRED</span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </div>
                  </div>
                </div>

                {!alert.acknowledged ? (
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition-colors border border-slate-600 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Acknowledge
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Acknowledged
                  </span>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  );
};
