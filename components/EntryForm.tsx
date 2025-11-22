import React, { useState } from 'react';
import { TransportRecordInput } from '../types';
import { parseNaturalLanguageEntry } from '../services/geminiService';
import { Sparkles, ArrowRight, Save, AlertCircle, Loader2, Truck } from 'lucide-react';

interface EntryFormProps {
  onAdd: (record: TransportRecordInput) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onAdd }) => {
  const [mode, setMode] = useState<'smart' | 'manual'>('smart');
  const [smartText, setSmartText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [manualData, setManualData] = useState<{
    person: string;
    vehicle: string;
    amountTons: number | '';
  }>({
    person: '',
    vehicle: '',
    amountTons: '',
  });

  const handleSmartSubmit = async () => {
    if (!smartText.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await parseNaturalLanguageEntry(smartText);
      if (result) {
        onAdd(result);
        setSmartText('');
      } else {
        setError("Could not interpret that. Please try again or use manual mode.");
      }
    } catch (e) {
      setError("AI Service currently unavailable. Check your API key or try manual entry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualData.amountTons === '') return;

    const record: TransportRecordInput = {
      person: manualData.person,
      vehicle: manualData.vehicle,
      amountTons: Number(manualData.amountTons),
      // Default values for hidden fields
      crop: 'Grain',
      sourceField: 'Field',
      destination: 'Storage',
    };

    onAdd(record);
    setManualData({
      person: '',
      vehicle: '',
      amountTons: '',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Toggle Header */}
      <div className="flex justify-center p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-lg w-fit mx-auto shadow-sm transition-colors">
        <button
          onClick={() => setMode('smart')}
          className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'smart' ? 'bg-agri-50 dark:bg-agri-900/40 shadow-sm text-agri-700 dark:text-agri-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Entry
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'manual' ? 'bg-agri-50 dark:bg-agri-900/40 shadow-sm text-agri-700 dark:text-agri-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Save className="w-4 h-4 mr-2" />
          Manual Form
        </button>
      </div>

      {mode === 'smart' ? (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-agri-100 dark:border-slate-700 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-agri-300 to-agri-600"></div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Describe the load</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Just type who you are, your truck, and the weight. e.g., <span className="italic bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">"Mike hauled 25 tons in the Red Semi."</span>
          </p>
          
          <textarea
            value={smartText}
            onChange={(e) => setSmartText(e.target.value)}
            className="w-full h-32 p-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-agri-500 focus:border-transparent resize-none text-slate-700 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 transition-all bg-slate-50 dark:bg-slate-900"
            placeholder="Type here..."
          />
          
          {error && (
            <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSmartSubmit}
              disabled={isProcessing || !smartText}
              className="flex items-center bg-agri-600 hover:bg-agri-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Process Entry <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 space-y-5 relative transition-colors">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-300 to-slate-500 dark:from-slate-600 dark:to-slate-400"></div>
          
           {/* Form Fields */}
           <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Driver Name</label>
              <input
                required
                type="text"
                value={manualData.person}
                onChange={(e) => setManualData({...manualData, person: e.target.value})}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-transparent text-lg text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                <Truck className="w-4 h-4 mr-1 text-agri-600 dark:text-agri-400" /> Vehicle / Truck
              </label>
              <input
                required
                list="vehicle-options"
                type="text"
                value={manualData.vehicle}
                onChange={(e) => setManualData({...manualData, vehicle: e.target.value})}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-transparent text-lg text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="e.g., Red Semi"
              />
              <datalist id="vehicle-options">
                <option value="Red Semi" />
                <option value="Blue Semi" />
                <option value="White Truck" />
                <option value="Green Grain Cart" />
                <option value="Peterbilt 379" />
                <option value="Kenworth W900" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Net Weight (Tons)</label>
              <input
                required
                type="number"
                step="0.01"
                value={manualData.amountTons}
                onChange={(e) => setManualData({...manualData, amountTons: parseFloat(e.target.value)})}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-agri-500 focus:border-transparent text-xl font-semibold text-agri-800 dark:text-agri-400 placeholder-slate-400"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
             <button
              type="submit"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-lg"
            >
              Log Shipment
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EntryForm;