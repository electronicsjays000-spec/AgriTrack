
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import RecordList from './components/RecordList';
import SpotifyPlayer from './components/SpotifyPlayer';
import { ViewState, TransportRecord, TransportRecordInput } from './types';
import { generateSummary } from './services/geminiService';

// Seed data with vehicle info
const INITIAL_DATA: TransportRecord[] = [
  { id: '1', person: 'John Doe', vehicle: 'Red Semi', crop: 'Grain', amountTons: 12.5, sourceField: 'Field', destination: 'Storage', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', person: 'Jane Smith', vehicle: 'Blue Truck', crop: 'Grain', amountTons: 8.2, sourceField: 'Field', destination: 'Storage', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', person: 'John Doe', vehicle: 'Red Semi', crop: 'Grain', amountTons: 15.0, sourceField: 'Field', destination: 'Storage', date: new Date().toISOString() },
  { id: '4', person: 'Bob Lee', vehicle: 'White Semi', crop: 'Grain', amountTons: 22.1, sourceField: 'Field', destination: 'Storage', date: new Date().toISOString() },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [records, setRecords] = useState<TransportRecord[]>(INITIAL_DATA);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addRecord = (input: TransportRecordInput) => {
    const newRecord: TransportRecord = {
      ...input,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    setView(ViewState.DASHBOARD); // Redirect to dashboard to see the result
  };

  const updateRecord = (updatedRecord: TransportRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Fetch summary when records change significantly
  useEffect(() => {
      if (records.length > 0) {
          const timer = setTimeout(async () => {
            const summary = await generateSummary(records);
            setAiSummary(summary);
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [records]);

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1605218427306-2b7c7a51c122?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className={`min-h-screen backdrop-blur-[2px] pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-stone-900/80' : 'bg-stone-100/80'}`}>
        <Navbar 
          currentView={view} 
          setView={setView} 
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === ViewState.DASHBOARD && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm backdrop-blur-md transition-colors">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Harvest Logistics</h1>
                <button 
                  onClick={() => setView(ViewState.LOG_ENTRY)}
                  className="bg-agri-600 hover:bg-agri-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  + New Load
                </button>
              </div>
              <Dashboard records={records} summary={aiSummary} />
            </div>
          )}

          {view === ViewState.LOG_ENTRY && (
            <div className="space-y-6">
               <div className="text-center mb-8 bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm backdrop-blur-md max-w-xl mx-auto transition-colors">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Log Shipment</h1>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">Driver, Vehicle, and Weight</p>
               </div>
              <EntryForm onAdd={addRecord} />
            </div>
          )}

          {view === ViewState.RECORDS && (
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 p-4 rounded-xl shadow-sm backdrop-blur-md transition-colors">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Haul Logs</h1>
              </div>
              <RecordList 
                records={records} 
                onUpdate={updateRecord}
                onDelete={deleteRecord}
              />
            </div>
          )}
        </main>
        
        {/* Spotify Widget */}
        <SpotifyPlayer />
      </div>
    </div>
  );
};

export default App;
