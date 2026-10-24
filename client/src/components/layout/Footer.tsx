import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Workshop Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg uppercase tracking-wide">
                  RJ BODY BUILDING
                </h3>
                <p className="text-xs text-orange-400 font-medium">
                  Lorry Body Building &amp; Modification Workshop
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              35 years of trusted craftsmanship (1991–2026). Specializing in heavy-duty commercial vehicle bodybuilding, tipper fabrication, chassis alignment, accident restoration, and custom cabin modifications in Madurai.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
              <span>RTO AIS-090 Reflective Sticker &amp; Safety Standard Compliant</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
              Workshop Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition-colors">About Us &amp; 35-Year Heritage</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-orange-400 transition-colors">Workshop Services &amp; Booking</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-orange-400 transition-colors">Vehicle Categories</Link>
              </li>
              <li>
                <Link to="/enquiry" className="hover:text-orange-400 transition-colors text-orange-400 font-semibold">Submit Customer Enquiry</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition-colors">Workshop Location &amp; Contact</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Services */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
              Primary Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>New Lorry Body Building (Single/Multi-Axle)</li>
              <li>Accident Vehicle Repair &amp; Rework</li>
              <li>Old Vehicle Conversion to Newer Model</li>
              <li>Hydraulic Tipper Body Fabrication</li>
              <li>Grocery &amp; Cylinder Transport Bodies</li>
              <li>Heavy Polyurethane Spray Painting</li>
              <li>Lorry Electrical Loom &amp; LED Setup</li>
              <li>Pneumatic Brake &amp; Mechanical Checks</li>
            </ul>
          </div>

          {/* Col 4: Official Workshop Location */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
              Workshop Location
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>
                Vasthanagar, near Agrini / Ravithurayan Temple,<br />
                Madurai, Tamil Nadu, India.
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Mon - Sat: 8:30 AM - 7:30 PM (Sun Closed)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-orange-400 shrink-0" />
              <a
                href="tel:6379302952"
                className="font-bold text-orange-400 hover:text-orange-300 transition-colors"
                title="Call RJ BODY BUILDING"
              >
                +91 63793 02952
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; 1991–2026 <span className="text-slate-300 font-semibold">RJ BODY BUILDING</span>. All Rights Reserved.
          </p>
          <p className="text-[11px]">
            Lorry Body Building &amp; Modification Workshop • Vasthanagar, Madurai
          </p>
        </div>
      </div>
    </footer>
  );
};
