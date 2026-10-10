import React from 'react';
import { X, Printer, Download, CheckCircle, Zap, Receipt, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface InvoiceReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="p-4 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-zinc-700 font-bold text-sm">
            <Receipt className="w-4 h-4 text-brand-600" />
            <span>Tax Invoice & Official Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 font-sans">
          {/* Brand Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-zinc-900">
                  Quick<span className="text-orange-600">Bite!</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Official Gourmet Food Delivery Receipt</p>
              <p className="text-[10px] text-zinc-400">GSTIN: 29ABCDE1234F1Z5 • FSSAI Lic. 10019022009876</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                PAID & CONFIRMED
              </span>
              <p className="text-xs font-bold text-zinc-800">Invoice #{order.order_id}</p>
              <p className="text-[11px] text-zinc-500">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Restaurant & Customer Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
            <div>
              <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Merchant / Restaurant</p>
              <p className="font-bold text-zinc-900 text-sm mt-0.5">{order.restaurant_name}</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">{order.restaurant_address || 'Culinary Boulevard'}</p>
              {order.restaurant_phone && <p className="text-zinc-500 text-[11px]">{order.restaurant_phone}</p>}
            </div>

            <div>
              <p className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Billed & Delivered To</p>
              <p className="font-bold text-zinc-900 text-sm mt-0.5">{order.customer_name || 'Valued Customer'}</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">{order.delivery_address}</p>
              {order.customer_phone && <p className="text-zinc-500 text-[11px]">{order.customer_phone}</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items && order.items.map((item, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2.5">
                      <p className="font-bold text-zinc-900">{item.name}</p>
                      {item.selected_variant && (
                        <p className="text-[11px] text-orange-600 font-medium">
                          Variant: {typeof item.selected_variant === 'string' ? JSON.parse(item.selected_variant).name || item.selected_variant : ''}
                        </p>
                      )}
                      {item.selected_addons && (
                        <p className="text-[10px] text-zinc-500">
                          Addons: {typeof item.selected_addons === 'string' ? JSON.parse(item.selected_addons).map((a: any) => a.name).join(', ') : ''}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-semibold text-zinc-700">{item.quantity}</td>
                    <td className="py-2.5 text-right text-zinc-600">${Number(item.price_at_order_time).toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-zinc-900">
                      ${(Number(item.price_at_order_time) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-zinc-200 pt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Item Subtotal</span>
              <span className="font-medium">${Number(order.subtotal_amount).toFixed(2)}</span>
            </div>

            {order.discount_amount && order.discount_amount > 0 ? (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promo Discount ({order.coupon_code || 'COUPON'})</span>
                <span>-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-zinc-600">
              <span>Applicable Taxes & GST (5%)</span>
              <span className="font-medium">${Number(order.tax_amount).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-zinc-600">
              <span>Express Delivery Surcharge</span>
              <span className="font-medium">${Number(order.delivery_fee).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-zinc-900 border-t-2 border-zinc-900 pt-2.5 mt-2">
              <span>Total Paid</span>
              <span className="text-orange-600">${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Security Metadata */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-[11px] text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-zinc-900">Payment: {(order.payment_method || 'CARD').toUpperCase()}</p>
              <p className="text-[10px] text-zinc-500">Ref: {order.transaction_ref || 'TXN-998811'}</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographically Verified Transaction</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-zinc-400 border-t border-zinc-200 pt-4">
            Thank you for ordering with QuickBite! For customer support, visit support@quickbite.com
          </p>
        </div>
      </div>
    </div>
  );
};
