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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrder } from "@/hooks/useOrder";
import { useAdminBankDetails } from "@/hooks/useAdminBankDetail";

const MOQ = 10;
const DEFAULT_MARGIN = 8;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LEGACY_PRODUCT_ID_MAP: Record<string, string> = {
  "1": "8f7b8d8f-3c2f-4d7a-9c2a-4c8f9d24a101",
  "2": "2c3de35c-7e1e-4b0c-b82f-3e5957d9b202",
  "3": "b9b64e2e-2c94-4e31-8f09-12e41b16c303",
  "4": "4d90f6d3-c8f9-45f8-a9bd-7dd8f4c4d404",
};

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
  const { createBulkOrder } = useOrder();
  const searchParams = useSearchParams();
  const rawProductId =
    searchParams.get("productId") || searchParams.get("id") || "";
  const productId =
    LEGACY_PRODUCT_ID_MAP[rawProductId.trim()] || rawProductId.trim();
  const productName =
    searchParams.get("productName") || "Selected Marketplace Product";
  const productIdDisplay = productId || "N/A";
  const isValidProductId = UUID_REGEX.test(productId);
  const {
    data: adminBankDetailsResponse,
    isLoading: isAdminBankLoading,
    error: adminBankError,
  } = useAdminBankDetails();
  const sellingPriceInput = Number(searchParams.get("sellingPrice") || 100);

  const [quantity, setQuantity] = useState(MOQ);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentWindowCompleted, setPaymentWindowCompleted] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOrderPlacedModalOpen, setIsOrderPlacedModalOpen] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderPayload, setOrderPayload] = useState<{
    productId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    paymentMode: string;
    amount: number;
    notes?: string;
  } | null>(null);

  const adminPaymentDetails = useMemo(() => {
    const data = adminBankDetailsResponse?.data;
    const companyBank = data?.companyBankDetails || data;
    return {
      upiId: companyBank?.upi_id ?? companyBank?.upiId ?? "Not available",
      accountName:
        companyBank?.account_holder_name ??
        companyBank?.accountHolderName ??
        "Not available",
      accountNumber:
        companyBank?.account_number ??
        companyBank?.accountNumber ??
        "Not available",
      ifsc: companyBank?.ifsc_code ?? companyBank?.ifscCode ?? "Not available",
      bankName: companyBank?.bank_name ?? companyBank?.bankName ?? "Not available",
      qrCode: companyBank?.qr_code ?? companyBank?.qrCode ?? "",
    };
  }, [adminBankDetailsResponse]);

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
    isValidProductId &&
    isQuantityValid &&
    customerName.trim() &&
    phone.trim() &&
    deliveryAddress.trim();
  const canSubmitPayment =
    orderCreated &&
    paymentWindowCompleted &&
    transactionId.trim() &&
    Boolean(paymentScreenshot);

  const handleOK = () => {
    console.log("CLICKED OK!");
    setIsOrderPlacedModalOpen(false);
  };

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
              <p className="font-semibold">{productIdDisplay}</p>
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
                className="w-full border border-cyan-700 bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg cursor-pointer"
                disabled={!canCreateOrder}
                onClick={() => {
                  setOrderError("");
                  const payload = {
                    productId,
                    quantity,
                    customerName,
                    customerPhone: phone,
                    customerEmail: email,
                    deliveryAddress,
                    paymentMode: "upi",
                    amount: pricing.totalAmount,
                    notes: "",
                  };

                  setOrderPayload(payload); // ✅ save locally

                  setOrderCreated(true);
                  setPaymentWindowCompleted(false);
                  setPaymentSubmitted(false);
                  setAdminVerified(false);
                  setIsPaymentModalOpen(true);
                }}
              >
                Create Order (Status: Pending Payment)
              </Button>
              {paymentWindowCompleted && (
                <p className="text-xs font-medium text-emerald-700">
                  Payment window completed. Now upload transaction ID and
                  screenshot.
                </p>
              )}
              {!isValidProductId && (
                <p className="text-xs font-medium text-red-600">
                  Invalid product ID. Please open bulk order from a real product
                  card (GUID required).
                </p>
              )}
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
                  className="hover:bg-gray-100 cursor-pointer"
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
                  className="border border-white bg-emerald-700 hover:bg-emerald-700 text-white shadow-lg cursor-pointer"
                  onClick={async () => {
                    try {
                      setOrderError("");
                      if (!orderPayload || !paymentScreenshot) return;
                      if (!isValidProductId) {
                        setOrderError(
                          "Invalid productId. Please select a valid product.",
                        );
                        return;
                      }

                      await createBulkOrder.mutateAsync({
                        ...orderPayload,
                        transactionReference: transactionId,
                        paymentScreenshot,
                      });

                      setAdminVerified(true);
                      setIsOrderPlacedModalOpen(true);
                    } catch (error) {
                      const message =
                        error instanceof Error
                          ? error.message
                          : "Unable to create bulk order";
                      setOrderError(message);
                    }
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Admin Verified
                </Button>
              </div>
              {orderError && (
                <p className="text-xs font-medium text-red-600">{orderError}</p>
              )}
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
      </div>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Pay to Unicsi Admin Account</DialogTitle>
            <DialogDescription>
              Customer can pay manually via UPI or bank transfer. After
              successful payment, click the button below to close this window.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                UPI Payment
              </p>
              <p className="mt-2 text-sm text-slate-700">UPI ID</p>
              <p className="font-semibold text-slate-900">
                {adminPaymentDetails.upiId}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Bank Transfer
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Account Name:{" "}
                <span className="font-semibold text-slate-900">
                  {adminPaymentDetails.accountName}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                Account Number:{" "}
                <span className="font-semibold text-slate-900">
                  {adminPaymentDetails.accountNumber}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                IFSC:{" "}
                <span className="font-semibold text-slate-900">
                  {adminPaymentDetails.ifsc}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                Bank:{" "}
                <span className="font-semibold text-slate-900">
                  {adminPaymentDetails.bankName}
                </span>
              </p>
            </div>
          </div>
          {isAdminBankLoading && (
            <p className="text-xs font-medium text-slate-500">
              Loading admin bank details...
            </p>
          )}
          {adminBankError && (
            <p className="text-xs font-medium text-red-600">
              {adminBankError instanceof Error
                ? adminBankError.message
                : "Unable to load admin bank details from API."}
            </p>
          )}
          {adminPaymentDetails.qrCode && (
            <p className="text-xs text-slate-600">
              QR Code URL:{" "}
              <a
                href={adminPaymentDetails.qrCode}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-700 underline"
              >
                View QR
              </a>
            </p>
          )}

          <DialogFooter>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                setPaymentWindowCompleted(true);
                setIsPaymentModalOpen(false);
              }}
            >
              Payment Successful
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isOrderPlacedModalOpen}
        onOpenChange={setIsOrderPlacedModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order placed Successfully!</DialogTitle>
            <DialogDescription>
              Your order has been confirmed and will be processed soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleOK}
              className="border border-cyan-100 bg-linear-to-r from-cyan-700 to-teal-600 text-white shadow-lg cursor-pointer"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
