import React, { useState } from 'react';
import { CartItem, Order, SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Phone, 
  MapPin, 
  User, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  settings: SiteSettings;
  currency?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  settings,
  currency = '৳'
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'Inside City (৳60)' | 'Outside City (৳120)'>(
    'Inside City (৳60)'
  );
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const deliveryFee =
    deliveryZone === 'Inside City (৳60)'
      ? settings.insideCityDeliveryFee || 60
      : settings.outsideCityDeliveryFee || 120;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please provide your full recipient name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid active phone number for parcel confirmation.');
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) {
      setErrorMessage('Please enter your complete physical delivery address (House, Road, Area).');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map to Order schema
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        deliveryZone,
        deliveryFee,
        orderNotes: orderNotes.trim() || undefined,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0],
          sku: item.product.sku
        })),
        subtotal,
        total,
        paymentMethod: 'Cash on Delivery' as const,
        paymentStatus: 'Pending' as const,
        status: 'Pending' as const
      };

      const createdOrder = storageService.createOrder(orderPayload);
      setIsSubmitting(false);
      onOrderSuccess(createdOrder);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0A2F22] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#D4A72C] uppercase block">
              Kotliver Collection Direct Order
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-brand">
              Cash on Delivery Checkout
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <User className="w-4 h-4 text-emerald-800" />
              <span>Recipient & Delivery Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Active Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01700123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] text-sm pl-9"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Delivery agent will call this number prior to arrival.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address (Optional for invoice)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Physical Delivery Address *
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House No, Road, Flat/Floor, Sector or Area, City"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] text-sm"
              />
            </div>

            {/* Delivery Zone Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Delivery Location Zone
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('Inside City (৳60)')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    deliveryZone === 'Inside City (৳60)'
                      ? 'border-[#176B4D] bg-emerald-50/70 ring-1 ring-[#176B4D]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold text-gray-900">
                      Inside City
                    </span>
                    <span className="text-[11px] text-gray-500">24-48 Hours</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800">৳60</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryZone('Outside City (৳120)')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    deliveryZone === 'Outside City (৳120)'
                      ? 'border-[#176B4D] bg-emerald-50/70 ring-1 ring-[#176B4D]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold text-gray-900">
                      Outside City
                    </span>
                    <span className="text-[11px] text-gray-500">48-72 Hours</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800">৳120</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Order Notes / Special Instructions (Optional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Call after 3 PM or leave at front desk"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] text-sm"
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-800" />
              <span>Payment Option</span>
            </h3>

            {/* Cash on Delivery option (Active) */}
            <div className="p-3.5 rounded-xl border-2 border-[#176B4D] bg-emerald-50/50 flex items-start gap-3">
              <input
                type="radio"
                checked
                readOnly
                className="mt-1 text-emerald-800 focus:ring-emerald-800"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#176B4D] text-white">
                    Verified Active
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Inspect your parcel and pay cash directly to the delivery rider at your doorstep. Zero online payment risk!
                </p>
              </div>
            </div>

            {/* Future Payment Integrations Architecture Notice */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
              <span className="font-semibold text-gray-800 block text-[11px] uppercase tracking-wider">
                Future Payment Gateways (bKash, Nagad, Cards)
              </span>
              <p className="text-[11px] leading-relaxed text-gray-500">
                Online gateway endpoints are in preparation for verified bKash Merchant API and SSLCommerz / Nagad. To protect shoppers, real online transactions are only enabled after live merchant credential verification.
              </p>
            </div>
          </div>

          {/* Order Summary & Total */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Items Total ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
              <span>{currency}{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Delivery Fee ({deliveryZone.includes('Inside') ? 'Inside City' : 'Outside City'})</span>
              <span>{currency}{deliveryFee}</span>
            </div>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900">Total Payable at Doorstep</span>
              <span className="text-xl font-extrabold text-[#176B4D] font-serif-brand">
                {currency}{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-white bg-[#176B4D] hover:bg-[#115039] shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Placing Your Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#D4A72C]" />
                <span>Confirm Order via Cash on Delivery</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
