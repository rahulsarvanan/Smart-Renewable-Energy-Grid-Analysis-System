import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Network, 
  LineChart, 
  BatteryCharging, 
  BrainCircuit, 
  Briefcase, 
  GitBranch, 
  Leaf, 
  ShieldAlert, 
  Database, 
  Bot, 
  BellRing, 
  Settings,
  X,
  Zap,
  Map,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Energy Ops Center', path: '/ops', icon: Activity },
  { name: 'Executive Reports', path: '/reports', icon: FileText },
  { name: 'Asset Intelligence', path: '/asset-intel', icon: Cpu },
  { name: 'Network Intel', path: '/network-intel', icon: Network },
  { name: 'Predictive Hub', path: '/predictive', icon: LineChart },
  { name: 'Storage Intel', path: '/storage', icon: BatteryCharging },
  { name: 'Explainability', path: '/explainability', icon: BrainCircuit },
  { name: 'Executive Dashboard', path: '/executive', icon: Briefcase },
  { name: 'Scenario Planning', path: '/scenario', icon: GitBranch },
  { name: 'Carbon Analytics', path: '/carbon', icon: Leaf },
  { name: 'Enterprise Risk', path: '/risk', icon: ShieldAlert },
  { name: 'Data Intelligence', path: '/data', icon: Database },
  { name: 'AI Copilot', path: '/copilot', icon: Bot },
  { name: 'Alerts Center', path: '/alerts', icon: BellRing },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) {
  return (
    <>
      {/* Mobile Sidebar Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside 
        className={cn(
          "w-64 h-screen fixed left-0 top-0 z-40 bg-surface/85 backdrop-blur-2xl border-r border-outline-variant/30 shadow-[4px_0_24px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-300 lg:translate-x-0 lg:opacity-100",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:opacity-100"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-outline-variant/30">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(87,191,255,0.4)]">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-on-surface text-lg leading-tight tracking-tight">GridPulse</h1>
              <p className="font-label text-[10px] text-primary uppercase tracking-widest">Enterprise Analytics</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-high/50 text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close sidebar on mobile item click
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl font-headline text-sm font-medium transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive 
                    ? "text-on-primary-container bg-primary/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active"
                        className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-on-surface-variant group-hover:text-primary/70"
                    )} />
                    <span className="relative top-[1px]">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 mx-4 mb-6 rounded-xl bg-surface-container-low border border-outline-variant/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <p className="font-headline font-bold text-xs text-on-surface">System Optimal</p>
              <p className="font-label text-[10px] text-on-surface-variant">All services online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
