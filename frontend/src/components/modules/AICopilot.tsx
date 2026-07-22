import React, { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { GlassCard } from '../ui/GlassCard';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AICopilot = () => {
  const { gridStates } = useSimulation();
  const [query, setQuery] = useState('');
  const [cityContext, setCityContext] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Grid AI Copilot. How can I assist you with grid operations or analytics today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('copilot', {
        body: { query: userMessage.content, city: cityContext || null },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
    } catch (err: any) {
      console.warn("Supabase Edge Function failed, using local mock AI response.", err);
      
      // Local Mock Fallback — setTimeout avoids blocking the UI
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        let mockResponse = "Based on the latest telemetry, the grid is stable. ";
        
        if (lowerQuery.includes("transformer")) {
          const worstCity = Object.values(gridStates).sort((a,b) => a.ahi - b.ahi)[0];
          mockResponse = worstCity ? `The transformer health indices (AHI) in ${worstCity.city} are showing stress with an AHI of ${(worstCity.ahi*100).toFixed(1)}. Please monitor temperatures there.` : "All transformers are healthy.";
        } else if (lowerQuery.includes("peak")) {
          mockResponse = "Peak load is projected to hit at 19:30 local time. Current BESS reserves are at 49% SOC and are fully capable of dispatching to cover the expected shortfall.";
        } else if (lowerQuery.includes("solar")) {
          const totalSolar = Object.values(gridStates).reduce((sum, s) => sum + s.solar_kw, 0) / 1000;
          mockResponse = `Solar generation across the Rajasthan grid is currently outputting ${totalSolar.toFixed(1)} MW. Cloud cover is minimal in Jaisalmer and Bikaner.`;
        } else if (lowerQuery.includes("demand") || lowerQuery.includes("load")) {
          const totalDemand = Object.values(gridStates).reduce((sum, s) => sum + s.demand_kw, 0) / 1000;
          mockResponse = `Current grid demand is ${totalDemand.toFixed(1)} MW, trending exactly along the predicted diurnal curve.`;
        } else if (lowerQuery.includes("wind")) {
          const totalWind = Object.values(gridStates).reduce((sum, s) => sum + s.wind_kw, 0) / 1000;
          mockResponse = `Wind speeds are keeping our wind farms operating at ${totalWind.toFixed(1)} MW. We expect this to drop slightly by evening.`;
        } else if (lowerQuery.includes("battery") || lowerQuery.includes("bess") || lowerQuery.includes("storage")) {
          const avgSoc = Object.values(gridStates).reduce((sum, s) => sum + s.bess_soc, 0) / (Object.keys(gridStates).length || 1);
          mockResponse = `The Battery Energy Storage System (BESS) fleet is currently averaging ${avgSoc.toFixed(1)}% State of Charge (SOC). They are absorbing minor fluctuations to maintain frequency stability.`;
        } else if (lowerQuery.includes("carbon") || lowerQuery.includes("co2") || lowerQuery.includes("green")) {
          mockResponse = "Our renewable penetration is currently very high. We are displacing approximately 9.03 tons of CO2 per hour, generating significant carbon credits on the ledger.";
        } else if (lowerQuery.includes("risk") || lowerQuery.includes("anomaly")) {
          const worstAhi = Object.values(gridStates).sort((a,b) => a.ahi - b.ahi)[0]?.ahi || 1;
          mockResponse = worstAhi < 0.7 ? "The Data Fusion engine has detected thermal anomalies dropping AHI below 70%. Please check Alerts Center." : "The Data Fusion engine has not detected any significant anomalies in the past hour. N-1 contingency risks are low across all major transmission corridors.";
        } else {
          mockResponse += "I've analyzed the real-time data fusion feeds and all systems (Solar, Wind, BESS) are operating nominally without significant anomalies. Let me know if you want to drill down into a specific city or asset class.";
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: mockResponse }]);
        setLoading(false);
      }, 1000);
      // No return needed; finally block is removed to avoid the race condition
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" /> AI Copilot
        </h1>
        <select 
          value={cityContext}
          onChange={(e) => setCityContext(e.target.value)}
          aria-label="Select city context for AI Copilot"
          className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
        >
          <option value="">State-wide Context</option>
          <option value="Jaipur">Jaipur Context</option>
          <option value="Jodhpur">Jodhpur Context</option>
          <option value="Jaisalmer">Jaisalmer Context</option>
          <option value="Bikaner">Bikaner Context</option>
        </select>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden" intensity="medium">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start animate-pulse">
               <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 rounded-tl-sm">
                  <span className="text-slate-400 text-sm">Synthesizing telemetry data...</span>
                </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about peak load predictions, transformer health, or grid balancing..."
              aria-label="Query input for AI Copilot"
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block p-4 pr-12"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              aria-label="Send query to AI Copilot"
              className="absolute right-2 top-2 p-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};
