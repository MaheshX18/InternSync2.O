import React from 'react';
import { InternshipLifecycle, LifecycleStage } from '../types';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

interface InternshipLifecycleTimelineProps {
  lifecycle: InternshipLifecycle;
}

const STAGES: { stage: LifecycleStage; label: string; description: string }[] = [
  { stage: 'APPLICATION', label: 'Applied', description: 'Application submitted' },
  { stage: 'SHORTLISTED', label: 'Shortlisted', description: 'Selected for next round' },
  { stage: 'SELECTED', label: 'Selected', description: 'Final selection' },
  { stage: 'OFFER', label: 'Offer Letter', description: 'Offer extended' },
  { stage: 'TPO_VERIFICATION', label: 'T&P Verification', description: 'College approval' },
  { stage: 'JOINING', label: 'Joining', description: 'Onboarding completed' },
  { stage: 'PROGRESS', label: 'In Progress', description: 'Active internship' },
  { stage: 'EVALUATION', label: 'Evaluation', description: 'Final review' },
  { stage: 'COMPLETION', label: 'Completed', description: 'Internship finished' }
];

export const InternshipLifecycleTimeline: React.FC<InternshipLifecycleTimelineProps> = ({ lifecycle }) => {
  
  // Find current stage index based on STAGES order
  // Note: REJECTED could happen at any time, we handle it separately
  let currentIndex = -1;
  const isRejected = lifecycle.currentStage === 'REJECTED';
  
  if (!isRejected) {
    currentIndex = STAGES.findIndex(s => s.stage === lifecycle.currentStage);
    if (currentIndex === -1) {
      // If current stage is not in our main flow (e.g. REGISTRATION), just assume at start
      currentIndex = 0;
    }
  } else {
    // If rejected, find the last valid stage in history
    const lastValidStage = lifecycle.stageHistory.filter(h => h.stage !== 'REJECTED').pop();
    if (lastValidStage) {
      currentIndex = STAGES.findIndex(s => s.stage === lastValidStage.stage);
    }
  }

  return (
    <div className="w-full py-6 overflow-x-auto">
      <div className="min-w-[800px] px-4">
        <div className="flex items-start">
          {STAGES.map((stageItem, index) => {
            const isCompleted = index < currentIndex || (index === currentIndex && (lifecycle.currentStage === 'COMPLETION' || lifecycle.currentStage === 'PPO'));
            const isCurrent = index === currentIndex && !isRejected && lifecycle.currentStage !== 'COMPLETION' && lifecycle.currentStage !== 'PPO';
            const isFailedHere = isRejected && index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={stageItem.stage} className="flex-1 relative">
                {/* Connecting Line */}
                {index < STAGES.length - 1 && (
                  <div 
                    className={`absolute top-4 left-[50%] w-full h-0.5 ${
                      isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Node */}
                <div className="relative flex flex-col items-center group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 transition-colors ${
                    isFailedHere 
                      ? 'border-rose-500 text-rose-500' 
                      : isCompleted 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : isCurrent 
                          ? 'border-indigo-600 text-indigo-600' 
                          : 'border-slate-300 text-slate-300'
                  }`}>
                    {isFailedHere ? (
                      <XCircle className="w-5 h-5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Circle className="w-3 h-3 fill-current" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className={`text-xs font-bold ${
                      isFailedHere ? 'text-rose-600' : isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {stageItem.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 max-w-[80px] mx-auto leading-tight">
                      {stageItem.description}
                    </div>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded pointer-events-none z-20 whitespace-nowrap shadow-lg">
                    {stageItem.label}
                    {lifecycle.stageHistory.find(h => h.stage === stageItem.stage) && (
                      <div className="text-slate-300 text-[10px] mt-1 font-medium">
                        {new Date(lifecycle.stageHistory.find(h => h.stage === stageItem.stage)!.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InternshipLifecycleTimeline;
