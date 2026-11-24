import React, { useRef } from 'react';
import { X, Printer, Download, Pill, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function InvoiceModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Toolbar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Tax Invoice: {invoice.invoiceNumber}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">GST Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 text-slate-800 bg-white text-xs">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center text-white font-black text-sm">
                  MS
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{invoice.pharmacy?.name}</h1>
                  <p className="text-[11px] text-slate-500 font-medium">Licensed Retail & Wholesale Pharmacy Solutions</p>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-600 space-y-0.5">
                <p>{invoice.pharmacy?.address}</p>
                <p>Phone: {invoice.pharmacy?.phone} | Email: {invoice.pharmacy?.email}</p>
                <p className="font-semibold text-slate-800">
                  GSTIN: <span className="font-mono">{invoice.pharmacy?.gstin}</span> | Drug License: <span className="font-mono">{invoice.pharmacy?.dlNumber}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded">
                TAX INVOICE
              </span>
              <div className="mt-3 space-y-1 text-slate-600">
                <p><span className="font-semibold text-slate-800">Invoice No:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-semibold text-slate-800">Order Ref:</span> {invoice.orderNumber}</p>
                <p><span className="font-semibold text-slate-800">Invoice Date:</span> {formatDate(invoice.date)}</p>
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Customer Details</h4>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer?.name}</p>
              <p className="text-slate-600 mt-0.5">{invoice.customer?.phone}</p>
              <p className="text-slate-600">{invoice.customer?.email}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Address</h4>
              <p className="text-slate-700 leading-relaxed">{invoice.customer?.address}</p>
              <p className="mt-1 text-slate-500 text-[11px]">
                Payment: <span className="font-semibold uppercase text-slate-800">{invoice.payment?.method}</span> ({invoice.payment?.status})
              </p>
            </div>
          </div>

          {/* Items Table with Batch Breakdown */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-700 uppercase bg-slate-100">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2">HSN</th>
                  <th className="py-2.5 px-3">Batch & Expiry</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-2 text-right">GST</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-500">{item.srNo}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.packSize} • SKU: {item.sku}</p>
                    </td>
                    <td className="py-2.5 px-2 text-slate-600 font-mono">{item.hsnCode}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-700 max-w-xs">{item.batchInfo}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-900">{item.qty}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(item.rate)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800">{formatCurrency(item.taxableValue)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{item.taxRate}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="flex justify-end my-6">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-medium text-slate-900">{formatCurrency(invoice.pricing?.subtotal)}</span>
              </div>
              {invoice.pricing?.cgst > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Central GST (CGST):</span>
                  <span>{formatCurrency(invoice.pricing?.cgst)}</span>
                </div>
              )}
              {invoice.pricing?.sgst > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>State GST (SGST):</span>
                  <span>{formatCurrency(invoice.pricing?.sgst)}</span>
                </div>
              )}
              {invoice.pricing?.igst > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Integrated GST (IGST):</span>
                  <span>{formatCurrency(invoice.pricing?.igst)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery & Handling:</span>
                <span>{invoice.pricing?.deliveryCharge > 0 ? formatCurrency(invoice.pricing?.deliveryCharge) : 'FREE'}</span>
              </div>
              <div className="border-t-2 border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Grand Total (INR):</span>
                <span className="text-brand-700">{formatCurrency(invoice.pricing?.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer note and pharmacist stamp */}
          <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-500">
            <div className="space-y-1 max-w-sm">
              <p className="font-semibold text-slate-700">Terms & Conditions:</p>
              <p>• Goods once sold can be returned only in original unopened condition within 7 days.</p>
              <p>• Storage: Please follow the manufacturer temperature guidance printed on package.</p>
              <p>• Schedule H medicines dispensed against registered doctor's prescription.</p>
            </div>
            <div className="text-center space-y-8">
              <p className="text-slate-400">For {invoice.pharmacy?.name}</p>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Authorized Signatory / Pharmacist Stamp
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
