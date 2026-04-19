import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Box,
  Calculator,
  ChevronDown,
  ChevronRight,
  Copy,
  HelpCircle,
  Info,
  RotateCcw,
  Store,
  X,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { usePushToShopify } from "@/hooks/usePushToShopify";
import { useGetProductById } from "@/hooks/marketplace/useProduct";
import { apiClient } from "@/hooks/marketplace/useShopifySecret";
import { useRouter } from "next/navigation";

interface DrawerProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  weightGrams?: number;
}

interface CartDrawerProps {
  onClose: () => void;
  selectedProduct: DrawerProduct | null;
  response: any | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

type ApiStore = {
  id?: number;
  store_name: string;
  store_url: string;
  access_token?: string;
  is_default?: boolean;
  installed_at: string;
};

const CartItem = ({
  name,
  sku,
  image,
}: {
  name: string;
  sku: string;
  image: string;
}) => (
  <div className="flex items-start gap-3 bg-gray-100 rounded-md p-3">
    <div className="h-16 shrink-0">
      <img
        src={image}
        alt="Product"
        className="w-full h-full object-contain rounded-md"
      />
    </div>

    <div className="flex flex-col gap-1 flex-1">
      <p className="text-sm font-medium text-slate-900 leading-tight">{name}</p>

      <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
        <span>SKU:</span>
        <span className="font-bold text-slate-900">{sku}</span>
        <Copy strokeWidth={2.5} className="w-4 h-4 cursor-pointer" />
      </div>
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex min-w-0 items-center gap-2 font-semibold text-black/80">
    <Icon className="w-6 h-6" />
    {title}
  </div>
);

const formatCurrency = (value: number) =>
  `₹${Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-IN")}`;

const CartDrawer = ({
  onClose,
  selectedProduct,
  response,
  isLoading,
  error,
  onRetry,
}: CartDrawerProps) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isSpendsOpen, setIsSpendsOpen] = useState(false);
  const [isChargesOpen, setIsChargesOpen] = useState(false);
  const [defaultStore, setDefaultStore] = useState<ApiStore | null>(null);
  const [isFetchingStore, setIsFetchingStore] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const product = response?.productData?.product;
  const firstVariant = product?.variants?.[0];
  const variantMeta = firstVariant as
    | {
        weight_grams?: number | string;
        weight?: number | string;
        shipping_discount?: number | string;
        rto_charges?: number | string;
      }
    | undefined;
  const cloutPrice = Number(firstVariant?.price ?? selectedProduct?.price ?? 0);
  const productWeightGrams = Number(
    variantMeta?.weight_grams ??
      variantMeta?.weight ??
      selectedProduct?.weightGrams ??
      0,
  );
  const rtoChargePerOrder = Math.max(
    Number(variantMeta?.rto_charges ?? Math.round(cloutPrice * 0.28)),
    0,
  );

  const handleSellingPriceUpdate = async (newPrice: number) => {
    if (!newPrice || newPrice <= 0) return;

    try {
      await apiClient.post("dropshipper/shopify/mrp-update", {
        productId: selectedProduct?.id,
        shopifyProductData: newPrice,
      });
    } catch (err) {
      console.error("Failed to update MRP:", err);
    }
  };

  const [sellingPrice, setSellingPrice] = useState<number>(cloutPrice);
  const [calcSellingPrice, setCalcSellingPrice] = useState<number>(cloutPrice);
  const [expectedOrders, setExpectedOrders] = useState<number>(100);
  const [confirmedRateInput, setConfirmedRateInput] = useState<string>("90%");
  const [deliveryRateInput, setDeliveryRateInput] = useState<string>("50%");
  const [adSpendPerOrderInput, setAdSpendPerOrderInput] = useState<string>("");
  const [miscChargesInput, setMiscChargesInput] = useState<string>("");
  const { pushProductToShopify } = usePushToShopify();
  const productId = selectedProduct?.id ?? "";
  const { data: productData } = useGetProductById(productId);
  const fetchedProduct = productData?.data;
  const fetchedActiveVariant =
    fetchedProduct?.variants?.find((variant: any) => variant?.is_active) ??
    fetchedProduct?.variants?.[0];
  // console.log("Selected Product ID:", productId);

  const parseNumericInput = (value: string): number | null => {
    const normalized = value.replace(/[^0-9.]/g, "");
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  useEffect(() => {
    const fetchDefaultStore = async () => {
      try {
        setIsFetchingStore(true); // ✅ start loading

        const response = await apiClient.get(
          "dropshipper/shopify/access-token",
        );

        const list: ApiStore[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        const store = list.find((s) => s.is_default) ?? list[0] ?? null;

        setDefaultStore(store);
      } catch (err) {
        console.error("Failed to fetch Shopify stores:", err);
      } finally {
        setIsFetchingStore(false); // ✅ stop loading
      }
    };

    fetchDefaultStore();
  }, []);

  useEffect(() => {
    setSellingPrice(cloutPrice);
    setCalcSellingPrice(cloutPrice);
  }, [cloutPrice]);

  const safeSellingPrice = Number.isFinite(sellingPrice) ? sellingPrice : 0;
  const shippingDiscount = Math.max(
    Number(variantMeta?.shipping_discount ?? 57),
    0,
  );
  const margin = Math.max(safeSellingPrice - cloutPrice, 0);
  const effectiveEarnings = margin + shippingDiscount;
  const safeCalcSellingPrice = Number.isFinite(calcSellingPrice)
    ? calcSellingPrice
    : cloutPrice;
  const safeExpectedOrders = Math.max(
    Number.isFinite(expectedOrders) ? expectedOrders : 0,
    0,
  );
  const confirmedRate = parseNumericInput(confirmedRateInput);
  const deliveryRate = parseNumericInput(deliveryRateInput);
  const adSpendPerOrder = parseNumericInput(adSpendPerOrderInput);
  const miscCharges = parseNumericInput(miscChargesInput) ?? 0;
  const safeConfirmedRate = Math.min(
    Math.max(Number.isFinite(confirmedRate) ? (confirmedRate as number) : 0, 0),
    100,
  );
  const safeDeliveryRate = Math.min(
    Math.max(Number.isFinite(deliveryRate) ? (deliveryRate as number) : 0, 0),
    100,
  );
  const safeAdSpendPerOrder = Math.max(
    Number.isFinite(adSpendPerOrder) ? (adSpendPerOrder as number) : 0,
    0,
  );
  const safeMiscCharges = Math.max(
    Number.isFinite(miscCharges) ? miscCharges : 0,
    0,
  );

  const hasRequiredInputs =
    safeCalcSellingPrice > 0 &&
    safeExpectedOrders > 0 &&
    confirmedRate !== null &&
    deliveryRate !== null &&
    adSpendPerOrder !== null;

  const confirmedOrders = hasRequiredInputs
    ? Math.round(safeExpectedOrders * (safeConfirmedRate / 100))
    : null;
  const deliveredOrders =
    confirmedOrders !== null
      ? Math.round(confirmedOrders * (safeDeliveryRate / 100))
      : null;
  const rtoOrders =
    confirmedOrders !== null && deliveredOrders !== null
      ? Math.max(confirmedOrders - deliveredOrders, 0)
      : null;
  const cancelledOrders =
    confirmedOrders !== null
      ? Math.max(safeExpectedOrders - confirmedOrders, 0)
      : null;
  const earningsPerOrder = hasRequiredInputs
    ? Math.max(safeCalcSellingPrice - cloutPrice, 0) + shippingDiscount
    : null;
  const totalEarnings =
    earningsPerOrder !== null && deliveredOrders !== null
      ? earningsPerOrder * deliveredOrders
      : null;
  const totalAdSpends = hasRequiredInputs
    ? safeAdSpendPerOrder * safeExpectedOrders
    : null;
  const totalRtoCharges =
    rtoOrders !== null ? rtoOrders * rtoChargePerOrder : null;
  const totalSpends =
    totalAdSpends !== null && totalRtoCharges !== null
      ? totalAdSpends + totalRtoCharges + safeMiscCharges
      : null;
  const netProfit =
    totalEarnings !== null && totalSpends !== null
      ? totalEarnings - totalSpends
      : null;
  const netProfitPerOrder =
    netProfit !== null && safeExpectedOrders > 0
      ? netProfit / safeExpectedOrders
      : null;
  const isNegativeProfit =
    netProfit !== null && netProfitPerOrder !== null
      ? netProfit < 0 || netProfitPerOrder < 0
      : false;

  const productTitle =
    product?.title ||
    selectedProduct?.name ||
    "Tangerine Vita C Dark Spot Care Cream 100gm Each (Pack of 2)";
  const productSku =
    fetchedActiveVariant?.sku || firstVariant?.sku || "SKU not available";
  const productImage =
    selectedProduct?.image ||
    product?.images?.[0]?.src ||
    "/images/vita-c.webp";

  const handlePushToShopify = () => {
    if (!defaultStore?.access_token || !defaultStore?.store_url) {
      console.error("No linked Shopify store found.");
      return;
    }

    if (!productData?.data) {
      console.error("Product data is missing.");
      return;
    }

    productData.data.dropshipperSellingPrice = sellingPrice;

    pushProductToShopify.mutate(
      {
        access_token: defaultStore.access_token,
        shop: defaultStore.store_url,
        productData: productData?.data,
        productId: "",
      },
      {
        onSuccess: (data) => {
          console.log("Success:", data?.data);

          handleSellingPriceUpdate(data?.data); // 👈 called after push success

          setShowSuccess(true);

          setTimeout(() => {
            router.push("/marketplace");
            setShowSuccess(false);
            onClose();
          }, 1200);
        },
        onError: (error) => {
          console.error("Error:", error);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-full max-w-[480px] bg-white shadow-xl animate-slideIn flex flex-col overflow-x-hidden px-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">Push To Shopify</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-28 space-y-6">
          <CartItem name={productTitle} sku={productSku} image={productImage} />

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-slate-200 pb-4">
            <SectionTitle icon={Store} title="Store" />
            <div className="flex justify-between gap-2">
              <span
                className={`text-sm ${
                  !response?.shop && !defaultStore?.store_url
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {response?.shop || defaultStore?.store_url || "No store linked"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-slate-200 pb-4">
            <SectionTitle icon={Banknote} title="Pricing" />
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="w-full bg-[#e9e3f8] hover:bg-[#e3daf8] transition-colors rounded-md px-3 py-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-[#5b2fd1] " />
                </div>
                <span className="text-[#5b2fd1] font-semibold underline text-xs">
                  Calculate Expected Profit
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-700">Price</p>
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">{cloutPrice}</span>
                <span className="text-sm font-semibold text-slate-700">₹</span>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-700">
                Set Your Selling Price
              </p>
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={Number.isNaN(sellingPrice) ? "" : sellingPrice}
                  onChange={(e) => {
                    const nextValue = Number(e.target.value);
                    setSellingPrice(Number.isNaN(nextValue) ? 0 : nextValue);
                  }}
                  className="w-full bg-transparent outline-none text-right font-medium"
                />
                <span className="text-sm font-semibold text-slate-700 ml-3">
                  ₹
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#ebf8e5] rounded-sm text-sm">
            <div className="flex justify-between p-3 font-bold text-[#3fb700]">
              <span>Your Margin</span>
              <span>₹{margin}</span>
            </div>
          </div>
          <div className="text-xs bg-gray-100 rounded-sm p-4 text-center">
            RTO and RVP charges are applicable and vary depending on the product
            weight.{" "}
            <button
              type="button"
              className="underline font-medium cursor-pointer"
              onClick={() => setIsChargesOpen((prev) => !prev)}
            >
              {isChargesOpen ? "hide charges" : "view charges for this product"}
            </button>
            {isChargesOpen && (
              <div className="mt-3 w-full rounded-xl border border-[#e4e4e7] bg-white p-4 text-left shadow-sm">
                <div className="max-h-56 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 overflow-hidden rounded-md border border-[#ececf1]">
                    <div className="border-r border-[#ececf1] bg-[#f3f4f8] p-3">
                      <p className="text-sm font-semibold text-[#3fb700]">
                        RVP Charges
                      </p>
                      <p className="text-xs text-[#71717a]">
                        (For This Product)
                      </p>
                    </div>
                    <div className="bg-[#f3f4f8] p-3">
                      <p className="text-sm font-semibold text-[#3fb700]">
                        RTO Charges
                      </p>
                      <p className="text-xs text-[#71717a]">(All Inclusive)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-x border-b border-[#ececf1]">
                    <div className="border-r border-[#ececf1] p-3 text-xs font-semibold text-[#5b2fd1]">
                      Please Contact Admin
                    </div>
                    <div className="p-3 text-sm font-semibold text-[#111827]">
                      ₹{rtoChargePerOrder}
                    </div>
                  </div>

                  <div className="pt-4 text-sm text-[#18181b]">
                    <p className="mb-2 text-sm font-medium">Note:</p>
                    <ul className="list-disc space-y-1 pl-5 text-xs leading-5">
                      <li>RTO & RVP will be changed to actual numbers.</li>
                      <li>
                        RVP will be changed on orders where supplier is not
                        found to be at fault.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            className="flex items-center justify-center w-full bg-black font-medium"
            disabled={
              isLoading ||
              isFetchingStore ||
              pushProductToShopify.isPending ||
              !defaultStore
            }
            onClick={handlePushToShopify}
          >
            <ArrowUpRight />
            <span>
              {isFetchingStore
                ? "Fetching Store..."
                : pushProductToShopify.isPending
                  ? "Pushing..."
                  : "Push To Shopify"}
            </span>
          </Button>
        </div>
      </div>

      {isCalculatorOpen && (
        <div
          className="fixed inset-0 z-70 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setIsCalculatorOpen(false)}
        >
          <div
            className="w-full max-w-210 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calculator className="w-7 h-7 text-slate-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    Pricing Calculator
                  </h3>
                  <p className="text-sm text-slate-800">
                    Please enter all the required fields (
                    <span className="text-red-500">*</span>) to calculate your
                    expected profit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCalcSellingPrice(cloutPrice);
                    setExpectedOrders(100);
                    setConfirmedRateInput("90%");
                    setDeliveryRateInput("50%");
                    setAdSpendPerOrderInput("");
                    setMiscChargesInput("");
                  }}
                  className="flex items-center gap-2 font-semibold underline text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(false)}
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={productImage}
                    alt={productTitle}
                    className="w-16 h-16 rounded-md object-cover border"
                  />

                  <div className="grid grid-cols-3 gap-6">
                    <div className="pr-6 border-r border-slate-300">
                      <p className="text-xs text-slate-700">Price</p>
                      <p className="text-xs font-bold">
                        {formatCurrency(cloutPrice)}{" "}
                        <Info className="inline w-3 h-3 text-slate-500" />
                      </p>
                    </div>
                    <div className="pr-6 border-r border-slate-300">
                      <p className="text-xs text-slate-700">RTO Charges</p>
                      <p className="text-xs font-bold">
                        {formatCurrency(rtoChargePerOrder)}{" "}
                        <Info className="inline w-3 h-3 text-slate-500" />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-700">Product Weight</p>
                      <p className="text-xs font-bold">
                        {productWeightGrams > 0
                          ? `${productWeightGrams}gm`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-y border-slate-200 py-4 flex items-center gap-4 text-sm">
                <span className="font-semibold">Available Discounts :</span>
                <span className="text-slate-400">☑</span>
                <span>
                  Shipping Discount{" "}
                  <span className="font-bold">
                    {formatCurrency(shippingDiscount)}
                  </span>{" "}
                  <Info className="inline w-4 h-4 text-slate-500" />
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-100 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                    <label className="text-sm font-semibold">
                      Selling Price<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-24 h-12 border border-slate-300 rounded-xs px-3 text-sm"
                      value={
                        Number.isNaN(calcSellingPrice) ? "" : calcSellingPrice
                      }
                      onChange={(e) => {
                        const nextValue = Number(e.target.value);
                        setCalcSellingPrice(
                          Number.isNaN(nextValue) ? 0 : nextValue,
                        );
                      }}
                      onBlur={() => handleSellingPriceUpdate(calcSellingPrice)}
                    />
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                    <label className="text-sm font-semibold">
                      Expected Orders<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-24 h-12 border border-slate-300 rounded-xs px-3 text-sm"
                      value={Number.isNaN(expectedOrders) ? "" : expectedOrders}
                      onChange={(e) => {
                        const nextValue = Number(e.target.value);
                        setExpectedOrders(
                          Number.isNaN(nextValue) ? 0 : nextValue,
                        );
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                    <label className="text-sm font-semibold">
                      Confirmed Orders (%)
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      min={0}
                      max={100}
                      className="w-24 h-12 border border-slate-300 rounded-xs px-3 text-sm"
                      placeholder="90%"
                      value={confirmedRateInput}
                      onChange={(e) => {
                        setConfirmedRateInput(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                    <label className="text-sm font-semibold">
                      Expected Delivery (%)
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      min={0}
                      max={100}
                      className="w-24 h-12 border border-slate-300 rounded-xs px-3 text-sm"
                      placeholder="50%"
                      value={deliveryRateInput}
                      onChange={(e) => {
                        setDeliveryRateInput(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      Ad Spends per order<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-24 h-12 border border-slate-300 rounded-xs px-3 text-sm"
                      value={adSpendPerOrderInput}
                      placeholder="Enter amount"
                      onChange={(e) => {
                        setAdSpendPerOrderInput(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      Total Misc. Charges
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-24 h-12 border border-slate-300 rounded-xs px-3 text-sm"
                      value={miscChargesInput}
                      placeholder="Enter amount"
                      onChange={(e) => {
                        setMiscChargesInput(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className={`rounded-xl p-5 ${
                      isNegativeProfit ? "bg-red-100" : "bg-[#ebf8e5]"
                    }`}
                  >
                    <div className="flex items-start justify-between pb-4 border-b border-slate-300">
                      <div>
                        <p className="text-sm font-semibold">Net Profit</p>
                        <p className="text-xs text-slate-700">
                          Total Earnings - Total Spends
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          netProfit !== null && netProfit < 0
                            ? "text-red-600"
                            : "text-[#35b700]"
                        }`}
                      >
                        {netProfit === null ? "N/A" : formatCurrency(netProfit)}
                      </p>
                    </div>
                    <div className="flex items-start justify-between pt-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Net Profit (Per Order)
                        </p>
                        <p className="text-xs text-slate-700">
                          Net Profit / Expected Orders
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          netProfitPerOrder !== null && netProfitPerOrder < 0
                            ? "text-red-600"
                            : "text-[#35b700]"
                        }`}
                      >
                        {netProfitPerOrder === null
                          ? "N/A"
                          : formatCurrency(netProfitPerOrder)}
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-5 space-y-2">
                    <div className="pb-3 border-b border-slate-300">
                      <button
                        type="button"
                        onClick={() => setIsOrdersOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                            <Box className="w-5 h-5" />
                          </div>
                          <span className="text-base font-semibold">
                            # Orders
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold">
                            {confirmedOrders === null
                              ? "N/A"
                              : safeExpectedOrders}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${isOrdersOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      {isOrdersOpen && (
                        <div className="mt-3 pl-13 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="underline font-medium">
                              Confirmed Orders
                            </span>
                            <span className="font-semibold text-black text-sm">
                              {confirmedOrders ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="underline">Delivered Orders</span>
                            <span className="text-xs">
                              {deliveredOrders ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>(+) RTO Orders</span>
                            <span className="text-xs">
                              {rtoOrders ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="underline font-medium">
                              (+)&nbsp;Cancelled Orders
                            </span>
                            <span className="font-semibold text-black text-sm">
                              {cancelledOrders ?? "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pb-3 border-b border-slate-300">
                      <button
                        type="button"
                        onClick={() => setIsEarningsOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#ebf8e5] text-[#35b700] flex items-center justify-center text-lg">
                            <ArrowDownLeft className="w-5 h-5" />
                          </div>
                          <span className="text-base font-semibold">
                            Total Earnings
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold">
                            {totalEarnings === null
                              ? "N/A"
                              : formatCurrency(totalEarnings)}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${isEarningsOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      {isEarningsOpen && (
                        <div className="mt-3 pl-13 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="underline">
                              Earnings per order
                            </span>
                            <span className="text-xs">
                              {earningsPerOrder === null
                                ? "N/A"
                                : formatCurrency(earningsPerOrder)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="underline">
                              (x) Delivered Orders
                            </span>
                            <span className="text-xs">
                              {deliveredOrders ?? "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setIsSpendsOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
                            <ArrowUpRight className="w-5 h-5" />
                          </div>
                          <span className="text-base font-semibold">
                            Total Spends
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold">
                            {totalSpends === null
                              ? "N/A"
                              : formatCurrency(totalSpends)}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${isSpendsOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      {isSpendsOpen && (
                        <div className="mt-3 pl-13 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="underline">Total Ad Spends</span>
                            <span className="text-xs">
                              {totalAdSpends === null
                                ? "N/A"
                                : formatCurrency(totalAdSpends)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="underline">
                              (+)&nbsp;Total RTO Charges
                            </span>
                            <span className="text-xs">
                              {totalRtoCharges === null
                                ? "N/A"
                                : formatCurrency(totalRtoCharges)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>(+)&nbsp;Total Misc. Charges</span>
                            <span className="text-xs">
                              {hasRequiredInputs
                                ? formatCurrency(safeMiscCharges)
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-700">
                <span className="font-semibold">Note:</span> This calculator
                provides estimated figures. Actual results may vary. Roposo
                Clout does not commit to any expected profit based on these
                calculations.
              </p>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 animate-fadeIn">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Text */}
            <h2 className="text-lg font-semibold text-slate-900">
              Product Added Successfully 🎉
            </h2>

            <p className="text-sm text-slate-500 text-center">
              Your product has been pushed to Shopify.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
