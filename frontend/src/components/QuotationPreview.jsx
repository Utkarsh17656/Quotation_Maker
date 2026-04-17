import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { format, parseISO } from 'date-fns';

export default function QuotationPreview({ data, client }) {
  const { user } = useAuthStore();

  const businessName = user?.company_name || user?.username || 'Your Business';
  const businessAddress = user?.company_address || '';
  const businessGst = user?.gst_number || '';
  
  const clientName = client?.name || 'Client Name';
  const clientAddress = client?.address || '';
  const clientEmail = client?.email || '';

  return (
    <div className="bg-white mx-auto shadow-sm" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Inter, sans-serif' }} id="quotation-print-area">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{businessName}</h1>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{businessAddress}</p>
          {businessGst && <p className="text-sm text-gray-600 mt-1">GSTIN: {businessGst}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-light text-brand-600 mb-4 uppercase tracking-widest">Quotation</h2>
          <table className="ml-auto text-sm">
            <tbody>
              <tr>
                <td className="pr-4 font-semibold text-gray-700 text-right">Quote No:</td>
                <td className="text-gray-900 font-mono">{data.quotation_number || '#00000'}</td>
              </tr>
              <tr>
                <td className="pr-4 font-semibold text-gray-700 text-right">Date:</td>
                <td className="text-gray-900">{data.date ? format(parseISO(data.date), 'dd MMM yyyy') : '-'}</td>
              </tr>
              {data.expiry_date && (
                <tr>
                  <td className="pr-4 font-semibold text-gray-700 text-right">Valid Until:</td>
                  <td className="text-gray-900">{format(parseISO(data.expiry_date), 'dd MMM yyyy')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quotation For</h3>
        <p className="text-lg font-semibold text-gray-900">{clientName}</p>
        <p className="text-sm text-gray-600 mb-1">{clientEmail}</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{clientAddress}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm text-left">
        <thead>
          <tr className="border-b-2 border-gray-900 text-gray-900 flex-row">
            <th className="py-2 pr-2 w-1/2">Description</th>
            <th className="py-2 px-2 text-center w-24">Quantity</th>
            <th className="py-2 px-2 text-right w-32">Unit Price</th>
            <th className="py-2 px-2 text-center w-24">Tax</th>
            <th className="py-2 pl-2 text-right w-32">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.items.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-8 text-center text-gray-400 italic">No items added to quotation.</td>
            </tr>
          ) : (
            data.items.map((item, index) => {
              const qty = parseFloat(item.quantity) || 0;
              const price = parseFloat(item.unit_price) || 0;
              const discRate = parseFloat(item.discount_percent) || 0;
              const discAmt = parseFloat(item.discount_amount) || 0;
              const taxRate = parseFloat(item.tax_percent) || 0;

              const lineTotalPre = qty * price;
              let lineDiscount = 0;
              if (discRate > 0) lineDiscount = lineTotalPre * (discRate / 100);
              else lineDiscount = discAmt;
              
              const afterDisc = lineTotalPre - lineDiscount;
              const lineTax = afterDisc * (taxRate / 100);
              const finalTotal = afterDisc + lineTax;

              return (
                <tr key={index}>
                  <td className="py-4 pr-2">
                    <p className="font-semibold text-gray-900">{item.name || 'Item Name'}</p>
                    {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                    {lineDiscount > 0 && <p className="text-brand-600 text-xs mt-1">Includes discount</p>}
                  </td>
                  <td className="py-4 px-2 text-center">{qty}</td>
                  <td className="py-4 px-2 text-right">₹{price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="py-4 px-2 text-center">{taxRate}%</td>
                  <td className="py-4 pl-2 text-right font-semibold text-gray-900">₹{finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-1/3">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 pr-4 text-gray-600">Subtotal</td>
                <td className="py-2 text-right text-gray-900">₹{parseFloat(data.subtotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              {parseFloat(data.total_discount) > 0 && (
                <tr>
                  <td className="py-2 pr-4 text-gray-600">Discount</td>
                  <td className="py-2 text-right text-red-600">-₹{parseFloat(data.total_discount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              )}
              <tr>
                <td className="py-2 pr-4 text-gray-600">Tax</td>
                <td className="py-2 text-right text-gray-900">₹{parseFloat(data.total_tax).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="border-t-2 border-gray-900">
                <td className="py-3 pr-4 font-bold text-gray-900 uppercase">Total</td>
                <td className="py-3 text-right font-bold text-gray-900 text-lg">₹{parseFloat(data.grand_total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Notes */}
      {(data.notes || data.terms) && (
        <div className="border-t border-gray-200 mt-12 pt-8 text-sm">
          {data.notes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-1">Notes</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
          {data.terms && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Terms & Conditions</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{data.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
