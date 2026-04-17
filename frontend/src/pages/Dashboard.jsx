import { useEffect } from 'react';
import useQuotationStore from '../store/useQuotationStore';
import useClientStore from '../store/useClientStore';
import { Link } from 'react-router-dom';
import { Users, FileText, TrendingUp, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { quotations, fetchQuotations } = useQuotationStore();
  const { clients, fetchClients } = useClientStore();

  useEffect(() => {
    fetchQuotations();
    fetchClients();
  }, [fetchQuotations, fetchClients]);

  // Calculations
  const totalRevenue = quotations.reduce((acc, q) => acc + parseFloat(q.grand_total || 0), 0);
  const recentQuotations = quotations.slice(0, 5);

  const stats = [
    { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { title: 'Total Quotations', value: quotations.length, icon: FileText, color: 'bg-brand-100 text-brand-600' },
    { title: 'Total Clients', value: clients.length, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { title: 'Pending (Draft)', value: quotations.filter(q => q.status === 'Draft').length, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your business metrics</p>
        </div>
        <Link 
          to="/quotations/new"
          className="flex items-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center group hover:border-brand-200 transition-colors">
            <div className={`p-4 rounded-full ${item.color} mr-4 transition-transform group-hover:scale-110`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{item.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Recent Quotations</h2>
          <Link to="/quotations" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all &rarr;</Link>
        </div>
        {recentQuotations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No quotations yet. <Link to="/quotations/new" className="text-brand-600 hover:underline">Create your first one</Link>.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentQuotations.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-700">{q.quotation_number}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{q.client_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(q.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 text-right">₹{parseFloat(q.grand_total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${q.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 
                        q.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                        q.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
