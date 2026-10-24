import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { WorkshopSetting } from '../types';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<WorkshopSetting | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.settings.getWorkshop();
        setSettings(res.settings);
      } catch (err) {
        console.error('Failed to load workshop contact settings:', err);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Name, phone number, and message are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.contact.submit({
        name: name.trim(),
        phone: phone.trim(),
        subject: subject.trim() || 'Workshop Contact Message',
        message: message.trim(),
      });
      setSubmitted(true);
      showToast('Thank you! Your message has been received by our workshop.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 lg:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
            <MapPin className="w-4 h-4" />
            <span>Workshop Location &amp; Communications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Contact RJ BODY BUILDING
          </h1>
          <p className="text-orange-400 font-semibold text-lg mt-2">
            Lorry Body Building &amp; Modification Workshop • Vasthanagar, Madurai
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-4 leading-relaxed">
            Visit our heavy vehicle fabrication yard in Madurai or send our supervisors a direct message regarding vehicle body fabrication, structural repair, or timeline enquiries.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Workshop Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3">
                Official Location &amp; Hours
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Workshop Yard Address:</h4>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {settings?.location ||
                        'Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India.'}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Landmark: Vasthanagar / Agrini Complex corridor
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Operating Hours:</h4>
                    <p className="text-slate-600 mt-1">
                      {settings?.businessHours || 'Monday - Saturday: 8:30 AM - 7:30 PM (Sunday Closed)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Official Workshop Phone:</h4>
                    <a
                      href="tel:6379302952"
                      className="text-orange-600 hover:text-orange-700 font-bold text-sm mt-1 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{settings?.phonePlaceholder || '+91 63793 02952'}</span>
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Click to call directly for body building enquiries
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder & Yard Navigation */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-orange-400">
                Yard Directions &amp; Heavy Vehicle Access
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vehicles arriving from Madurai Ring Road or Tiruparankundram Road can enter via Vasthanagar main approach. Our entrance gate easily accommodates long 22-wheel chassis and high-deck tractor-trailers.
              </p>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-400">
                Map coordinates and live navigation directions can be updated in Admin Settings once geo-location pins are finalized.
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-6">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                  Send a Workshop Message
                </h3>
              </div>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Message Delivered</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your message has been saved to the workshop administration inbox. A supervisor will reach out to your phone number shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSubject('');
                      setMessage('');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. V. Sundaram"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 94432 99881"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Enquiry Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. 24ft Timber Body Quotation / Modification"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Message / Question *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please let us know your vehicle type, expected work, or questions."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
