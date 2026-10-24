import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  Wrench,
  Award,
  ChevronRight,
  ArrowRight,
  PhoneCall,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Service, VehicleCategory } from '../types';

export const Home: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [servRes, catRes] = await Promise.all([
          api.settings.getServices(),
          api.settings.getCategories(),
        ]);
        setServices(servRes.services.slice(0, 6));
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Home load error:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Experience Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-400 text-xs font-bold tracking-wide uppercase">
                <Award className="w-4 h-4 text-orange-400" />
                <span>35 Years of Master Craftsmanship • 1991 – 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans">
                RJ BODY BUILDING
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 normal-case mt-2">
                  Lorry Body Building &amp; Modification Workshop
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Madurai’s premier heavy-duty commercial vehicle bodybuilding center. We specialize in precision chassis fabrication, hydraulic tipper bodies, container vans, accident structural restoration, and custom commercial conversions in Vasthanagar.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/enquiry"
                  className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-900/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Enquire For Your Vehicle</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/services"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
                >
                  View All Services &amp; Book
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <div className="text-2xl font-black text-white">35+</div>
                  <div className="text-xs text-slate-400">Years in Operation</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400">Heavy ISMC Steel</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">RTO</div>
                  <div className="text-xs text-slate-400">AIS 090 Compliant</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-400" />
                    <span className="font-bold text-sm text-white">Workshop Location</span>
                  </div>
                  <span className="text-[11px] bg-orange-600/20 text-orange-400 px-2.5 py-0.5 rounded-full font-semibold border border-orange-500/30">
                    Madurai, TN
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white block font-semibold">Vasthanagar Workshop:</strong>
                      Near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Monday to Saturday: 8:30 AM to 7:30 PM</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-orange-400 shrink-0" />
                    <a
                      href="tel:6379302952"
                      className="text-orange-400 hover:text-orange-300 font-bold transition-colors"
                      title="Call Workshop"
                    >
                      Call: +91 63793 02952
                    </a>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>Full-Service Fabrication Facility</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      Chassis alignment &amp; hydraulic tipper framing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      Seasoned hardwood sal floor planking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      Anti-corrosion polyurethane 3-coat paint finish
                    </li>
                  </ul>
                </div>

                <Link
                  to="/contact"
                  className="block text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors border border-slate-600"
                >
                  View Location &amp; Directions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Services Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-orange-600 font-extrabold text-xs uppercase tracking-wider">
              Specialized Services
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Crafted for Commercial Durability
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Engineered according to Indian road freight demands, quarry conditions, and RTO mandates.
            </p>
          </div>
          <Link
            to="/services"
            className="text-orange-600 hover:text-orange-700 font-bold text-sm flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all hover:border-orange-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
                  {svc.category}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  {svc.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {svc.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Custom specifications</span>
                <Link
                  to={`/enquiry?service=${encodeURIComponent(svc.name)}`}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>Enquire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicle Category Highlights */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-orange-600 font-extrabold text-xs uppercase tracking-wider">
              Vehicle Expertise
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Vehicle Categories &amp; Supported Models
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From intracity small mini-trucks to 22-tyre national permit heavy haulers, our Madurai workshop builds bodies custom-fitted to your vehicle's payload rating.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center mb-4">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{cat.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                  {cat.models && cat.models.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider text-slate-400">
                        Popular Models:
                      </span>
                      {cat.models.slice(0, 3).map((m) => (
                        <div key={m.id} className="text-slate-800 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          <span>{m.modelName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to="/categories"
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-between"
                  >
                    <span>View Models &amp; Body Types</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Build Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-orange-600/30 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Workshop Fabrication &amp; Modification</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Build or Modify Your Commercial Vehicle?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Submit your vehicle requirements online to receive a detailed, itemized quotation from master craftsmen with 35 years of experience in Madurai.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/enquiry"
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-900/40 transition-transform transform hover:-translate-y-0.5"
              >
                Start an Enquiry Now
              </Link>
              <Link
                to="/contact"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Visit Workshop Location
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
