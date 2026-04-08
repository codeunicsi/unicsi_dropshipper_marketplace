"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useGetProductById } from "@/hooks/marketplace/useProduct";
import { CheckCircle2, IndianRupee, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PAYMENT_MODE_OPTIONS = [
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "NEFT", label: "NEFT" },
  { value: "RTGS", label: "RTGS" },
  { value: "IMPS", label: "IMPS" },
];

export default function BulkOrderPage() {
  const { createBulkOrder } = useOrder();
  const searchParams = useSearchParams();
  const params = useParams();

  // ── Product ID: path segment > query param ──────────────────────────────
  const pathProductId = (params?.productId || params?.id || "") as string;
  const rawProductId =
    pathProductId ||
    searchParams.get("productId") ||
    searchParams.get("id") ||
    "";
  const productId =
    LEGACY_PRODUCT_ID_MAP[rawProductId.trim()] || rawProductId.trim();
  const isValidProductId = UUID_REGEX.test(productId);
  const productIdDisplay = productId || "N/A";

  // ── Fetch product from API ───────────────────────────────────────────────
  const { data: productData, isLoading: isProductLoading } =
    useGetProductById(productId);
  const product = productData?.data;

  // ── Prefill name from API title ──────────────────────────────────────────
  const productName =
    product?.title ||
    searchParams.get("productName") ||
    "Selected Marketplace Product";

  // ── Admin bank details ───────────────────────────────────────────────────
  const {
    data: adminBankDetailsResponse,
    isLoading: isAdminBankLoading,
    error: adminBankError,
  } = useAdminBankDetails();

  // ── Form state ───────────────────────────────────────────────────────────
  const [quantity, setQuantity] = useState(MOQ);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOrderPlacedModalOpen, setIsOrderPlacedModalOpen] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstNumber, setGstNumber] = useState("");

  // ── Admin payment details ────────────────────────────────────────────────
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
      bankName:
        companyBank?.bank_name ?? companyBank?.bankName ?? "Not available",
      qrCode: companyBank?.qr_code ?? companyBank?.qrCode ?? "",
    };
  }, [adminBankDetailsResponse]);

  // ── Pricing ──────────────────────────────────────────────────────────────
  const pricing = useMemo(() => {
    const sellingPriceInput =
      (product?.bulk_price ? parseFloat(product.bulk_price) : 0) ||
      Number(searchParams.get("sellingPrice") || 100);

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
  }, [quantity, product, searchParams]);

  // ── Guards ───────────────────────────────────────────────────────────────
  const isQuantityValid = quantity >= MOQ;

  // Step 1: can open the payment modal (all order details filled)
  const canOpenPaymentModal =
    isValidProductId &&
    isQuantityValid &&
    customerName.trim() !== "" &&
    phone.trim() !== "" &&
    deliveryAddress.trim() !== "" &&
    paymentMode !== "";

  // Step 2: can submit the final order (payment proof provided)
  const canSubmitOrder =
    canOpenPaymentModal &&
    transactionId.trim() !== "" &&
    paymentScreenshot !== null;

  // ── Final submission ─────────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    if (!canSubmitOrder || !paymentScreenshot) return;

    setOrderError("");
    setIsSubmitting(true);

    try {
      await createBulkOrder.mutateAsync({
        productId,
        quantity,
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        paymentMode,
        transactionReference: transactionId.trim(),
        amount: pricing.totalAmount,
        paymentScreenshot,
        gstNumber,
      });

      setIsPaymentModalOpen(false);
      setIsOrderPlacedModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create bulk order";
      setOrderError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
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
              <p className="font-semibold">
                {productIdDisplay !== "N/A"
                  ? `${productIdDisplay.slice(0, 6)}`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-cyan-100">Product Name</p>
              <p className="font-semibold">
                {isProductLoading ? "Loading..." : productName}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-cyan-100">Selling Price</p>
              <p className="flex items-center gap-0.5 font-semibold">
                <IndianRupee className="w-4 h-4" strokeWidth={3} />
                {isProductLoading
                  ? "..."
                  : pricing.sellingPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* ── Order Details Form ───────────────────────────────────────────── */}
        <section className="mt-6">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
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
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger id="paymentMode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value.toLocaleLowerCase()}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="Enter GST number"
                />
              </div>

              {!isValidProductId && (
                <p className="text-xs font-medium text-red-600">
                  Invalid product ID. Please open bulk order from a real product
                  card (GUID required).
                </p>
              )}

              <Button
                className="w-full border border-cyan-700 bg-cyan-700 hover:bg-cyan-600 text-white shadow-lg cursor-pointer"
                disabled={!canOpenPaymentModal}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* ── Pricing Summary Cards ────────────────────────────────────────── */}
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
        </section>
      </div>

      {/* ── Payment Modal ──────────────────────────────────────────────────── */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Pay to Unicsi Admin Account</DialogTitle>
            <DialogDescription>
              Transfer <strong>₹{pricing.totalAmount.toLocaleString()}</strong>{" "}
              to the account below, then upload your transaction ID and
              screenshot to complete the order.
            </DialogDescription>
          </DialogHeader>

          {/* Bank / UPI Details */}
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
              QR Code:{" "}
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

          {/* Payment Proof Fields — inside the modal so they're filled after payment */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold text-slate-700">
              After payment, upload your proof:
            </p>
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID / UTR</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="UPI reference / bank UTR number"
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
                Upload screenshot for admin verification.
              </p>
            </div>
          </div>

          {orderError && (
            <p className="text-xs font-medium text-red-600">{orderError}</p>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={!canSubmitOrder || isSubmitting}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? (
                "Placing Order..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Order Placed Modal ─────────────────────────────────────────────── */}
      <Dialog
        open={isOrderPlacedModalOpen}
        onOpenChange={setIsOrderPlacedModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Placed Successfully!</DialogTitle>
            <DialogDescription>
              Your order has been confirmed and will be processed after admin
              verification.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setIsOrderPlacedModalOpen(false)}
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
