import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Clock,
  Wrench,
  Edit3,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { WorkshopSetting, Service } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<WorkshopSetting | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [workshopName, setWorkshopName] = useState('RJ BODY BUILDING');
  const [tagline, setTagline] = useState('Lorry Body Building & Modification Workshop');
  const [location, setLocation] = useState('Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India');
  const [phonePlaceholder, setPhonePlaceholder] = useState('+91 63793 02952');
  const [whatsappPlaceholder, setWhatsappPlaceholder] = useState('+91 63793 02952');
  const [businessHours, setBusinessHours] = useState('');
  const [aboutSummary, setAboutSummary] = useState('');

  // Service Edit Modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('');
  const [svcDescription, setSvcDescription] = useState('');
  const [savingSvc, setSavingSvc] = useState(false);
  const [svcError, setSvcError] = useState<string | null>(null);

  const fetchSettingsAndServices = async () => {
    try {
      const [settingsRes, servicesRes] = await Promise.all([
        api.settings.getWorkshop(),
        api.settings.getServices(),
      ]);
      const s = settingsRes.settings;
      setSettings(s);
      setWorkshopName(s.workshopName);
      setTagline(s.tagline);
      setLocation(s.location);
      setPhonePlaceholder(s.phonePlaceholder || '+91 63793 02952');
      setWhatsappPlaceholder(s.whatsappPlaceholder || '+91 63793 02952');
      setBusinessHours(s.businessHours);
      setAboutSummary(s.aboutSummary);

      setServices(servicesRes.services);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndServices();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.settings.updateWorkshop({
        workshopName,
        tagline,
        location,
        phonePlaceholder,
        whatsappPlaceholder,
        businessHours,
        aboutSummary,
      });
      setSettings(res.settings);
      showToast('Workshop settings saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openServiceEdit = (svc: Service) => {
    setEditingService(svc);
    setSvcName(svc.name);
    setSvcCategory(svc.category);
    setSvcDescription(svc.description);
    setSvcError(null);
  };

  const handleSaveServiceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!svcName.trim()) {
      setSvcError('Service name is required.');
      return;
    }

    setSavingSvc(true);
    setSvcError(null);
    try {
      await api.settings.updateService(editingService.id, {
        name: svcName.trim(),
        category: svcCategory.trim(),
        description: svcDescription.trim(),
      });
      showToast(`Service "${svcName.trim()}" updated successfully.`, 'success');
      setEditingService(null);
      await fetchSettingsAndServices();
    } catch (err: any) {
      setSvcError(err.message || 'Failed to update service.');
    } finally {
      setSavingSvc(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
          Workshop Configuration
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          RJ BODY BUILDING Settings &amp; Services
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain verified business details, phone line (6379302952), and workshop service offerings.
        </p>
      </div>

      {/* Workshop Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs"
      >
        {/* Identity */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>Official Identity &amp; Heritage</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Workshop Name (Official)
              </label>
              <input
                type="text"
                required
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tagline
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Location & Hours */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Physical Yard Location &amp; Hours</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Workshop Address
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Business Operating Hours
              </label>
              <input
                type="text"
                required
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Contact Phone Numbers */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-600" />
            <span>Direct Workshop Communications (6379302952)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Official Phone Line (Clickable: tel:6379302952)
              </label>
              <input
                type="text"
                required
                value={phonePlaceholder}
                onChange={(e) => setPhonePlaceholder(e.target.value)}
                placeholder="+91 63793 02952"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Official workshop phone displayed on header, contact page, and footer.
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                WhatsApp Phone Line
              </label>
              <input
                type="text"
                value={whatsappPlaceholder}
                onChange={(e) => setWhatsappPlaceholder(e.target.value)}
                placeholder="+91 63793 02952"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* About Summary */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            About Us Narrative / Summary (35 Years Heritage)
          </label>
          <textarea
            rows={3}
            value={aboutSummary}
            onChange={(e) => setAboutSummary(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Workshop Settings'}</span>
          </button>
        </div>
      </form>

      {/* Workshop Services Section (Requirement 4: Edit Services) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Workshop Service Categories ({services.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The official workshop services available for public booking and enquiry.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {svc.name}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                      {svc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-md truncate">
                    {svc.description}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openServiceEdit(svc)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal */}
      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Edit Workshop Service"
        subtitle={`Update service details for "${editingService?.name || ''}"`}
      >
        {editingService && (
          <form onSubmit={handleSaveServiceEdit} className="space-y-4 text-xs">
            {svcError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{svcError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={svcName}
                onChange={(e) => setSvcName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={svcCategory}
                onChange={(e) => setSvcCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Fabrication">Fabrication</option>
                <option value="Repair">Repair</option>
                <option value="Modification">Modification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={svcDescription}
                onChange={(e) => setSvcDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSvc}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-950/20"
              >
                {savingSvc ? 'Saving...' : 'Save Service Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminSettings;
