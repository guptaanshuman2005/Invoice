import React from 'react';
import { Zap, CheckCircle2, ArrowRight, Shield, BarChart3, Mail, CreditCard } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-accent selection:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-accent text-white p-1.5 rounded-lg shadow-sm h-8 w-8 flex items-center justify-center">
            <Zap className="w-full h-full" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">InvoicePro</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={onGetStarted}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="text-sm font-semibold bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-8">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          InvoicePro 2.0 is here
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
          The smartest way to manage your <span className="text-accent">invoices & billing.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create professional invoices, track inventory, and manage clients in one secure platform. Designed for modern freelancers and growing businesses.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm"
          >
            View Pricing
          </button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to scale</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Enterprise-grade features packed into an intuitive, lightning-fast interface.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Advanced Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Track your revenue, outstanding payments, and top clients with beautiful, real-time dashboards.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Seamless Payments</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Accept payments globally. We integrate perfectly with modern payment gateways to get you paid faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your business needs.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Monthly Tier */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Monthly</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Pay as you go, cancel anytime.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹199</span>
              <span className="text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 50 invoices/mo', 'Unlimited Workspaces', 'Custom branding & logos', 'Basic Analytics', 'Email support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-8 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Need more invoices?</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">+ ₹99 per 20 extra invoices</p>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-3 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-accent hover:text-accent transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Quarterly Tier */}
          <div className="p-8 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-accent shadow-xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Quarterly</h3>
            <p className="text-slate-400 mb-6">Save 15% with quarterly billing.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">₹499</span>
              <span className="text-slate-400">/qtr</span>
              <p className="text-sm text-accent mt-2 font-medium">Works out to ₹166/mo</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 200 invoices/qtr', 'Unlimited Workspaces', 'Custom branding & logos', 'Advanced Analytics', 'Priority email support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-200 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <div className="p-4 bg-slate-800/50 rounded-xl mb-8 border border-slate-700">
                <p className="text-xs text-slate-400 font-medium mb-1">Need more invoices?</p>
                <p className="text-sm font-bold text-white">+ ₹249 per 50 extra invoices</p>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-3 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white transition-all shadow-lg hover:shadow-xl"
            >
              Choose Quarterly
            </button>
          </div>

          {/* Yearly Tier */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              SAVE 30%
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Yearly</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Best value for established businesses.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹1,499</span>
              <span className="text-slate-500 dark:text-slate-400">/yr</span>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">Works out to ₹125/mo</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 1000 invoices/yr', 'Unlimited Workspaces', 'White-labeling options', 'Custom Reports', '24/7 Priority support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-8 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Need more invoices?</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">+ ₹899 per 200 extra invoices</p>
            </div>
            <button 
              onClick={onGetStarted}
              className="w-full py-3 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-accent hover:text-accent transition-colors"
            >
              Choose Yearly
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-bold text-slate-900 dark:text-white">InvoicePro</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} InvoicePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
