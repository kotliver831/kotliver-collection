import React from 'react';
import { Order } from '../../types';
import { CheckCircle, Package, Phone, Calendar, ArrowRight, Printer, X } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  currency?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  currency = '৳'
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 ring-8 ring-emerald-50">
            <CheckCircle className="w-10 h-10 text-[#176B4D]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Order Confirmed!
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900 mt-1">
            Thank you, {order.customerName.split(' ')[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-sm">
            Your Cash on Delivery order has been successfully recorded. Our team will verify and dispatch your parcel promptly.
          </p>

          {/* Order Number Box */}
          <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-200 w-full flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Order Tracking ID
              </span>
              <span className="block text-base sm:text-lg font-bold font-mono text-[#176B4D]">
                {order.orderNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Total to Pay (COD)
              </span>
              <span className="block text-base sm:text-lg font-extrabold text-gray-900">
                {currency}{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="w-full mt-4 text-left p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold">Recipient Phone:</span>
              <span className="font-mono">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold">Delivery Address:</span>
              <span className="text-right max-w-[200px] truncate">{order.deliveryAddress}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold">Items Count:</span>
              <span>{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.orderNumber);
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-[#115039] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Package className="w-4 h-4 text-[#D4A72C]" />
              <span>Track This Order</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
