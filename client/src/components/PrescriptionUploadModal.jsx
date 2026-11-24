import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import api from '../services/api';

export default function PrescriptionUploadModal({ isOpen, onClose, onUploadSuccess, orderId = null }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(selected.mimetype || selected.type)) {
      setError('Please upload a valid image (JPEG, PNG, WEBP) or PDF file.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setError(null);
    setFile(selected);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a prescription document to upload.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('prescription', file);
      if (patientName) formData.append('patientName', patientName);
      if (patientAge) formData.append('patientAge', patientAge);
      if (doctorName) formData.append('doctorName', doctorName);
      if (orderId) formData.append('orderId', orderId);

      const res = await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessResult(res.data.prescription);
      if (onUploadSuccess) {
        onUploadSuccess(res.data.prescription);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setSuccessResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload Doctor's Prescription</h3>
              <p className="text-[11px] text-slate-500">Required by pharmacy law for Schedule H medicines</p>
            </div>
          </div>
          <button onClick={handleReset} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Prescription Uploaded Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Our licensed registered pharmacist will verify your prescription details before your order is dispatched.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-left text-slate-700 space-y-1">
                <div><span className="font-semibold text-slate-500">Ref ID:</span> {successResult._id}</div>
                <div><span className="font-semibold text-slate-500">Status:</span> <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Pending Review</span></div>
                <div><span className="font-semibold text-slate-500">Patient:</span> {successResult.patientName || 'Self'}</div>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  file ? 'border-teal-400 bg-teal-50/20' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-2">
                    {previewUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Prescription preview"
                          className="max-h-36 rounded-lg mx-auto border border-slate-200 shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                          Image Selected
                        </span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-slate-800">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Click to upload prescription</p>
                      <p className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP or PDF (Max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient and Doctor metadata fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Patient Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 36"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Doctor Name / Clinic</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. V. K. Mathur"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 space-y-1 border border-slate-200">
                <p className="font-semibold text-slate-700">Prescription Requirements:</p>
                <p>• Must be legible with Doctor's name, degree, and clinic stamp.</p>
                <p>• Must contain patient name, prescribed medicines and dosage schedule.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Uploading & Verifying...</span>
                  </>
                ) : (
                  <span>Submit Prescription for Verification</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
