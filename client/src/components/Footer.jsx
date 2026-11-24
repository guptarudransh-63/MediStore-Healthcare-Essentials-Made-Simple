import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ShieldCheck, HeartHandshake, FileCheck, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Trust & Quality Bar */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-900/50 text-brand-400 border border-brand-800/60 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Medicines</h4>
              <p className="text-xs text-slate-400">Directly sourced from verified pharmaceutical manufacturers</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-900/50 text-teal-400 border border-teal-800/60 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pharmacist Supervised</h4>
              <p className="text-xs text-slate-400">Strict review of prescriptions before dispensing</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-900/50 text-amber-400 border border-amber-800/60 flex items-center justify-center flex-shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">FEFO Batch Traceability</h4>
              <p className="text-xs text-slate-400">Expiry monitoring ensures no expired medicine is ever sold</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/50 text-emerald-400 border border-emerald-800/60 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Safe Cold-Chain Delivery</h4>
              <p className="text-xs text-slate-400">Temperature monitored storage for sensitive biologics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Brand info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Pill className="w-5 h-5 rotate-45" />
            </div>
            <span className="text-xl font-black text-white">Medi<span className="text-brand-400">Store</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pr-6">
            MediStore is a specialized pharmacy management and healthcare ordering SaaS enabling independent retail medical stores and pharmacies to operate with batch-level FEFO precision, regulatory prescription review, and digital patient delivery.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Plot 42, Health City, Sector 18, Gurugram, Haryana 122001</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>+91 98765 43210 (Toll Free Pharma Helpline)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>pharmacist@medistore.health</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product Catalog</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/products?category=prescription-medicines" className="hover:text-white">Prescription Drugs</Link></li>
            <li><Link to="/products?category=over-the-counter-medicines" className="hover:text-white">OTC Pain & Cold</Link></li>
            <li><Link to="/products?category=medical-devices" className="hover:text-white">Home Diagnostics</Link></li>
            <li><Link to="/products?category=health-supplements" className="hover:text-white">Vitamins & Immunity</Link></li>
            <li><Link to="/products?category=first-aid" className="hover:text-white">First Aid & Dressings</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Patient Services</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/my-orders" className="hover:text-white">Track Order Status</Link></li>
            <li><Link to="/my-prescriptions" className="hover:text-white">Prescription Uploads</Link></li>
            <li><Link to="/cart" className="hover:text-white">Shopping Cart</Link></li>
            <li><Link to="/login" className="hover:text-white">Customer Account</Link></li>
            <li><Link to="/admin" className="hover:text-white">Pharmacy Staff Portal</Link></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Pharmacy Licences</h4>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300 font-mono">
            <div><span className="text-slate-500">DL No:</span> HR-GGM-2024-DL009876</div>
            <div><span className="text-slate-500">Form:</span> 20B & 21B (Retail/Wholesale)</div>
            <div><span className="text-slate-500">GSTIN:</span> 06AAAAA0000A1Z5</div>
            <div><span className="text-slate-500">Council:</span> Haryana State Pharmacy Council</div>
          </div>
        </div>
      </div>

      {/* Safety & Medical Disclaimer Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-slate-800 text-[11px] text-slate-500 leading-normal">
        <p>
          <strong className="text-slate-400 font-medium">Regulatory & Medical Safety Notice:</strong> MediStore is a digital pharmacy software and commerce delivery platform. We do not provide medical diagnosis, treatment advice, or automated prescriptions. Prescription-only medicines (Schedule H/H1) strictly require verification of a valid prescription issued by a Registered Medical Practitioner before dispensing.
        </p>
        <p className="mt-2 text-slate-600">
          © {new Date().getFullYear()} MediStore Technologies Ltd. All rights reserved. Built for professional pharmacy management.
        </p>
      </div>
    </footer>
  );
}
