import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Truck, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Building
} from 'lucide-react';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/formatters';

export default function Checkout({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || 'Gurugram',
    state: user?.address?.state || 'Haryana',
    postalCode: user?.address?.postalCode || '122001',
    landmark: user?.address?.landmark || '',
    deliveryInstructions: ''
  });

  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationData, setValidationData] = useState(null);

  const hasRx = cart?.hasPrescriptionRequiredItems;

  useEffect(() => {
    fetchCart();
    fetchUserPrescriptions();
  }, []);

  const fetchUserPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      const list = res.data.prescriptions || [];
      setPrescriptions(list);
      // Preselect the latest approved or pending one
      if (list.length > 0) {
        setSelectedPrescriptionId(list[0]._id);
      }
    } catch (err) {
      console.error('Error fetching prescriptions', err);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      setError('Please provide a complete delivery street, city and postal code.');
      return;
    }

    if (!customerDetails.phone) {
      setError('Please enter a valid phone number for delivery confirmation.');
      return;
    }

    if (hasRx && !selectedPrescriptionId) {
      setError('A valid doctor prescription is legally required for prescription items in your cart. Please select or upload one.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/orders', {
        customerDetails,
        deliveryAddress,
        paymentMethod,
        prescriptionId: selectedPrescriptionId || null
      });

      // Clear cart locally and navigate
      await fetchCart();
      navigate(`/order-success/${res.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please check stock and details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Pharmacy Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete patient address, prescription attachment, and payment preferences.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Sections */}
        <div className="lg:col-span-8 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer Contact Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              <h2 className="text-sm font-bold text-slate-900">Patient & Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number (For OTP/Delivery) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <h2 className="text-sm font-bold text-slate-900">Doorstep Delivery Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Street Address / House No / Apartment *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Tower B, Green Valley Apartments"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress.state}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Postal / PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="122001"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near City Hospital / Metro Pillar 42"
                    value={deliveryAddress.landmark}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="Ring bell twice / leave at reception"
                    value={deliveryAddress.deliveryInstructions}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Prescription Verification (if applicable) */}
          <div className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 ${
            hasRx ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-white font-bold flex items-center justify-center text-xs ${
                  hasRx ? 'bg-amber-600' : 'bg-slate-400'
                }`}>3</span>
                <h2 className="text-sm font-bold text-slate-900">
                  Doctor's Prescription Verification
                </h2>
              </div>
              {hasRx ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Mandatory For This Order
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                  Not Required (All Items OTC)
                </span>
              )}
            </div>

            {hasRx && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Your cart contains Schedule H medicines requiring a registered practitioner's prescription. Select an uploaded prescription or upload a new one now.
                </p>

                {prescriptions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-bold text-slate-700 text-[11px]">Select from your uploaded prescriptions:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {prescriptions.map((rx) => (
                        <label
                          key={rx._id}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            selectedPrescriptionId === rx._id
                              ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedRx"
                            checked={selectedPrescriptionId === rx._id}
                            onChange={() => setSelectedPrescriptionId(rx._id)}
                            className="mt-1 text-brand-600 focus:ring-brand-500"
                          />
                          <div className="space-y-1 overflow-hidden">
                            <p className="font-bold text-slate-900 truncate">{rx.originalFileName}</p>
                            <p className="text-[10px] text-slate-500">Doctor: {rx.doctorName || 'Doctor Verified'}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              rx.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {rx.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
                    <p className="font-bold text-amber-900 text-xs">No Prescriptions On File</p>
                    <p className="text-[11px] text-amber-700">Please upload your doctor's prescription slip before completing checkout.</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPrescriptionModal();
                      // Poll/refresh on close
                      setTimeout(fetchUserPrescriptions, 4000);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload New Prescription</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Payment Options */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">4</span>
              <h2 className="text-sm font-bold text-slate-900">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                paymentMethod === 'cash_on_delivery'
                  ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="mt-4">
                  <p className="font-bold text-slate-900">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay in cash or UPI at your doorstep</p>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                paymentMethod === 'upi'
                  ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <QrCode className="w-5 h-5 text-brand-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="mt-4">
                  <p className="font-bold text-slate-900">UPI Instant</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm, BHIM</p>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                paymentMethod === 'card'
                  ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="mt-4">
                  <p className="font-bold text-slate-900">Credit / Debit Card</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay</p>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right: Order Summary Sticky Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-28">
          
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({cart?.items?.length || 0} items)
          </h3>

          {/* Mini items list */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {cart?.items?.map((item) => (
              <div key={item.product?._id} className="pt-2 flex justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 line-clamp-1">{item.product?.name}</p>
                  <p className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatCurrency(item.product?.sellingPrice)}</p>
                </div>
                <span className="font-bold text-slate-800">{formatCurrency(item.itemTotal)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(cart?.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST (6%):</span>
              <span>{formatCurrency(cart?.taxTotal / 2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST (6%):</span>
              <span>{formatCurrency(cart?.taxTotal / 2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span>{cart?.deliveryCharge === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(cart?.deliveryCharge)}</span>
            </div>

            <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline font-black text-slate-900 text-sm">
              <span>Total Payable:</span>
              <span className="text-xl text-brand-700">{formatCurrency(cart?.grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (hasRx && !selectedPrescriptionId)}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-600/25 active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Executing FEFO Batch Allocation...</span>
              </>
            ) : (
              <span>Confirm & Place Order</span>
            )}
          </button>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[10px] text-slate-500">
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pharmacy Dispensing Safeguard</span>
            </p>
            <p>
              Your order items will be allocated from qualified non-expired batches according to FEFO algorithm. An itemized GST invoice will be generated.
            </p>
          </div>

        </div>

      </form>

    </div>
  );
}
