import { useEffect, useState } from 'react';
import useClientStore from '../store/useClientStore';
import { Plus, Edit2, Trash2, Search, Settings } from 'lucide-react';
import CustomFieldModal from '../components/CustomFieldModal';

export default function Clients() {
  const { clients, fetchClients, loading, addClient, updateClient, deleteClient } = useClientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', zip_code: '', gst_number: '', custom_fields: [] });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await updateClient(formData.id, formData);
    } else {
      await addClient(formData);
    }
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', address: '', zip_code: '', gst_number: '', custom_fields: [] });
  };

  const handleSaveCustomField = (fieldDef) => {
    setFormData({
      ...formData,
      custom_fields: [...formData.custom_fields, { ...fieldDef, value: '' }]
    });
  };

  const handleCustomFieldChange = (index, value) => {
    const newFields = [...formData.custom_fields];
    newFields[index].value = value;
    setFormData({ ...formData, custom_fields: newFields });
  };

  const removeCustomField = (index) => {
    const newFields = formData.custom_fields.filter((_, i) => i !== index);
    setFormData({ ...formData, custom_fields: newFields });
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', address: '', zip_code: '', gst_number: '', custom_fields: [] });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clients...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">GST Number</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4"><span className="font-semibold text-gray-900">{client.name}</span></td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900">{client.email || '-'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{client.phone || ''}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 font-mono">{client.gst_number || '-'}</td>
                  <td className="p-4 text-right">
                     <button 
                       onClick={() => {
                         setFormData({
                           id: client.id,
                           name: client.name,
                           email: client.email || '',
                           phone: client.phone || '',
                           address: client.address || '',
                           zip_code: client.zip_code || '',
                           gst_number: client.gst_number || '',
                           custom_fields: client.custom_fields || []
                         });
                         setIsModalOpen(true);
                       }}
                       className="text-gray-400 hover:text-brand-600 mx-2 transition-colors"><Edit2 className="w-4 h-4" /></button>
                     <button 
                       onClick={() => {
                         if(window.confirm('Are you sure you want to delete this client?')) {
                           deleteClient(client.id);
                         }
                       }}
                       className="text-gray-400 hover:text-red-600 transition-colors"
                     ><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No clients found. Click 'Add Client' to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Client' : 'Add New Client'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company / Contact Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" placeholder="Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" placeholder="billing@acme.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code / ZIP Code</label>
                  <input type="text" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" placeholder="10001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST Number (Optional)</label>
                  <input type="text" value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm font-mono" placeholder="22AAAAA0000A1Z5" />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                <textarea rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm resize-none" placeholder="123 Business St..."></textarea>
              </div>

              {/* Custom Fields Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Additional Fields</label>
                  <button 
                    onClick={() => setIsCustomFieldModalOpen(true)}
                    className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center transition-colors"
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Field
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.custom_fields && formData.custom_fields.map((field, idx) => (
                    <div key={idx} className="relative group flex items-start space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                        {field.type === 'Multi Line Text' ? (
                          <textarea 
                            rows="2"
                            value={field.value} 
                            onChange={(e) => handleCustomFieldChange(idx, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
                          />
                        ) : (
                          <input 
                            type={field.type === 'Number' ? 'number' : field.type === 'Date' ? 'date' : field.type === 'Email' ? 'email' : 'text'} 
                            value={field.value} 
                            onChange={(e) => handleCustomFieldChange(idx, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm"
                          />
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeCustomField(idx)} 
                        className="mt-5 text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm transition-colors">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Custom Field Modal */}
      <CustomFieldModal 
        isOpen={isCustomFieldModalOpen} 
        onClose={() => setIsCustomFieldModalOpen(false)} 
        onSave={handleSaveCustomField}
      />
    </div>
  );
}
