import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  AlertCircle,
  Phone
} from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  currency?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  currency = '৳'
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const performSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFoundOrders([]);
      setHasSearched(false);
      return;
    }

    const allOrders = storageService.getOrders();
    const matched = allOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
    );

    setFoundOrders(matched);
    setHasSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const statusSteps: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered'
  ];

  const getStatusStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#0A2F22] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-[#D4A72C] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#D4A72C] uppercase block">
                Order Tracking
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif-brand">
                Track Your Parcel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 sm:p-6 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order Tracking ID (e.g. KC-2026-9140) or Phone Number"
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] text-sm bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#176B4D] hover:bg-[#115039] cursor-pointer shrink-0 transition-colors"
            >
              Search
            </button>
          </form>
          <span className="text-[11px] text-gray-400 mt-1.5 block">
            Tip: You can enter the phone number you used during checkout.
          </span>
        </div>

        {/* Results Area */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {hasSearched && foundOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h4 className="font-bold text-gray-800">No Orders Found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                We couldn't find any orders matching "{searchQuery}". Please verify your Order ID or phone number.
              </p>
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-6 text-gray-400">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                Enter your order number or recipient phone number above to check real-time progress.
              </p>
            </div>
          )}

          {foundOrders.map((order) => {
            const stepIdx = getStatusStepIndex(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4"
              >
                {/* Order Top Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase font-semibold block">
                      Order ID
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-base">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold block">
                      Placed On
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="w-full sm:w-auto">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        isCancelled
                          ? 'bg-red-100 text-red-700'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-100 text-[#176B4D]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {order.status}
                    </span>
                  </div>
                </div>

                {/* Progress Steps (if not cancelled) */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {statusSteps.map((step, idx) => {
                        const isDone = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-[#176B4D] text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1 font-semibold leading-tight ${
                                isDone ? 'text-emerald-900' : 'text-gray-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>This order has been cancelled. For inquiries, please contact Kotliver support.</span>
                  </div>
                )}

                {/* Items & Address */}
                <div className="text-xs text-gray-600 space-y-2 pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Delivery to:</strong> {order.customerName} ({order.customerPhone}), {order.deliveryAddress}
                    </span>
                  </div>

                  <div>
                    <strong className="block text-gray-700 mb-1">Ordered Items:</strong>
                    <div className="space-y-1.5 pl-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-gray-700">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-semibold">
                            {currency}{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 font-bold text-gray-900 text-sm border-t border-gray-100">
                    <span>Payable on Delivery:</span>
                    <span className="text-[#176B4D] font-serif-brand text-base">
                      {currency}{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status Timeline History */}
                {order.statusTimeline && order.statusTimeline.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-gray-700 block text-[10px] uppercase">
                      Timeline Updates
                    </span>
                    {order.statusTimeline.map((tl, i) => (
                      <div key={i} className="flex items-start gap-2 text-gray-600 text-[11px]">
                        <Clock className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>{tl.status}</strong>: {tl.note || 'Status updated'}{' '}
                          <span className="text-gray-400">({new Date(tl.timestamp).toLocaleTimeString()})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
