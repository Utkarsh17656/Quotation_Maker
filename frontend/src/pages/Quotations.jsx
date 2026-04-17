import { useEffect, useState } from 'react';
import useQuotationStore from '../store/useQuotationStore';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Quotations() {
  const { quotations, fetchQuotations, deleteQuotation, loading } = useQuotationStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const filteredQuotations = quotations.filter(q => 
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    (q.client_name && q.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your quotations</p>
        </div>
        <Link 
          to="/quotations/new"
          className="flex items-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by quote number or client..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading quotations...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Number</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((q) => (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm font-medium text-gray-900">{q.quotation_number}</td>
                  <td className="p-4 font-medium text-gray-700">{q.client_name || '-'}</td>
                  <td className="p-4 text-sm text-gray-500">{q.date ? format(parseISO(q.date), 'MMM dd, yyyy') : '-'}</td>
                  <td className="p-4 font-semibold text-gray-900 text-right">₹{parseFloat(q.grand_total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${q.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 
                        q.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                        q.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                     <Link to={`/quotations/${q.id}/edit`} className="inline-block text-gray-400 hover:text-brand-600 mx-2 transition-colors" title="View/Edit"><Edit2 className="w-4 h-4" /></Link>
                     <button 
                       onClick={() => {
                         if(window.confirm('Are you sure you want to delete this quotation?')) {
                           deleteQuotation(q.id);
                         }
                       }}
                       className="text-gray-400 hover:text-red-600 transition-colors"
                       title="Delete"
                     ><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredQuotations.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">No quotations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
