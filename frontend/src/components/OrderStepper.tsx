import React from 'react';
import { CheckCircle2, Clock, Utensils, PackageCheck, Bike, Home, XCircle } from 'lucide-react';

interface OrderStepperProps {
  status: 'Placed' | 'Accepted' | 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
}

const STEPS = [
  { id: 'Placed', label: 'Order Placed', icon: Clock },
  { id: 'Accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'Preparing', label: 'Preparing Food', icon: Utensils },
  { id: 'Ready for Pickup', label: 'Ready for Driver', icon: PackageCheck },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Bike },
  { id: 'Delivered', label: 'Delivered', icon: Home },
];

export const OrderStepper: React.FC<OrderStepperProps> = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-red-400">This order was cancelled and refunded.</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === status);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 z-0">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500 shadow-glow-orange"
            style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-lg ${
                  isCompleted
                    ? 'bg-brand-500 text-white ring-4 ring-brand-500/20 shadow-glow-orange'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-500/30 shadow-glow-orange animate-pulse'
                    : 'bg-zinc-900 border-2 border-zinc-700 text-zinc-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-[11px] font-bold text-center max-w-[70px] leading-tight ${
                  isCurrent ? 'text-brand-400' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
};
