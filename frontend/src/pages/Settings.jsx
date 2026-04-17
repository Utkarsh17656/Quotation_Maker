import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { Save, Upload, User as UserIcon, Building, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    gst_number: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('business');

  useEffect(() => {
    if (user) {
      setFormData({
        company_name: user.company_name || '',
        company_address: user.company_address || '',
        gst_number: user.gst_number || ''
      });
      if (user.logo) {
        setLogoPreview(user.logo.startsWith('http') ? user.logo : `http://localhost:8000${user.logo}`);
      }
    }
  }, [user]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      const data = new FormData();
      data.append('company_name', formData.company_name);
      data.append('company_address', formData.company_address);
      data.append('gst_number', formData.gst_number);
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      await updateProfile(data);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business profile and preferences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            type="button"
            onClick={() => setActiveTab('business')}
            className={`px-6 py-4 flex items-center text-sm font-semibold transition ${activeTab === 'business' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Building className="w-4 h-4 mr-2" /> Business Profile
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('account')}
            className={`px-6 py-4 flex items-center text-sm font-semibold transition ${activeTab === 'account' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserIcon className="w-4 h-4 mr-2" /> Account Details
          </button>
        </div>

        {activeTab === 'business' ? (
          <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 flex flex-col items-start">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Company Logo</label>
              
              <div 
                className="w-full aspect-square relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-brand-400 transition-colors overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Company Logo" className="w-full h-full object-contain p-4 group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center text-sm font-medium text-brand-600 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
                        <Upload className="w-4 h-4 mr-1.5" /> Change image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">Click to upload logo</p>
                    <p className="text-[10px] mt-1 text-gray-400">PNG or JPG up to 2MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={formData.company_name} 
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-colors" 
                  placeholder="e.g. Acme Corp" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GST/Tax Number</label>
                <input 
                  type="text" 
                  value={formData.gst_number} 
                  onChange={(e) => setFormData({...formData, gst_number: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 font-mono transition-colors" 
                  placeholder="Optional" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Address</label>
                <textarea 
                  rows="3" 
                  value={formData.company_address} 
                  onChange={(e) => setFormData({...formData, company_address: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-colors" 
                  placeholder="The address that will appear on your quotations..." 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              {message && (
                <p className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </div>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-sm transition-colors active:scale-95 disabled:opacity-70"
            >
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
        ) : (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {user?.username}
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                 <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                   {user?.email || 'No email provided'}
                 </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                 <p className="text-sm text-gray-500 italic">To change your password or security settings, please wait for the full identity update in the next release.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
