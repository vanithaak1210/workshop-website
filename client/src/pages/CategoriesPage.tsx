import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Check, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { VehicleCategory } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.settings.getCategories();
        setCategories(res.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 lg:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
            <Truck className="w-4 h-4" />
            <span>Commercial Vehicle Classification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Vehicle &amp; Axle Categories
          </h1>
          <p className="text-orange-400 font-semibold text-lg mt-2">
            RJ BODY BUILDING • Vasthanagar, Madurai
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-4 leading-relaxed">
            We engineer tailored lorry bodies for all commercial segments—from intracity mini trucks to heavy multi-axle freight carriers. Explore our supported chassis configurations and model compatibility.
          </p>
        </div>
      </section>

      {/* Main Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
          >
            {/* Category Banner */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                    {category.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>

              {(category.axleType || category.tyreCount) && (
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
                  {category.axleType && (
                    <span className="font-semibold text-orange-400">{category.axleType}</span>
                  )}
                  {category.tyreCount && (
                    <span className="text-slate-400 font-medium">({category.tyreCount} Tyres)</span>
                  )}
                </div>
              )}
            </div>

            {/* Models Table / Cards */}
            <div className="p-6 sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Supported Models &amp; Compatible Body Types
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.models && category.models.length > 0 ? (
                  category.models.map((model) => (
                    <div
                      key={model.id}
                      className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 hover:bg-white hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
                          {model.brand}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5 mb-3">
                          {model.modelName}
                        </h4>

                        <div className="space-y-1.5 text-xs">
                          <span className="font-semibold text-slate-500 text-[11px] block">
                            Compatible Body Types:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {model.supportedBodyTypes.split(',').map((bt, i) => (
                              <span
                                key={i}
                                className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 shadow-2xs"
                              >
                                {bt.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">ISMC Steel Build</span>
                        <Link
                          to={`/enquiry?category=${encodeURIComponent(category.name)}&makeModel=${encodeURIComponent(model.modelName)}`}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          <span>Enquire</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-xs text-slate-500">
                    No models registered in this category yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
