import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Settings, Database, Server, Key, Users, Webhook, CheckCircle } from 'lucide-react';

export const SettingsModule = () => {
  const [groqKey, setGroqKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-400" /> Platform Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <GlassCard className="p-6 flex flex-col" intensity="medium">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" /> Database Integrations
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
               <div>
                 <h3 className="text-sm font-bold text-white">Supabase Connection</h3>
                 <p className="text-xs text-slate-400">Main telemetry & auth database</p>
               </div>
               <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CONNECTED</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
               <div>
                 <h3 className="text-sm font-bold text-white">OpenMeteo API</h3>
                 <p className="text-xs text-slate-400">Weather ingest (temp, wind, cloud)</p>
               </div>
               <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col" intensity="medium">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" /> AI Provider Keys
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gemini API Key</label>
               <input type="password" value="************************" readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Groq API Key (Fast Inference)</label>
               <input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="Enter Groq Key..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500 transition-colors" />
            </div>
             <button onClick={handleSave} className={`w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-white rounded-lg transition-colors mt-2 ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              {saved ? <><CheckCircle className="w-4 h-4"/> Saved!</> : 'Save Keys'}
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col" intensity="medium">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Webhook className="w-5 h-5 text-rose-400" /> Edge Functions
          </h2>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-300">Copilot LLM Router</span>
               <span className="text-xs font-bold text-emerald-400">v1.2 (Deployed)</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-300">Scenario Monte Carlo</span>
               <span className="text-xs font-bold text-slate-500">Not Deployed</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-300">Data Fusion Ingest</span>
               <span className="text-xs font-bold text-emerald-400">v2.0 (Active)</span>
             </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col" intensity="medium">
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" /> Access Control
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Enterprise Role-Based Access Control (RBAC) is managed via Supabase Auth policies. Current active session is registered as:
            </p>
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50 flex justify-center">
               <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                  Super Admin
               </span>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
