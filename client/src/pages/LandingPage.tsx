import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TacticalThreeHero } from '../components/hero/TacticalThreeHero';
import { StaggeredHeadline } from '../components/hero/StaggeredHeadline';
import { Button } from '../components/common/Button';
import {
  Radio,
  Compass,
  Users,
  Activity,
  Building,
  ArrowRight,
  Zap,
  AlertTriangle,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import type { UserRole } from '../types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenSimulator: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onOpenSimulator }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does RAKSHA detect road obstructions in real-time without user polling?',
      a: 'RAKSHA uses an autonomous line-segment-to-point orthogonal distance algorithm. When a citizen or drone reports a hazard, the backend geospatial engine cross-references active evacuation routes within milliseconds, computing a safety perimeter buffer and pushing recalculations over WebSocket channels.'
    },
    {
      q: 'What happens if a designated shelter reaches full capacity while an evacuee is en route?',
      a: 'The shelter triage manager continuously syncs live bed surplus. If a shelter drops below minimum safety margins (or reaches 100% capacity), RAKSHA automatically reroutes in-transit citizens to the next nearest facility with open beds.'
    },
    {
      q: 'How are conflicting or erroneous citizen hazard reports verified?',
      a: 'Authority dispatchers triage incidents through the Metropolitan Command Center, inspecting geotagged field photos, severity ratings, and automated cross-verification before approving citywide broadcasts.'
    },
    {
      q: 'Can citizens access emergency hotlines and survival checklists without navigation?',
      a: 'Yes. The top navigation bar includes instant access to 1-tap SOS Hotlines (911, FEMA, Red Cross, Poison Control) and a standard FEMA 72-Hour Crisis Go-Bag checklist.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#070a10] text-slate-100 overflow-hidden">
      {/* 1. HERO SECTION WITH THREE.JS ATMOSPHERE */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-16 pb-20 px-4">
        {/* Interactive 3D Tactical Wireframe Scene */}
        <TacticalThreeHero />

        {/* Tactical Radar Grid lines overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-25 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <StaggeredHeadline
            prefixText="MISSION CRITICAL CIVIL DEFENSE PLATFORM"
            mainHeadline="Dynamic Real-Time Evacuation & Autonomous Crisis Routing"
            highlightWords={['Dynamic', 'Autonomous', 'Crisis', 'Real-Time']}
            subheadline="When life-threatening hazards emerge, RAKSHA continuously analyzes active evacuation paths, automatically computing safe detours in milliseconds over real-time telemetry."
          />

          {/* Primary Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              variant="danger"
              size="lg"
              onClick={() => onSelectRole('citizen')}
              icon={<Compass className="w-5 h-5" />}
              className="text-sm font-mono tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.5)]"
            >
              LAUNCH CITIZEN EVACUATION
            </Button>

            <Button
              variant="tactical"
              size="lg"
              onClick={() => onSelectRole('authority')}
              icon={<Activity className="w-5 h-5" />}
              className="text-sm font-mono tracking-wider"
            >
              COMMAND CENTER
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onOpenSimulator}
              icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
              className="text-sm font-mono text-amber-300 border-amber-500/30 hover:border-amber-400"
            >
              DISASTER SIMULATOR
            </Button>
          </motion.div>

          {/* Telemetry Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-12 inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 py-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-xs font-mono text-slate-400"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
              <span>OpenRouteService & Geometry Detour Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              <span>Socket.io Real-Time Stream (&lt;50ms)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]"></span>
              <span>2dsphere Geospatial Indexing</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. THREE-ROLE SECTOR CARDS */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase block mb-1">
            UNIFIED MULTI-ROLE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            One Coordinated Operating Picture
          </h2>
          <p className="text-sm text-slate-400 font-sans mt-2">
            Seamless interoperability between vulnerable citizens, emergency dispatchers, and field shelters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1: Citizen */}
          <motion.div
            whileHover={{ y: -6, borderColor: 'rgba(6, 182, 212, 0.6)' }}
            transition={{ duration: 0.25 }}
            onClick={() => onSelectRole('citizen')}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:shadow-tactical-cyan cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                ROLE 01
              </span>
              <h3 className="text-xl font-bold font-display text-white mt-1 mb-2">
                Citizen Evacuee
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                Instant hazard reporting with photo evidence, live situational map, turn-by-turn waypoint
                guidance, emergency SOS hotlines, and 72-hour survival checklist.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-300 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Enter Citizen Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Role 2: Authority Command */}
          <motion.div
            whileHover={{ y: -6, borderColor: 'rgba(59, 130, 246, 0.6)' }}
            transition={{ duration: 0.25 }}
            onClick={() => onSelectRole('authority')}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:shadow-tactical-blue cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                ROLE 02
              </span>
              <h3 className="text-xl font-bold font-display text-white mt-1 mb-2">
                Emergency Authority
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                Mission control dashboard with real-time hazard heatmap, quick triage category pills,
                response unit dispatching deck, civil protection broadcast alarms, and military SITREP generator.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-blue-300 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Role 3: Shelter Administrator */}
          <motion.div
            whileHover={{ y: -6, borderColor: 'rgba(16, 185, 129, 0.6)' }}
            transition={{ duration: 0.25 }}
            onClick={() => onSelectRole('shelter_admin')}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:shadow-emerald-500/20 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                ROLE 03
              </span>
              <h3 className="text-xl font-bold font-display text-white mt-1 mb-2">
                Shelter Operations
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                Real-time bed triage slider, internal ward capacity matrix (General, Family, Medical Triage),
                citizen admission intake, and emergency supply logistics requisitioning.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-300 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Enter Shelter Console</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. CORE DIFFERENTIATOR: HOW DYNAMIC ROUTING WORKS */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono text-red-400 font-bold tracking-widest uppercase block mb-2">
              CORE INNOVATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white leading-tight">
              The Path That Reroutes Itself Before You Reach The Danger
            </h2>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed font-sans">
              Traditional GPS maps rely on periodic polling and road closure reports that take hours to update.
              During flash floods, toxic plumes, or structural collapse, seconds mean lives.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-red-950 border border-red-500/40 text-red-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">
                    Hazard Perimeter Intersection Algorithm
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">
                    Evaluates orthogonal line-segment distances from active route coordinates to newly
                    reported hazard coordinates plus safety buffer zones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">
                    Instant WebSocket Telemetry Push
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">
                    Zero polling. The instant a report is logged, the server pushes calculated detours
                    straight to the user's screen with synthesized audio alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">
                    Load-Balanced Safe Haven Destination
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">
                    If a shelter reaches maximum intake capacity while you are navigating, RAKSHA automatically
                    diverts your route to the next nearest facility with open beds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Graphic */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#0a0f1d]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <span className="text-xs font-mono text-slate-300 font-bold">
                LIVE INTERCEPT DEMONSTRATION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                ACTIVE RADAR SCAN
              </span>
            </div>

            {/* Simulated Road network visual */}
            <div className="relative h-64 bg-[#080d16] rounded-2xl border border-slate-800 p-4 overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Citizen GPS (37.7735, -122.4180)
                </span>
                <span className="text-emerald-400">Civic Safe Haven (412 Beds)</span>
              </div>

              {/* Graphic path */}
              <div className="relative my-auto flex items-center justify-between px-6">
                <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-[0_0_15px_#06b6d4]"></div>

                {/* Roadway with Blockage */}
                <div className="flex-1 relative flex items-center mx-4">
                  <div className="w-full h-1 bg-slate-700 rounded"></div>
                  {/* Hazard spot */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
                    <span className="text-lg animate-bounce">⚠️</span>
                    <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/90 px-1.5 py-0.5 rounded border border-red-500/50">
                      FLASH FLOOD
                    </span>
                  </div>
                  {/* Dynamic Detour Arc */}
                  <div className="absolute inset-x-0 -top-8 h-14 border-t-2 border-emerald-400 border-dashed rounded-full shadow-[0_0_10px_#10b981]"></div>
                </div>

                <div className="w-6 h-6 rounded-lg bg-emerald-500 border-2 border-white shadow-[0_0_15px_#10b981]"></div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>⚡ DYNAMIC DETOUR: Path diverted 340m around flood crest.</span>
                <span className="text-white font-bold">ETA: 8 min</span>
              </div>
            </div>

            <div className="mt-5 text-center">
              <Button
                variant="danger"
                size="md"
                onClick={onOpenSimulator}
                icon={<AlertTriangle className="w-4 h-4" />}
                className="w-full font-mono text-xs"
              >
                TEST THIS LIVE WITH THE DISASTER SIMULATOR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPLIANCE & STANDARDS BADGES */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/80">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
            GOVERNMENT & CRISIS COORDINATION PROTOCOLS
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="font-bold text-white text-xs font-display block">FEMA ICS-100 Compliant</span>
            <span className="text-[10px] text-slate-400 font-mono">Incident Command Standard</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <span className="font-bold text-white text-xs font-display block">OpenRouteService API</span>
            <span className="text-[10px] text-slate-400 font-mono">Deterministic Detour Routing</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <Layers className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <span className="font-bold text-white text-xs font-display block">ISO 22320 Standard</span>
            <span className="text-[10px] text-slate-400 font-mono">Emergency Management Guidelines</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <Radio className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <span className="font-bold text-white text-xs font-display block">UN OCHA Ready</span>
            <span className="text-[10px] text-slate-400 font-mono">Multilingual Humanitarian Data</span>
          </div>
        </div>
      </section>

      {/* 5. PROTOCOL ACCORDION FAQ */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">
            TECHNICAL DIRECTIVES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Platform Capabilities & Safety Architecture
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-white font-semibold font-display text-sm hover:text-cyan-300 transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
