import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, AlertCircle, Eye, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { formatDate, getPrescriptionStatusBadge } from '../utils/formatters';

export default function MyPrescriptions({ onOpenPrescriptionModal }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewRx, setPreviewRx] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Prescriptions Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure records of your uploaded doctor prescriptions and pharmacist approvals.
          </p>
        </div>

        <button
          onClick={onOpenPrescriptionModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Prescription</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No prescriptions on record</h3>
          <p className="text-xs text-slate-500">
            Upload your doctor's prescription slip to order prescription-only medications seamlessly.
          </p>
          <button
            onClick={onOpenPrescriptionModal}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((rx) => {
            const badge = getPrescriptionStatusBadge(rx.status);

            return (
              <div
                key={rx._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs hover:border-brand-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate" title={rx.originalFileName}>
                      {rx.originalFileName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Uploaded on {formatDate(rx.createdAt)}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-600 border border-slate-100">
                    <p><span className="text-slate-400">Patient:</span> <strong className="text-slate-800">{rx.patientName || 'Self'}</strong></p>
                    {rx.doctorName && <p><span className="text-slate-400">Doctor:</span> <strong className="text-slate-800">{rx.doctorName}</strong></p>}
                    {rx.reviewedBy && (
                      <p><span className="text-slate-400">Reviewed By:</span> {rx.reviewedBy?.name}</p>
                    )}
                  </div>

                  {rx.reviewNotes && (
                    <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                      <p className="font-bold text-[10px] uppercase text-amber-700">Pharmacist Notes:</p>
                      <p className="text-[11px] mt-0.5">{rx.reviewNotes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {rx._id.slice(-6).toUpperCase()}
                  </span>
                  <button
                    onClick={() => setPreviewRx(rx)}
                    className="flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Document</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription Document Modal Preview */}
      {previewRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewRx.originalFileName}</h3>
                <p className="text-xs text-slate-500">Patient: {previewRx.patientName || 'Self'}</p>
              </div>
              <button
                onClick={() => setPreviewRx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center max-h-[60vh] overflow-y-auto">
              {previewRx.fileType === 'application/pdf' ? (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">PDF Document</p>
                  <a
                    href={previewRx.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                  >
                    <span>Open Full PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <img
                  src={previewRx.fileUrl}
                  alt="Prescription preview"
                  className="max-h-[50vh] object-contain rounded-xl shadow-sm"
                  onError={(e) => {
                    // Fallback to sample placeholder
                    e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60';
                  }}
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewRx(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
