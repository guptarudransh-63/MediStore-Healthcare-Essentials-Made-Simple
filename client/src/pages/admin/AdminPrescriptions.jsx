import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Eye, 
  ExternalLink, 
  Clock, 
  User, 
  Calendar,
  X
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, formatDateTime, getPrescriptionStatusBadge } from '../../utils/formatters';

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Review Modal state
  const [activeReviewRx, setActiveReviewRx] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [doctorRegNumber, setDoctorRegNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');

      const res = await api.get(`/prescriptions?${params.toString()}`);
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [statusFilter]);

  const handleOpenReview = (rx) => {
    setActiveReviewRx(rx);
    setReviewNotes(rx.reviewNotes || '');
    setDoctorRegNumber(rx.doctorRegNumber || '');
    setValidUntil(rx.validUntil ? new Date(rx.validUntil).toISOString().split('T')[0] : '');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeReviewRx) return;
    if (newStatus === 'rejected' && !reviewNotes.trim()) {
      alert('Please specify a rejection reason in the notes so the patient can be notified.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.patch(`/prescriptions/${activeReviewRx._id}/status`, {
        status: newStatus,
        reviewNotes,
        doctorRegNumber,
        validUntil: validUntil || undefined
      });

      setActiveReviewRx(null);
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating prescription status');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prescription Review Queue</h1>
        <p className="text-xs text-slate-500 mt-1">Pharmacist regulatory verification of uploaded medical prescriptions before fulfillment</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            !statusFilter ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Submissions
        </button>
        <button
          onClick={() => setStatusFilter('pending_review')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            statusFilter === 'pending_review' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            statusFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setStatusFilter('clarification_required')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            statusFilter === 'clarification_required' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
          }`}
        >
          Clarification Needed
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-3">Patient Name</th>
                <th className="py-3 px-3">Doctor / Clinic</th>
                <th className="py-3 px-3">Linked Order</th>
                <th className="py-3 px-3">Customer Contact</th>
                <th className="py-3 px-3 text-center">Verification Status</th>
                <th className="py-3 px-3">Reviewed By</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading prescription queue...</td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No prescriptions found in this queue.</td>
                </tr>
              ) : (
                prescriptions.map((rx) => {
                  const badge = getPrescriptionStatusBadge(rx.status);

                  return (
                    <tr key={rx._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {formatDateTime(rx.createdAt)}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {rx.patientName || 'Self'}
                        {rx.patientAge && <span className="text-slate-400 font-normal ml-1">({rx.patientAge}y)</span>}
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {rx.doctorName || <span className="text-slate-400 italic">Not specified</span>}
                      </td>

                      <td className="py-3 px-3">
                        {rx.order ? (
                          <span className="font-mono font-bold text-brand-700">{rx.order.orderNumber}</span>
                        ) : (
                          <span className="text-slate-400">Vault Upload</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <p>{rx.customer?.name}</p>
                        <p className="text-[10px] text-slate-400">{rx.customer?.phone}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {rx.reviewedBy ? (
                          <div>
                            <p className="font-medium text-slate-800">{rx.reviewedBy.name}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(rx.reviewedAt)}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting Review</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenReview(rx)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          Review Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {activeReviewRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Prescription Verification Protocol
                </h3>
                <p className="text-xs text-slate-400">Ref: {activeReviewRx._id} • Patient: {activeReviewRx.patientName || 'Self'}</p>
              </div>
              <button onClick={() => setActiveReviewRx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Document image on left, checklist & action on right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Document Display */}
              <div className="md:col-span-6 bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden border border-slate-200">
                {activeReviewRx.fileType === 'application/pdf' ? (
                  <div className="text-center py-12 space-y-3">
                    <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">PDF Document ({activeReviewRx.originalFileName})</p>
                    <a
                      href={activeReviewRx.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Open Document in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <img
                    src={activeReviewRx.fileUrl}
                    alt="Prescription document"
                    className="max-h-[450px] object-contain rounded-xl shadow-xs"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                )}
              </div>

              {/* Review Form & Decisions */}
              <div className="md:col-span-6 space-y-4 text-xs">
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Patient & Doctor Meta</h4>
                  <p><strong>Patient:</strong> {activeReviewRx.patientName || 'Self'} ({activeReviewRx.patientAge || '-'} yrs)</p>
                  <p><strong>Prescribing Doctor:</strong> {activeReviewRx.doctorName || 'Not identified'}</p>
                  <p><strong>Original File:</strong> {activeReviewRx.originalFileName}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Doctor Council Registration No</label>
                    <input
                      type="text"
                      placeholder="e.g. MCI-2015-99882"
                      value={doctorRegNumber}
                      onChange={(e) => setDoctorRegNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Prescription Valid Until</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Pharmacist Review Notes *</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Verified diagnosis and dosage. Augmentin 625 Duo 1 tab BD for 5 days confirmed."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Decision Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => handleUpdateStatus('approved')}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Prescription</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => handleUpdateStatus('clarification_required')}
                    className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Clarify</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => handleUpdateStatus('rejected')}
                    className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
