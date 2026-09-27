import React, { useState } from 'react';
import type { RouteData, Shelter } from '../../types';
import {
  Compass,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EvacuationGuidanceStepperProps {
  route: RouteData;
  shelter?: Shelter | null;
}

interface StepItem {
  id: number;
  instruction: string;
  distance: string;
  isDetour?: boolean;
  detourReason?: string;
  completed?: boolean;
}

export const EvacuationGuidanceStepper: React.FC<EvacuationGuidanceStepperProps> = ({
  route,
  shelter
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate realistic tactical street steps based on whether route was rerouted or normal
  const steps: StepItem[] = route.rerouted
    ? [
        {
          id: 0,
          instruction: 'Depart current location along Grove St heading East toward Civic Center',
          distance: '280m'
        },
        {
          id: 1,
          instruction: '⚠️ AUTONOMOUS DETOUR: Turn RIGHT onto 8th St',
          distance: '420m',
          isDetour: true,
          detourReason: 'Detour active: Circumventing confirmed flash flood crest on Market St'
        },
        {
          id: 2,
          instruction: 'Proceed South on 8th St, cross Mission St through cleared safety lane',
          distance: '350m'
        },
        {
          id: 3,
          instruction: 'Turn LEFT onto Folsom St towards designated relief perimeter',
          distance: '400m'
        },
        {
          id: 4,
          instruction: `Arrive at Safe Haven Gate: ${shelter?.name || 'Designated Shelter'}`,
          distance: '50m'
        }
      ]
    : [
        {
          id: 0,
          instruction: 'Depart current location heading toward nearest main transit corridor',
          distance: '250m'
        },
        {
          id: 1,
          instruction: 'Continue along designated emergency green-line corridor',
          distance: '650m'
        },
        {
          id: 2,
          instruction: 'Cross intersections following civil defense evacuation markers',
          distance: '450m'
        },
        {
          id: 3,
          instruction: `Approach entrance of ${shelter?.name || 'Regional Safe Haven'}`,
          distance: '100m'
        }
      ];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Compass className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              TURN-BY-TURN EVACUATION GUIDANCE
            </h4>
            <span className="text-[10px] font-mono text-cyan-400">
              Step {activeStep + 1} of {steps.length} • Waypoint Navigation Active
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 pt-1">
          {steps.map((step, idx) => {
            const isCurrent = idx === activeStep;
            const isDone = idx < activeStep;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isCurrent
                    ? step.isDetour
                      ? 'bg-amber-950/60 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-cyan-950/60 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : isDone
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono font-bold ${
                        isDone
                          ? 'bg-emerald-500 text-black'
                          : isCurrent
                          ? step.isDetour
                            ? 'bg-amber-500 text-black'
                            : 'bg-cyan-500 text-black'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div>
                      <p
                        className={`font-sans leading-snug ${
                          isCurrent ? 'font-bold text-white' : 'text-slate-300'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      {step.isDetour && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{step.detourReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {step.distance}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Progress Controller */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-800"
            >
              Previous Leg
            </button>

            <button
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              className="px-3 py-1 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-[11px] font-mono text-white font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              <span>Next Leg</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
