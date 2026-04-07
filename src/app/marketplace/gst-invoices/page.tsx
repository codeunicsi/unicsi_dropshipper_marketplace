"use client";

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, FileText } from "lucide-react";

type InvoiceItem = {
  description: string;
  hsnSac: string;
  qty: number;
  rate: number;
  taxPercent: number;
};

const invoiceItems: InvoiceItem[] = [
  {
    description: "Wireless Bluetooth Earbuds",
    hsnSac: "8518",
    qty: 2,
    rate: 1499,
    taxPercent: 18,
  },
  {
    description: "Mobile Fast Charger 33W",
    hsnSac: "8504",
    qty: 1,
    rate: 899,
    taxPercent: 18,
  },
];

const invoiceDetails = {
  invoiceNo: "GST-INV-2026-001",
  invoiceDate: "07 Apr 2026",
  orderId: "ORD-984512",
  placeOfSupply: "Maharashtra (27)",
  seller: {
    name: "UNICSI Marketplace Pvt. Ltd.",
    gstin: "27ABCDE1234F1Z5",
    address: "2nd Floor, Business Plaza, Mumbai, Maharashtra - 400001",
    email: "billing@unicsi.com",
  },
  buyer: {
    name: "Rohan Enterprises",
    gstin: "29AAACR5055K1ZN",
    address: "No. 45, MG Road, Bengaluru, Karnataka - 560001",
    email: "accounts@rohanenterprises.in",
  },
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export default function GSTInvoicesPage() {
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const totals = useMemo(() => {
    const taxableValue = invoiceItems.reduce(
      (sum, item) => sum + item.qty * item.rate,
      0,
    );
    const totalTax = invoiceItems.reduce(
      (sum, item) => sum + (item.qty * item.rate * item.taxPercent) / 100,
      0,
    );
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    return {
      taxableValue,
      cgst,
      sgst,
      grandTotal: taxableValue + totalTax,
    };
  }, []);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`${invoiceDetails.invoiceNo}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">GST Invoices /</p>
          <h1 className="text-2xl font-bold text-black">GST Invoice</h1>
        </div>
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Generating PDF..." : "Download GST Invoice (PDF)"}
        </button>
      </div>

      <div
        ref={invoiceRef}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-start justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              <FileText className="h-3.5 w-3.5" />
              Tax Invoice
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {invoiceDetails.seller.name}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{invoiceDetails.seller.address}</p>
            <p className="text-sm text-gray-600">GSTIN: {invoiceDetails.seller.gstin}</p>
            <p className="text-sm text-gray-600">{invoiceDetails.seller.email}</p>
          </div>

          <div className="min-w-[220px] rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="mb-1">
              <span className="font-semibold">Invoice No:</span>{" "}
              {invoiceDetails.invoiceNo}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Invoice Date:</span>{" "}
              {invoiceDetails.invoiceDate}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Order ID:</span> {invoiceDetails.orderId}
            </p>
            <p>
              <span className="font-semibold">Place of Supply:</span>{" "}
              {invoiceDetails.placeOfSupply}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Bill To
            </p>
            <p className="font-semibold text-gray-900">{invoiceDetails.buyer.name}</p>
            <p className="text-sm text-gray-600">{invoiceDetails.buyer.address}</p>
            <p className="text-sm text-gray-600">GSTIN: {invoiceDetails.buyer.gstin}</p>
            <p className="text-sm text-gray-600">{invoiceDetails.buyer.email}</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ship From
            </p>
            <p className="font-semibold text-gray-900">{invoiceDetails.seller.name}</p>
            <p className="text-sm text-gray-600">{invoiceDetails.seller.address}</p>
            <p className="text-sm text-gray-600">GSTIN: {invoiceDetails.seller.gstin}</p>
            <p className="text-sm text-gray-600">{invoiceDetails.seller.email}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">HSN/SAC</th>
                <th className="px-4 py-3 text-right font-semibold">Qty</th>
                <th className="px-4 py-3 text-right font-semibold">Rate</th>
                <th className="px-4 py-3 text-right font-semibold">Tax %</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => {
                const amount = item.qty * item.rate;
                return (
                  <tr key={`${item.description}-${item.hsnSac}`} className="border-t border-gray-200">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{item.hsnSac}</td>
                    <td className="px-4 py-3 text-right">{item.qty}</td>
                    <td className="px-4 py-3 text-right">{currency(item.rate)}</td>
                    <td className="px-4 py-3 text-right">{item.taxPercent}%</td>
                    <td className="px-4 py-3 text-right font-medium">{currency(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto w-full max-w-md rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between border-b border-gray-200 py-2 text-sm">
            <span className="text-gray-600">Taxable Value</span>
            <span className="font-medium">{currency(totals.taxableValue)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 py-2 text-sm">
            <span className="text-gray-600">CGST (9%)</span>
            <span className="font-medium">{currency(totals.cgst)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 py-2 text-sm">
            <span className="text-gray-600">SGST (9%)</span>
            <span className="font-medium">{currency(totals.sgst)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 text-base font-bold">
            <span>Grand Total</span>
            <span>{currency(totals.grandTotal)}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          This is a computer-generated GST invoice and does not require a physical signature.
        </p>
      </div>
    </div>
  );
}
