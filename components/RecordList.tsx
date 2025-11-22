
import React, { useState } from 'react';
import { TransportRecord } from '../types';
import { Calendar, User, Truck, Edit2, Trash2, Save, X, Check } from 'lucide-react';

interface RecordListProps {
  records: TransportRecord[];
  onUpdate: (record: TransportRecord) => void;
  onDelete: (id: string) => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TransportRecord | null>(null);

  const handleEditClick = (record: TransportRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveClick = () => {
    if (editForm) {
      onUpdate(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      onDelete(id);
    }
  };

  const handleInputChange = (field: keyof TransportRecord, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  if (records.length === 0) {
    return (
        <div className="text-center py-12 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm backdrop-blur-md border border-slate-100 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">No records found.</p>
        </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tons</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {records.map((record) => {
              const isEditing = editingId === record.id;
              
              return (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  {isEditing ? (
                    // EDIT MODE
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <input 
                           type="date" 
                           value={editForm?.date.split('T')[0]}
                           onChange={(e) => handleInputChange('date', new Date(e.target.value).toISOString())}
                           className="w-full text-sm p-1 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                         />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                           type="text" 
                           value={editForm?.person}
                           onChange={(e) => handleInputChange('person', e.target.value)}
                           className="w-full text-sm p-1 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                         />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                           type="text" 
                           value={editForm?.vehicle}
                           onChange={(e) => handleInputChange('vehicle', e.target.value)}
                           className="w-full text-sm p-1 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                         />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                           type="number" 
                           step="0.01"
                           value={editForm?.amountTons}
                           onChange={(e) => handleInputChange('amountTons', parseFloat(e.target.value))}
                           className="w-24 text-sm p-1 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                         />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={handleSaveClick} className="text-green-600 hover:text-green-900 dark:hover:text-green-400 p-1">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={handleCancelClick} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-1">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // VIEW MODE
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                              {record.person.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{record.person}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-2 px-2 py-1 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md w-fit">
                          <Truck className="w-3 h-3" />
                          {record.vehicle}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-agri-700 dark:text-agri-400 font-bold">
                        {record.amountTons.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => handleEditClick(record)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(record.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordList;
