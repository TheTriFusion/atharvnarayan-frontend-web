import { useRef } from 'react';
import Button from './Button';

const Receipt = ({ sale, companyName, onClose, onPrint }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div ref={receiptRef} className="space-y-4">
        <div className="text-center border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">{companyName || 'Retail Shop'}</h1>
          <p className="text-gray-600 mt-2">Sales Receipt</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Receipt No:</p>
            <p className="font-semibold">{sale.id}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">
              {new Date(sale.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="border-t border-b border-gray-300 py-4">
          <h3 className="font-semibold text-gray-800 mb-2">Customer Details:</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">Name:</span> <span className="font-semibold">{sale.customerName}</span></p>
            {sale.customerPhone && (
              <p><span className="text-gray-600">Phone:</span> <span className="font-semibold">{sale.customerPhone}</span></p>
            )}
          </div>
        </div>

        <div>
          <span className={`px-3 py-1 rounded text-sm font-medium ${sale.saleType === 'wholesale'
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-teal-100 text-teal-800'
            }`}>
            {sale.saleType?.charAt(0).toUpperCase() + sale.saleType?.slice(1)} Sale
          </span>
        </div>

        <div className="border-t border-b border-gray-300 py-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 text-sm font-semibold text-gray-700">Item</th>
                <th className="text-center py-2 text-sm font-semibold text-gray-700">Qty</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 text-sm">{item.itemName}</td>
                  <td className="py-2 text-sm text-center">{item.quantity}</td>
                  <td className="py-2 text-sm text-right">₹{item.unitPrice?.toFixed(2)}</td>
                  <td className="py-2 text-sm text-right font-semibold">₹{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-400 pt-2">
              <span>Total Amount:</span>
              <span>₹{sale.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-2">For inquiries, please contact us.</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6 print:hidden">
        <Button variant="primary" onClick={handlePrint} className="flex-1">
          Print Receipt
        </Button>
        {onClose && (
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;

