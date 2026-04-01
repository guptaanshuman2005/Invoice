import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';

interface SubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'basic' | 'standard' | 'premium') => void;
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ isOpen, onClose, onSubscribe }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Create Invoices">
      <div className="p-6 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 text-accent rounded-full mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose a Plan to Continue</h2>
          <p className="text-slate-600 dark:text-slate-400">You need an active subscription to create invoices. Select a plan below.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-accent transition-colors flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Basic</h3>
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹199</span>
              <span className="text-slate-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> 100 invoices/mo</li>
            </ul>
            <Button onClick={() => onSubscribe('basic')} className="w-full">Choose Basic</Button>
          </div>

          {/* Standard */}
          <div className="p-6 rounded-2xl border-2 border-accent relative flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-3 py-0.5 rounded-full text-xs font-bold">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Standard</h3>
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹499</span>
              <span className="text-slate-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> 300 invoices/mo</li>
            </ul>
            <Button onClick={() => onSubscribe('standard')} className="w-full">Choose Standard</Button>
          </div>

          {/* Premium */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-accent transition-colors flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Premium</h3>
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹999</span>
              <span className="text-slate-500">/mo</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> 1000 invoices/mo</li>
            </ul>
            <Button onClick={() => onSubscribe('premium')} className="w-full">Choose Premium</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionPrompt;
