import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import useQuotationStore from '../store/useQuotationStore';
import useClientStore from '../store/useClientStore';
import QuotationPreview from '../components/QuotationPreview';
import CustomFieldModal from '../components/CustomFieldModal';
import { Plus, Trash2, Save, Download, ArrowLeft, Settings } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function QuotationBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createQuotation, updateQuotation, fetchQuotationById } = useQuotationStore();
  const { clients, fetchClients } = useClientStore();

  useEffect(() => {
    const initialize = async () => {
      await fetchClients();
      if (id) {
        try {
          const quotation = await fetchQuotationById(id);
          setFormData({
            client: quotation.client ? quotation.client.toString() : '',
            quotation_number: quotation.quotation_number || '',
            date: quotation.date ? quotation.date.split('T')[0] : new Date().toISOString().split('T')[0],
            expiry_date: quotation.expiry_date ? quotation.expiry_date.split('T')[0] : '',
            notes: quotation.notes || '',
            terms: quotation.terms || '',
            status: quotation.status || 'Draft',
            items: quotation.items && quotation.items.length > 0 ? quotation.items : [{ name: '', description: '', quantity: 1, unit_price: 0, tax_percent: 0, discount_percent: 0, discount_amount: 0 }],
            subtotal: quotation.subtotal || 0,
            total_tax: quotation.total_tax || 0,
            total_discount: quotation.total_discount || 0,
            grand_total: quotation.grand_total || 0,
            custom_fields: quotation.custom_fields || []
          });
        } catch(error) {
          console.error("Failed to fetch quotation:", error);
          alert("Quotation not found");
          navigate('/quotations');
        }
      }
    };
    initialize();
  }, [fetchClients, fetchQuotationById, id, navigate]);

  const [formData, setFormData] = useState({
    client: '',
    quotation_number: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 15 days.',
    status: 'Draft',
    items: [
      { name: '', description: '', quantity: 1, unit_price: 0, tax_percent: 0, discount_percent: 0, discount_amount: 0 }
    ],
    subtotal: 0,
    total_tax: 0,
    total_discount: 0,
    grand_total: 0,
    custom_fields: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);

  // Recalculate totals whenever items change
  useEffect(() => {
    let newSubtotal = 0;
    let newTotalTax = 0;
    let newTotalDiscount = 0;

    formData.items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_percent) || 0;
      const discRate = parseFloat(item.discount_percent) || 0;
      const discAmt = parseFloat(item.discount_amount) || 0;

      const preTaxTotal = qty * price;
      
      let lineDiscount = 0;
      if (discRate > 0) lineDiscount = preTaxTotal * (discRate / 100);
      else lineDiscount = discAmt;

      const afterDisc = preTaxTotal - lineDiscount;
      const lineTax = afterDisc * (taxRate / 100);

      newSubtotal += preTaxTotal;
      newTotalDiscount += lineDiscount;
      newTotalTax += lineTax;
    });

    setFormData(prev => ({
      ...prev,
      subtotal: newSubtotal,
      total_tax: newTotalTax,
      total_discount: newTotalDiscount,
      grand_total: newSubtotal - newTotalDiscount + newTotalTax
    }));
  }, [formData.items]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', description: '', quantity: 1, unit_price: 0, tax_percent: 0, discount_percent: 0, discount_amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
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

  const handleSave = async () => {
    if (!formData.client) {
      alert('Please select a client');
      return;
    }
    
    // Validate items
    const isValid = formData.items.every(i => i.name && i.unit_price >= 0);
    if (!isValid) {
      alert('Please ensure all items have a name and valid price.');
      return;
    }

    setIsSaving(true);
    try {
      if (id) {
        await updateQuotation(id, formData);
      } else {
        await createQuotation(formData);
      }
      navigate('/quotations');
    } catch (err) {
      console.error(err);
      alert('Failed to save quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = () => {
    const element = document.getElementById('quotation-print-area');
    const opt = {
      margin:       0,
      filename:     `Quotation_${formData.quotation_number}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const selectedClient = clients.find(c => c.id === parseInt(formData.client));

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Scrollable Form Area */}
      <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white shadow-[0_0_15px_rgba(0,0,0,0.05)] z-10">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20">
          <div className="flex items-center">
            <Link to="/quotations" className="mr-4 text-gray-400 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{id ? 'Edit Quotation' : 'New Quotation'}</h1>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={exportPDF} 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" /> PDF
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : (id ? 'Update Quotation' : 'Save As Draft')}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Metadata Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Document Settings</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Client <span className="text-red-500">*</span></label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 bg-white"
                  value={formData.client} 
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  required
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {clients.length === 0 && <p className="text-xs text-brand-600 mt-1">Please add a client from the Clients page first.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Number</label>
                <input 
                  type="text" 
                  value={formData.quotation_number} 
                  onChange={(e) => setFormData({...formData, quotation_number: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 font-mono" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.expiry_date} 
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500" 
                />
              </div>
            </div>
          </section>

          {/* Items Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Line Items</h3>
            <div className="space-y-6">
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm relative group">
                  <button 
                    onClick={() => removeItem(idx)} 
                    className="absolute -top-3 -right-3 bg-white border border-gray-200 p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Item Name</label>
                      <input 
                        type="text" placeholder="e.g., Web Design Services"
                        value={item.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                      <input 
                        type="number" min="1" step="0.5"
                        value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (₹)</label>
                      <input 
                        type="number" min="0" step="0.01"
                        value={item.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                      />
                    </div>
                    <div className="col-span-12">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description (Optional)</label>
                      <input 
                        type="text" placeholder="Detailed description..."
                        value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 text-sm italic" 
                      />
                    </div>
                    <div className="col-span-6 md:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tax (%)</label>
                      <input 
                        type="number" min="0" step="0.1"
                        value={item.tax_percent} onChange={(e) => handleItemChange(idx, 'tax_percent', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                      />
                    </div>
                    <div className="col-span-6 md:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Discount (%)</label>
                      <input 
                        type="number" min="0" max="100" step="0.1"
                        value={item.discount_percent} onChange={(e) => handleItemChange(idx, 'discount_percent', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={addItem}
              className="mt-6 flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 text-brand-600 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Item
            </button>
          </section>

          {/* Custom Fields Section */}
          <section>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Custom Fields</h3>
              <button 
                onClick={() => setIsCustomFieldModalOpen(true)}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center bg-purple-50 px-2 py-1 rounded-md transition-colors"
                type="button"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Field
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {formData.custom_fields.map((field, idx) => (
                <div key={idx} className="relative group p-4 border border-gray-100 bg-gray-50/30 rounded-xl">
                  <button 
                    onClick={() => removeCustomField(idx)} 
                    className="absolute -top-2 -right-2 bg-white border border-gray-200 p-1 rounded-full text-red-500 hover:text-red-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
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
              ))}
              {formData.custom_fields.length === 0 && (
                <div className="col-span-2 py-4 text-center text-xs text-gray-400 italic">
                  No custom fields added yet.
                </div>
              )}
            </div>
          </section>

          {/* Notes Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Additional Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes to Client</label>
                <textarea 
                  rows="2"
                  value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea 
                  rows="2"
                  value={formData.terms} onChange={(e) => setFormData({...formData, terms: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Live Preview Area - Fixed */}
      <div className="w-1/2 bg-gray-100 overflow-y-auto relative hidden md:block">
        <div className="absolute inset-0 p-8 flex justify-center pb-20">
          <div className="scale-[0.80] transform-gpu origin-top">
            <QuotationPreview data={formData} client={selectedClient} />
          </div>
        </div>
      </div>

      <CustomFieldModal 
        isOpen={isCustomFieldModalOpen} 
        onClose={() => setIsCustomFieldModalOpen(false)} 
        onSave={handleSaveCustomField}
      />
    </div>
  );
}
