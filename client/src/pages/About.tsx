import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Wrench, MapPin, Truck, CheckCircle2, Hammer, Users } from 'lucide-react';
import { api } from '../services/api';
import { WorkshopSetting } from '../types';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<WorkshopSetting | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.settings.getWorkshop();
        setSettings(res.settings);
      } catch (err) {
        console.error('Failed to load workshop settings:', err);
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 lg:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
            <Award className="w-4 h-4" />
            <span>35-Year Heritage (1991–2026)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            About RJ BODY BUILDING
          </h1>
          <p className="text-orange-400 font-semibold text-lg mt-2">
            Lorry Body Building &amp; Modification Workshop • Madurai
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-4 leading-relaxed">
            Founded in 1991 in Vasthanagar, Madurai, RJ BODY BUILDING has continuously served transport operators, fleet owners, and commercial drivers across Tamil Nadu with unyielding craftsmanship and structural integrity.
          </p>
        </div>
      </section>

      {/* Heritage & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="text-orange-600 font-extrabold text-xs uppercase tracking-wider">
              Our Journey &amp; Legacy
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-snug">
              Three and a Half Decades of Heavy Metal Fabrication
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {settings?.aboutSummary ||
                'Founded in 1991 in Vasthanagar, near Agrini / Ravithurayan Temple in Madurai, RJ BODY BUILDING has built its reputation on engineering heavy-duty lorry bodies capable of withstanding rough highway runs, stone quarry shock loads, and long-distance freight across South India.'}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every vehicle entering our workshop undergoes precision alignment checks, high-tensile channel reinforcement, heavy-duty floor planking, and multi-coat protective finishes to safeguard against rust, vibration, and structural fatigue.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100">
                <div className="text-2xl font-black text-orange-600">1991</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Established in Madurai</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Over 35 continuous years of master craft.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-2xl font-black text-slate-900">10+</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Specialist Trades</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Body work, painting, lining, electricals.</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <MapPin className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-bold text-base text-white">Workshop Location</h3>
                <p className="text-xs text-orange-400">Vasthanagar, Madurai, Tamil Nadu</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Our workshop is situated in Vasthanagar, close to the Agrini complex and Ravithurayan Temple in Madurai. With wide entry bays accommodating up to multi-axle 22-tyre trailers, our facility houses comprehensive metal-cutting, bending, welding, spray-painting, and chassis-straightening bays.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Heavy structural steel channel fabrication (ISMC 100/125)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>RTO AIS-090 reflective tape fitment and compliance certification</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Full electrical loom wiring, LED marker lights &amp; horn setups</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Anti-rust zinc primer and polyurethane enamel spray coating</span>
              </div>
            </div>

            <Link
              to="/enquiry"
              className="block text-center bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Get a Vehicle Quotation
            </Link>
          </div>
        </div>
      </section>

      {/* Workshop Departments & Dedicated Teams */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-orange-600 font-extrabold text-xs uppercase tracking-wider">
              Comprehensive Trade Teams
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              10 In-House Workshop Departments
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Under one unified roof, our specialized artisans and mechanics handle every stage of your commercial vehicle build without subcontracting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Body Work', desc: 'Chassis cross-members, tipper brackets, and channel welding.' },
              { title: 'Painting', desc: 'Zinc chromate primer and heavy-duty polyurethane topcoats.' },
              { title: 'Artist', desc: 'Traditional Tamil Nadu lorry lettering and cabin designs.' },
              { title: 'Electrical', desc: '24V harness routing, cabin horn systems & LED markers.' },
              { title: 'Lining', desc: 'Seasoned salwood floor planking and cab acoustic lining.' },
              { title: 'Mechanic', desc: 'Pneumatic air brake diagnostics and leaf spring checks.' },
              { title: 'Glass Fixing', desc: 'Toughened front windshields and side window channels.' },
              { title: 'Sticker Fixing', desc: 'AIS 090 RTO retro-reflective conspicuity markings.' },
              { title: 'Maintenance', desc: 'Rigorous steel grading and consumable inventory audits.' },
              { title: 'Security', desc: '24/7 gate logging and customer vehicle yard safety.' },
            ].map((d, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-orange-600 uppercase mb-1">
                  Dept 0{i + 1}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{d.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
