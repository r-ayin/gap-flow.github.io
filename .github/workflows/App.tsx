import React, { useState, useEffect } from 'react';
import { ActionCategory, GapLog, Stats, User } from './types';
import { GapForm } from './components/GapForm';
import { LogFeed } from './components/LogFeed';
import { GapStats } from './components/GapStats';
import { AuthDialog } from './components/AuthDialog';
import { ShareExportModal } from './components/ShareExportModal';
import { MOCK_TEAM_LOGS } from './services/mockData';
import { Globe, User as UserIcon, Link2 } from 'lucide-react';

// Helper to get demo data if local storage is empty
const getInitialLogs = (): GapLog[] => {
  const stored = localStorage.getItem('gap_logs');
  if (stored) return JSON.parse(stored);
  return [];
};

const getInitialUser = (): User | null => {
  const stored = localStorage.getItem('gap_user');
  if (stored) return JSON.parse(stored);
  return null;
}

export default function App() {
  const [logs, setLogs] = useState<GapLog[]>(getInitialLogs);
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [viewMode, setViewMode] = useState<'mine' | 'team'>('mine');
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetLog, setShareTargetLog] = useState<GapLog | null>(null);

  useEffect(() => {
    localStorage.setItem('gap_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gap_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleAddLog = (newLogEntry: Omit<GapLog, 'id' | 'timestamp'>) => {
    const newLog: GapLog = {
      ...newLogEntry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setLogs([newLog, ...logs]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleShareLog = (log: GapLog) => {
    setShareTargetLog(log);
    setIsShareModalOpen(true);
  };

  const handleShareTeamLink = () => {
    setShareTargetLog(null); // Null means sharing the team link
    setIsShareModalOpen(true);
  };

  // Merge logs for team view: Local Logs + Mock Team Logs
  const displayedLogs = React.useMemo(() => {
    if (viewMode === 'mine') {
      return logs;
    }
    const allLogs = [...logs, ...MOCK_TEAM_LOGS];
    return allLogs.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, viewMode]);

  const calculateStats = (): Stats => {
    return {
      totalLogs: displayedLogs.length,
      sopCount: displayedLogs.filter(l => l.actionCategory === ActionCategory.SOP).length,
      iterationCount: displayedLogs.filter(l => l.actionCategory === ActionCategory.ITERATION).length,
    };
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] selection:bg-blue-100 selection:text-blue-900">
         <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
         </div>
         <AuthDialog onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] translate-x-1/3"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900">
                  GAP <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Flow</span>
              </h1>
              <span className="hidden md:inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">
                团队进化日志。 
                <span className="text-gray-900">Gain</span> → 
                <span className="text-gray-900">Action</span> → 
                <span className="text-gray-900">Plan</span>
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3">
            {/* View Toggler */}
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm flex">
              <button
                onClick={() => setViewMode('mine')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  viewMode === 'mine' 
                    ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <UserIcon size={16} /> 我的
              </button>
              <button
                onClick={() => setViewMode('team')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  viewMode === 'team' 
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Globe size={16} /> 团队
              </button>
            </div>
            
            {/* Invite Button */}
            <button 
              onClick={handleShareTeamLink}
              className="bg-gray-900 hover:bg-black text-white p-3.5 rounded-2xl shadow-lg shadow-gray-300/50 hover:scale-105 transition-all flex items-center justify-center"
              title="生成团队邀请链接"
            >
              <Link2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Input (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 order-1 lg:order-1 z-10">
            <GapForm onSubmit={handleAddLog} currentUser={currentUser} />
            
            {/* Context Helper */}
            <div className="mt-8 p-6 rounded-3xl bg-white/40 border border-white/50 backdrop-blur-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">GAP 核心心法</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">[SOP]</span> 
                        <span>你制定了标准。你在做加法。</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-orange-500 font-bold">[迭代]</span> 
                        <span>你解决了根因。你在做减法。</span>
                    </li>
                </ul>
            </div>
          </div>

          {/* Right Column: Feed & Stats */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <GapStats stats={calculateStats()} />
            <LogFeed 
              logs={displayedLogs} 
              currentUser={currentUser} 
              showTeam={viewMode === 'team'}
              onShare={handleShareLog} 
            />
          </div>

        </div>
      </div>

      <ShareExportModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        log={shareTargetLog}
      />
    </div>
  );
}