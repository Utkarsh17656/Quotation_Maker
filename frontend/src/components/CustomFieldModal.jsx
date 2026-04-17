import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';

export default function CustomFieldModal({ isOpen, onClose, onSave }) {
  const [fieldData, setFieldData] = useState({
    name: '',
    type: 'Single Line Text'
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fieldData.name.trim()) {
      setError('Name is a required field');
      return;
    }
    onSave({ ...fieldData, label: fieldData.name });
    setFieldData({ name: '', type: 'Single Line Text' });
    setError('');
    onClose();
  };

  const fieldTypes = [
    'Single Line Text',
    'Multi Line Text',
    'Email',
    'Phone',
    'URL',
    'Number',
    'Date'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
        <div className="p-6 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Add Custom Field</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <div className="flex items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Field Name*</label>
              <HelpCircle className="w-4 h-4 text-gray-400 ml-1.5 cursor-help" />
            </div>
            <p className="text-xs text-gray-500 mb-2">The name/label of the custom field</p>
            <div className="relative">
              <input
                type="text"
                value={fieldData.name}
                onChange={(e) => {
                  setFieldData({ ...fieldData, name: e.target.value });
                  if (error) setError('');
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                  error ? 'border-red-400 focus:border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-500'
                }`}
                placeholder="e.g. Project Code"
              />
              {error && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                  <div className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-bold">!</div>
                </div>
              )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
          </div>

          <div>
            <div className="flex items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Field Type*</label>
              <HelpCircle className="w-4 h-4 text-gray-400 ml-1.5 cursor-help" />
            </div>
            <select
              value={fieldData.type}
              onChange={(e) => setFieldData({ ...fieldData, type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 transition-all font-medium appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")` }}
            >
              {fieldTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-[#7C3AED] text-white font-bold rounded-xl hover:bg-[#6D28D9] shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
