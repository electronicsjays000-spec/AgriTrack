
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Truck, List, Sprout, Sun, Moon, Download, Share2, Check, X, QrCode } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isDarkMode, toggleTheme }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
    
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.LOG_ENTRY, label: 'Log Transport', icon: Truck },
    { id: ViewState.RECORDS, label: 'All Records', icon: List },
  ];

  return (
    <>
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
              <Sprout className="h-8 w-8 text-agri-600 mr-2" />
              <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">AgriTrack</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-agri-50 dark:bg-agri-900/30 text-agri-700 dark:text-agri-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-agri-600 dark:text-agri-400' : 'text-slate-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                  {installPrompt && (
                    <button
                      onClick={handleInstallClick}
                      className="flex items-center px-3 py-1.5 rounded-full bg-agri-600 hover:bg-agri-700 text-white text-xs font-medium transition-colors animate-pulse"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Install App
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors relative"
                    aria-label="Share App"
                    title="Share / Connect Mobile"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>

                  <button 
                      onClick={toggleTheme}
                      className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                      aria-label="Toggle Dark Mode"
                  >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Bar (Simple) */}
          <div className="md:hidden flex space-x-2 pb-3 overflow-x-auto">
             {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`flex-shrink-0 flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-agri-50 dark:bg-agri-900/30 text-agri-700 dark:text-agri-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {item.label}
                    </button>
                  );
                })}
          </div>
        </div>
      </nav>

      {/* Share / Connect Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-agri-100 dark:bg-agri-900/30 rounded-full flex items-center justify-center text-agri-600 dark:text-agri-400">
                <QrCode className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Open on Mobile</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Scan this code with another device to open the app immediately.</p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block mx-auto shadow-sm">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`}
                   alt="App QR Code"
                   className="w-40 h-40"
                 />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">or copy link</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={currentUrl}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 text-xs text-slate-600 dark:text-slate-300 truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-agri-600 dark:hover:bg-agri-700 text-white p-2 rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
