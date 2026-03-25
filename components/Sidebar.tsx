
import React, { useState } from 'react';
import { NAV_ITEMS } from '../constants';
import type { Company, User } from '../types';
import { Sun, Moon, LogOut, ChevronDown, X, Check, User as UserIcon, Receipt } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userCompanies: Company[];
  activeCompany: Company | null;
  onSwitchCompany: (companyId: string) => void;
  onAddCompany: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, setActiveView, theme, setTheme, 
  userCompanies, activeCompany, onSwitchCompany, onAddCompany, onLogout, onOpenProfile,
  isOpen, onClose, currentUser, isCollapsed, onToggleCollapse
}) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleViewChange = (view: string) => {
      setActiveView(view);
      if(window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Mobile Overlay with Blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={onClose}
        ></div>
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 glass-panel flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ease-in-out md:relative md:translate-x-0 shadow-lg md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        {/* Brand Area */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-accent text-white p-2 rounded-xl shadow-lg shadow-accent/30 shrink-0">
                    <Receipt className="w-6 h-6" />
                </div>
                {!isCollapsed && (
                    <div className="animate-fade-in">
                        <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">InvoicePro</div>
                        <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Workspace</div>
                    </div>
                )}
             </div>
             {!isCollapsed && <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>}
        </div>

        {/* Collapse Toggle (Desktop) */}
        <button 
            onClick={onToggleCollapse}
            className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-accent transition-all shadow-sm z-50"
        >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-90'}`} />
        </button>
        
        {/* Navigation */}
        <nav className="flex-grow px-4 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 animate-fade-in">Main Menu</p>}
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.view;
              return (
              <li key={item.name}>
                <button
                  onClick={() => handleViewChange(item.view)}
                  disabled={!activeCompany}
                  title={isCollapsed ? item.name : ''}
                  className={`group relative w-full text-left flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all duration-300 ease-out border border-transparent ${
                    isActive
                      ? 'bg-accent text-white shadow-lg shadow-accent/25 translate-x-1'
                      : 'text-slate-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:shadow-md hover:border-slate-100 dark:hover:border-slate-700 hover:translate-x-1 dark:text-slate-400 dark:hover:text-slate-200'
                  } ${!activeCompany ? 'opacity-50 cursor-not-allowed' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  {/* Active/Hover Indicator */}
                  {!isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-accent rounded-r-full transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100"></span>
                  )}
                  
                  <span className={`transition-colors relative z-10 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors'}`}>
                      {item.icon}
                  </span>
                  {!isCollapsed && <span className="relative z-10 truncate animate-fade-in">{item.name}</span>}
                </button>
              </li>
            )})}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className={`p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={onOpenProfile}
            title={isCollapsed ? currentUser?.name || 'Profile' : ''}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 hover:shadow-sm transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-0.5 ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <UserIcon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate animate-fade-in">{currentUser?.name || 'Profile'}</span>}
          </button>
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 hover:shadow-sm transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-0.5 ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!isCollapsed && <span className="truncate animate-fade-in">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Sign Out' : ''}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all border border-transparent hover:-translate-y-0.5 ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate animate-fade-in">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
