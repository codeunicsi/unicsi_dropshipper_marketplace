"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Database,
  FileText,
  IndianRupee,
  PackageCheck,
  ShieldCheck,
  Truck,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MOQ = 10;
const DEFAULT_MARGIN = 8;

const ORDER_STEPS = [
  "Customer visits a product page",
  "Customer enters quantity (minimum 10 pieces)",
  "Customer fills checkout form with name, phone, and delivery address",
  "System calculates total order amount including shipping",
  "Order is created with status Pending Payment",
  "Customer transfers payment via UPI or bank transfer",
  "Customer uploads payment screenshot and transaction ID",
  "Admin verifies payment in the bank account",
  "Order status is updated to Confirmed",
  "Supplier prepares the product for dispatch",
  "Platform books courier pickup from supplier location",
  "Tracking number is generated and shared with customer",
  "Order is delivered to the customer",
];

const MODULES = [
  {
    title: "Customer System",
    note: "Browse products and place bulk orders",
    icon: UserRound,
  },
  {
    title: "Supplier System",
    note: "Upload products and manage stock",
    icon: Building2,
  },
  {
    title: "Admin System",
    note: "Verify payment and generate invoices",
    icon: ShieldCheck,
  },
  {
    title: "Order Management",
    note: "Create order and update status",
    icon: FileText,
  },
  {
    title: "Shipping System",
    note: "Book courier and track shipment",
    icon: Truck,
  },
];

export default function BulkOrderPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "N/A";
  const productName =
    searchParams.get("productName") || "Selected Marketplace Product";
  const sellingPriceInput = Number(searchParams.get("sellingPrice") || 100);

  const [quantity, setQuantity] = useState(MOQ);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);

  const pricing = useMemo(() => {
    const sellingPrice =
      Number.isFinite(sellingPriceInput) && sellingPriceInput > 0
        ? sellingPriceInput
        : 100;
    const supplierPrice = Math.max(1, sellingPrice - DEFAULT_MARGIN);
    const platformMargin = sellingPrice - supplierPrice;
    const shippingCharge = 120 + quantity * 2;
    const totalAmount = sellingPrice * quantity + shippingCharge;
    const supplierPayout = supplierPrice * quantity;
    const platformProfit = platformMargin * quantity;

    return {
      sellingPrice,
      supplierPrice,
      platformMargin,
      shippingCharge,
      totalAmount,
      supplierPayout,
      platformProfit,
    };
  }, [quantity, sellingPriceInput]);

  const currentStep = adminVerified
    ? 13
    : paymentSubmitted
      ? 8
      : orderCreated
        ? 6
        : 4;
  const isQuantityValid = quantity >= MOQ;
  const canCreateOrder =
    isQuantityValid &&
    customerName.trim() &&
    phone.trim() &&
    deliveryAddress.trim();
  const canSubmitPayment =
    orderCreated && transactionId.trim() && Boolean(paymentScreenshot);

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-cyan-100 bg-linear-to-r from-cyan-700 to-teal-600 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-wide text-cyan-100">
            Unicsi Bulk Order System
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Create Bulk Order
          </h1>
          <p className="mt-2 max-w-3xl text-cyan-50">
            MOQ 10 pieces, payment in platform account, shipping handled by
            platform, and invoice generated after verification.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-cyan-100">Product ID</p>
              <p className="font-semibold">{productId}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-cyan-100">Product Name</p>
              <p className="font-semibold">{productName}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-cyan-100">Selling Price</p>
              <p className="flex items-center gap-0.5 font-semibold">
                <IndianRupee className="w-4 h-4" strokeWidth={3} />
                {pricing.sellingPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>1) Checkout and Order Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (MOQ {MOQ})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={MOQ}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || MOQ)}
                  />
                  {!isQuantityValid && (
                    <p className="text-xs font-medium text-red-600">
                      Minimum quantity is {MOQ}.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House, street, city, state, pincode"
                  rows={4}
                />
              </div>

              <Button
                className="w-full bg-cyan-700 text-white hover:bg-cyan-800"
                disabled={!canCreateOrder}
                onClick={() => {
                  setOrderCreated(true);
                  setPaymentSubmitted(false);
                  setAdminVerified(false);
                }}
              >
                Create Order (Status: Pending Payment)
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle>2) Payment Proof Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="UPI / bank transfer reference"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentScreenshot">Payment Screenshot</Label>
                <Input
                  id="paymentScreenshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPaymentScreenshot(e.target.files?.[0] || null)
                  }
                />
                <p className="text-xs text-slate-500">
                  Upload screenshot + transaction ID for admin verification.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  disabled={!canSubmitPayment}
                  onClick={() => {
                    setPaymentSubmitted(true);
                    setAdminVerified(false);
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Proof
                </Button>
                <Button
                  disabled={!paymentSubmitted}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setAdminVerified(true)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Admin Verified
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">
                Total Amount (Customer Pays)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center text-2xl font-bold text-cyan-700">
                <IndianRupee className="w-5 h-5" strokeWidth={3} />
                {pricing.totalAmount.toLocaleString()}
              </p>
              <p className="flex items-center text-sm text-slate-500">
                Product: <IndianRupee className="w-3 h-3 ml-1" />
                {(pricing.sellingPrice * quantity).toLocaleString()} + Shipping:
                <IndianRupee className="w-3 h-3 ml-1" />
                {pricing.shippingCharge.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Supplier Settlement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-0.5 text-2xl font-bold text-slate-900">
                <IndianRupee className="w-5 h-5" strokeWidth={3} />{" "}
                {pricing.supplierPayout.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">
                Weekly payout cycle after delivery confirmation.
              </p>
            </CardContent>
          </Card>
          <Card className="gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Platform Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-0.5 text-2xl font-bold text-emerald-700">
                <IndianRupee className="w-5 h-5" strokeWidth={3} />{" "}
                {pricing.platformProfit.toLocaleString()}
              </p>
              <p className="flex items-center text-sm text-slate-500">
                Margin per piece: <IndianRupee className="w-3 h-3 ml-1" />{" "}
                {pricing.platformMargin.toLocaleString()} (
                {pricing.supplierPrice} + margin model)
              </p>
            </CardContent>
          </Card>
        </section>

        {/* <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Operational Flow (Step by Step)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ORDER_STEPS.map((step, index) => {
                const isDone = index + 1 <= currentStep;
                return (
                  <div
                    key={step}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      isDone
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Main System Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MODULES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="rounded-md bg-cyan-50 p-2 text-cyan-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600">{item.note}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section> */}

        {/* <section className="mt-6 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-700" />
                Database Structure Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SchemaBlock
                title="Users"
                fields={["user_id", "name", "phone", "email", "role", "address"]}
              />
              <SchemaBlock
                title="Suppliers"
                fields={[
                  "supplier_id",
                  "business_name",
                  "contact_person",
                  "pickup_address",
                  "bank_details",
                ]}
              />
              <SchemaBlock
                title="Products"
                fields={[
                  "product_id",
                  "supplier_id",
                  "product_name",
                  "supplier_price",
                  "platform_margin",
                  "selling_price",
                  "stock",
                  "weight",
                ]}
              />
              <SchemaBlock
                title="Orders"
                fields={[
                  "order_id",
                  "customer_id",
                  "product_id",
                  "supplier_id",
                  "quantity",
                  "total_amount",
                  "order_status",
                  "payment_status",
                ]}
              />
              <SchemaBlock
                title="Payments"
                fields={[
                  "payment_id",
                  "order_id",
                  "transaction_id",
                  "payment_screenshot",
                  "verification_status",
                ]}
              />
              <SchemaBlock
                title="Shipping"
                fields={[
                  "shipment_id",
                  "order_id",
                  "courier_name",
                  "tracking_number",
                  "shipping_status",
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-cyan-700" />
                Profit Model Example
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>Supplier Price = INR 90</p>
                <p>Platform Margin = INR 10</p>
                <p>Selling Price = INR 100</p>
                <p className="mt-2 font-semibold">If customer orders 100 units:</p>
                <p>Total Sale = INR 10,000</p>
                <p>Supplier Payment = INR 9,000</p>
                <p>Platform Profit = INR 1,000</p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
                <p className="font-semibold">Settlement Logic</p>
                <p className="mt-2">1. Customer pays to platform account.</p>
                <p>2. Platform deducts margin.</p>
                <p>3. Remaining amount is paid to supplier.</p>
                <p>4. Supplier payouts can run weekly.</p>
              </div>
            </CardContent>
          </Card>
        </section> */}

        {/* <section className="mt-6">
          <Card>
            <CardContent className="flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <PackageCheck className="h-5 w-5 text-cyan-700" />
                <span>
                  Current Status:{" "}
                  <strong>
                    {adminVerified
                      ? "Confirmed - Ready for Supplier Dispatch"
                      : paymentSubmitted
                        ? "Payment Under Admin Verification"
                        : orderCreated
                          ? "Pending Payment"
                          : "Draft / Fill Form"}
                  </strong>
                </span>
              </div>
              <Button className="bg-cyan-700 text-white hover:bg-cyan-800">
                Generate Platform Invoice
              </Button>
            </CardContent>
          </Card>
        </section> */}
      </div>
    </main>
  );
}

function SchemaBlock({ title, fields }: { title: string; fields: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">{title} Table</h3>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {fields.map((field) => (
          <li key={field}>- {field}</li>
        ))}
      </ul>
    </div>
  );
}
