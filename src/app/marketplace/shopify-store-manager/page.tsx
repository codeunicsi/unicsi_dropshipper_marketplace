"use client";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/hooks/marketplace/useShopifySecret";
import {
  Check,
  ExternalLink,
  ImageOff,
  Info,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingBag,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ── Types ─────────────────────────────────────────────────────────────────────
type StoreRow = {
  id: number;
  linkedOn: string;
  storeName: string;
  domain: string;
  isDefault?: boolean;
  logoUrl?: string;
};

// Shape returned by GET /dropshipper/shopify/stores
type ApiStore = {
  id?: number;
  store_name: string;
  store_url: string;
  access_token?: string;
  is_default?: boolean;
  created_at?: string;
  installed_at: string;
};

const linkSteps = [
  'Click on "Link Shopify Store" and you will be redirected to Shopify App Store page',
  'Add Unicsi Dropshipping App by clicking "Add App"',
  "Login with your Shopify account and install app",
  "After installing Unicsi Dropshipping app on Shopify, you will be able to push products on Shopify from Unicsi",
];

// ── Helper: map API store → StoreRow ─────────────────────────────────────────
function mapApiStore(apiStore: ApiStore, index: number): StoreRow {
  return {
    id: apiStore.id ?? index + 1,
    linkedOn: apiStore.installed_at
      ? new Date(apiStore.installed_at).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—",
    storeName: apiStore.store_name,
    domain: apiStore.store_url,
    isDefault: !!apiStore.is_default,
  };
}

export default function ShopifyStoreManagerPage() {
  // ── store list state ──────────────────────────────────────────────────────
  const [storeRows, setStoreRows] = useState<StoreRow[]>([]);
  const [isFetchingStores, setIsFetchingStores] = useState(true);
  const [fetchStoresError, setFetchStoresError] = useState("");

  // ── other UI state ────────────────────────────────────────────────────────
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(true);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isLinkStoreDrawerOpen, setIsLinkStoreDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreRow | null>(null);
  const [pendingRemoveStore, setPendingRemoveStore] = useState<StoreRow | null>(
    null,
  );
  const [editStoreName, setEditStoreName] = useState("");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editLogoUrl, setEditLogoUrl] = useState<string | undefined>(undefined);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── link store state ──────────────────────────────────────────────────────
  const [storeUrl, setStoreUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // ── credentials modal state ───────────────────────────────────────────────
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [isLoadingSecrets, setIsLoadingSecrets] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [existingSecretId, setExistingSecretId] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── OAuth success modal state ─────────────────────────────────────────────
  const [oauthSuccess, setOauthSuccess] = useState<{
    shopName: string;
    shopUrl: string;
    accessToken: string;
  } | null>(null);
  const [isLinkingStore, setIsLinkingStore] = useState(false);
  const [linkStoreError, setLinkStoreError] = useState("");

  // ── OAuth failure modal state ─────────────────────────────────────────────
  const [oauthError, setOauthError] = useState<{ message: string } | null>(
    null,
  );

  const isEditModalOpen = editingStore !== null;
  const isRemoveConfirmOpen = pendingRemoveStore !== null;

  // ── Fetch stores from API ─────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    setIsFetchingStores(true);
    setFetchStoresError("");
    try {
      const response = await apiClient.get("dropshipper/shopify/access-token");
      // Support both { data: [...] } and direct array responses
      const list: ApiStore[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setStoreRows(list.map(mapApiStore));
    } catch (err: any) {
      setFetchStoresError(
        err?.message ?? "Failed to load stores. Please try again.",
      );
    } finally {
      setIsFetchingStores(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ── Parse OAuth callback params on mount ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");
    const shopName = params.get("shop_name") ?? shop?.split(".")[0] ?? "";
    const accessToken = params.get("access_token");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (shop && accessToken) {
      setOauthSuccess({ shopName, shopUrl: shop, accessToken });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      setOauthError({
        message:
          errorDescription || "OAuth authorization was denied or failed.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (!shop && accessToken) {
      setOauthError({
        message:
          'Invalid OAuth callback: the "shop" parameter is missing or misspelled in the redirect URL.',
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (shop && !accessToken) {
      setOauthError({
        message:
          'Invalid OAuth callback: the "access_token" parameter is missing in the redirect URL.',
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── lock body scroll when any overlay is open ─────────────────────────────
  useEffect(() => {
    if (
      !isLinkStoreDrawerOpen &&
      !isEditModalOpen &&
      !isRemoveConfirmOpen &&
      !isCredModalOpen &&
      !oauthSuccess &&
      !oauthError
    )
      return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLinkStoreDrawerOpen(false);
        setEditingStore(null);
        setPendingRemoveStore(null);
        setIsCredModalOpen(false);
        setIsEditingCredentials(false);
        setOauthSuccess(null);
        setOauthError(null);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [
    isEditModalOpen,
    isLinkStoreDrawerOpen,
    isRemoveConfirmOpen,
    isCredModalOpen,
    oauthSuccess,
    oauthError,
  ]);

  // ── store edit helpers ────────────────────────────────────────────────────
  const openEditModal = (store: StoreRow) => {
    setEditingStore(store);
    setEditStoreName(store.storeName);
    setEditIsDefault(!!store.isDefault);
    setEditLogoUrl(store.logoUrl);
  };

  const closeEditModal = () => setEditingStore(null);

  const onLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditLogoUrl(URL.createObjectURL(file));
  };

  const updateStoreDetails = () => {
    if (!editingStore) return;
    setStoreRows((prev) =>
      prev.map((store) => {
        if (store.id === editingStore.id)
          return {
            ...store,
            storeName: editStoreName.trim() || store.storeName,
            isDefault: editIsDefault,
            logoUrl: editLogoUrl,
          };
        if (editIsDefault) return { ...store, isDefault: false };
        return store;
      }),
    );
    closeEditModal();
    setShowUpdateToast(true);
    window.setTimeout(() => setShowUpdateToast(false), 3000);
  };

  const requestRemoveStore = (store: StoreRow) => setPendingRemoveStore(store);
  const closeRemoveConfirmModal = () => setPendingRemoveStore(null);
  const confirmRemoveStore = () => {
    if (!pendingRemoveStore) return;
    setStoreRows((prev) => prev.filter((s) => s.id !== pendingRemoveStore.id));
    closeRemoveConfirmModal();
  };

  // ── link store handler ────────────────────────────────────────────────────
  const handleLinkStore = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setLinkError("");
    if (!storeUrl.trim()) {
      setLinkError("Please enter your Shopify store URL");
      return;
    }
    let normalizedUrl = storeUrl.trim().toLowerCase();
    if (normalizedUrl.startsWith("http://"))
      normalizedUrl = normalizedUrl.replace("http://", "");
    else if (normalizedUrl.startsWith("https://"))
      normalizedUrl = normalizedUrl.replace("https://", "");

    if (!normalizedUrl.includes(".myshopify.com")) {
      if (!normalizedUrl.includes(".")) {
        normalizedUrl = `${normalizedUrl}.myshopify.com`;
      } else {
        setLinkError(
          "Please enter a valid Shopify store URL (e.g., your-store.myshopify.com)",
        );
        return;
      }
    }
    setIsLinking(true);
    try {
      const response = await apiClient.get(
        `dropshipper/shopify/install?shop=${normalizedUrl}`,
      );
      const installUrl = response?.authUrl;
      if (!installUrl) throw new Error("Failed to initiate OAuth flow");
      window.location.href = installUrl;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again.";
      setOauthError({ message });
      setIsLinking(false);
    }
  };

  // ── Save linked store — POST /dropshipper/shopify/access-token ────────────
  const handleSaveLinkedStore = async () => {
    if (!oauthSuccess) return;
    setIsLinkingStore(true);
    setLinkStoreError("");
    try {
      await apiClient.post("dropshipper/shopify/access-token", {
        store_name: oauthSuccess.shopName,
        store_url: oauthSuccess.shopUrl,
        access_token: oauthSuccess.accessToken,
      });
      // Re-fetch store list from server to stay in sync
      await fetchStores();
      setOauthSuccess(null);
      setShowUpdateToast(true);
      window.setTimeout(() => setShowUpdateToast(false), 3000);
    } catch (err: any) {
      setLinkStoreError(
        err?.message ?? "Failed to save store. Please try again.",
      );
    } finally {
      setIsLinkingStore(false);
    }
  };

  // ── credentials modal helpers ─────────────────────────────────────────────
  const openCredentialsModal = async () => {
    setIsCredModalOpen(true);
    setIsEditingCredentials(false);
    setIsLoadingSecrets(true);
    setClientId("");
    setClientSecret("");
    setExistingSecretId(null);
    try {
      const { data } = await apiClient.get("dropshipper/shopify/secrets");
      const record = data;
      if (record?.shopify_client_id) {
        setExistingSecretId(record.dropshipper_shopify_secretes_id ?? "exists");
        setClientId(record.shopify_client_id ?? "");
        setClientSecret(record.shopify_client_secret ?? "");
      } else {
        setIsEditingCredentials(true);
      }
    } catch {
      setIsEditingCredentials(true);
    } finally {
      setIsLoadingSecrets(false);
    }
  };

  const closeCredentialsModal = () => {
    setIsCredModalOpen(false);
    setIsEditingCredentials(false);
  };

  const handleSubmitSecrets = async () => {
    if (!clientId || !clientSecret) return;
    try {
      setIsSubmitting(true);
      await apiClient.post("dropshipper/shopify/secrets", {
        shopifyClientId: clientId,
        shopifyClientSecret: clientSecret,
      });
      closeCredentialsModal();
      setShowUpdateToast(true);
      window.setTimeout(() => setShowUpdateToast(false), 3000);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#111827]">
          Shopify Store Manager
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoConfirmOrders((prev) => !prev)}
            className="flex items-center gap-4 rounded-sm border border-[#d5d5d5] bg-[#f7f7f7] px-6 py-1"
          >
            <span className="py-1 text-sm font-semibold text-[#2f3640]">
              Auto Confirm Orders
            </span>
            <span
              className={`relative h-6 w-12 rounded-full transition-colors ${
                autoConfirmOrders
                  ? "bg-linear-to-b from-[#0097b2] to-[#7ed957]"
                  : "bg-[#9ca3af]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  autoConfirmOrders ? "translate-x-1" : "-translate-x-5"
                }`}
              />
            </span>
          </button>
          <Popover open={isInfoTooltipOpen} onOpenChange={setIsInfoTooltipOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Auto confirm orders info"
                className="rounded-full p-1 text-[#777] hover:bg-gray-100"
                onMouseEnter={() => setIsInfoTooltipOpen(true)}
                onMouseLeave={() => setIsInfoTooltipOpen(false)}
              >
                <Info className="size-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              side="bottom"
              sideOffset={8}
              className="w-[320px] border-[#3f3f46] bg-[#3f3f46] px-4 py-3 text-center text-sm font-medium leading-6 text-white"
              onMouseEnter={() => setIsInfoTooltipOpen(true)}
              onMouseLeave={() => setIsInfoTooltipOpen(false)}
            >
              If this is ON, all COD orders received on Unicsi will
              automatically get confirmed and processed further.
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            onClick={openCredentialsModal}
            aria-label="Manage Shopify API credentials"
            className="ml-2 rounded-xs bg-linear-to-r from-[#0097b2] to-[#7ed957] px-3 text-white hover:bg-black/90"
          >
            <Plus className="size-5" />
            Add Shopify Credential
          </Button>
          <Button
            className="rounded-xs bg-linear-to-r from-[#0097b2] to-[#7ed957] px-8 text-sm text-white hover:bg-black/90"
            onClick={() => setIsLinkStoreDrawerOpen(true)}
          >
            <Link2 className="size-6" />
            Link New Shopify Store
          </Button>
        </div>
      </div>

      {/* ── Stores table ── */}
      <div className="overflow-hidden border border-[#e3e3e3]">
        <table className="w-full border-collapse">
          <thead className="bg-[#f2f2f2] text-left">
            <tr className="text-sm font-semibold text-[#2f3640]">
              <th className="w-16 px-6 py-4">#</th>
              <th className="w-80 px-6 py-4">Linked On</th>
              <th className="w-80 px-6 py-4">Store Platform</th>
              <th className="px-6 py-4">Store Details</th>
              <th className="w-96 px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* ── Loading skeleton ── */}
            {isFetchingStores &&
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i} className="border-t border-[#e6e6e6] animate-pulse">
                  <td className="px-6 py-6">
                    <div className="h-3 w-4 rounded bg-[#e5e7eb]" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-3 w-36 rounded bg-[#e5e7eb]" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-3 w-20 rounded bg-[#e5e7eb]" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded bg-[#e5e7eb]" />
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded bg-[#e5e7eb]" />
                        <div className="h-3 w-40 rounded bg-[#e5e7eb]" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex gap-3">
                      <div className="h-10 w-24 rounded bg-[#e5e7eb]" />
                      <div className="h-10 w-24 rounded bg-[#e5e7eb]" />
                    </div>
                  </td>
                </tr>
              ))}

            {/* ── Fetch error ── */}
            {!isFetchingStores && fetchStoresError && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="mb-4 text-sm text-red-500">
                    {fetchStoresError}
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2 text-sm"
                    onClick={fetchStores}
                  >
                    <RefreshCw className="size-4" />
                    Retry
                  </Button>
                </td>
              </tr>
            )}

            {/* ── Empty state ── */}
            {!isFetchingStores &&
              !fetchStoresError &&
              storeRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Store className="mx-auto mb-3 size-10 text-[#d1d5db]" />
                    <p className="text-sm font-semibold text-[#6b7280]">
                      No stores linked yet
                    </p>
                    <p className="mt-1 text-xs text-[#9ca3af]">
                      Click "Link New Shopify Store" to get started.
                    </p>
                  </td>
                </tr>
              )}

            {/* ── Store rows ── */}
            {!isFetchingStores &&
              !fetchStoresError &&
              storeRows.map((store, index) => (
                <tr
                  key={store.id}
                  className="border-t border-[#e6e6e6] align-top"
                >
                  <td className="px-6 py-6 text-xs text-[#1f2937]">
                    {index + 1}.
                  </td>
                  <td className="px-6 py-6 text-xs text-[#334155]">
                    {store.linkedOn}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="size-4 text-[#67a844]" />
                      <span className="text-sm font-bold italic text-[#111827]">
                        shopify
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center border border-[#cfcfcf] text-[#7b7b7b]">
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={`${store.storeName} logo`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Store className="size-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1f2937]">
                          {store.storeName}
                        </p>
                        <p className="w-60 text-xs text-[#334155]">
                          {store.domain}
                        </p>
                        {store.isDefault && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#efefef] px-2 py-1 text-[10px] text-[#464d57]">
                            <Check className="size-3" />
                            Default Store
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="h-10 rounded-sm px-7 text-xs font-semibold text-[#1f2937] hover:bg-[#f6f6f6]"
                        onClick={() => openEditModal(store)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-sm px-7 text-xs font-semibold text-[#1f2937] hover:bg-[#f6f6f6]"
                        onClick={() => requestRemoveStore(store)}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Link store drawer ── */}
      {isLinkStoreDrawerOpen && (
        <div
          className="fixed inset-0 z-120 flex justify-end bg-black/40"
          onClick={() => {
            setIsLinkStoreDrawerOpen(false);
            setStoreUrl("");
            setLinkError("");
          }}
        >
          <aside
            className="h-full w-full max-w-140 overflow-y-auto bg-white py-12 shadow-2xl animate-slideIn"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-8 py-6">
              <div className="mb-8 flex items-center justify-center gap-4">
                <div className="rounded-md border border-[#e5e7eb] p-4 text-center">
                  <p className="text-sm font-bold leading-none text-[#232323]">
                    UNICSI
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#7b7b7b]">
                  <span className="h-px w-14 bg-[#d1d5db]" />
                  <Link2 className="size-5" />
                  <span className="h-px w-14 bg-[#d1d5db]" />
                </div>
                <div className="rounded-md border border-[#e5e7eb] p-3">
                  <div className="flex items-center gap-1 text-sm font-bold italic text-[#111827]">
                    <ShoppingBag className="size-4 text-[#67a844]" />
                    shopify
                  </div>
                </div>
              </div>
              <h2 className="mb-6 text-sm font-semibold text-[#3d3d3d]">
                Link your Shopify store in just 4 simple steps:
              </h2>
              <ul className="list-disc space-y-5 pl-6 marker:text-[#606060]">
                {linkSteps.map((step) => (
                  <li key={step} className="pl-1 text-sm leading-8 text-[#444]">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sticky bottom-0 border-t border-[#ececec] bg-white px-8 py-6 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                  Shopify Store URL
                </label>
                <input
                  type="text"
                  value={storeUrl}
                  onChange={(e) => {
                    setStoreUrl(e.target.value);
                    setLinkError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLinkStore(e);
                  }}
                  placeholder="your-store.myshopify.com"
                  className="h-10 w-full rounded-sm border border-[#e3e3e3] px-3 text-sm text-[#1f2937] outline-none transition-colors focus:border-[#0097b2]"
                />
                {linkError && (
                  <p className="mt-1.5 text-xs text-red-500">{linkError}</p>
                )}
              </div>
              <Button
                className="h-12 w-full justify-center rounded-xs bg-black text-sm font-semibold text-white hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleLinkStore}
                disabled={isLinking}
              >
                {isLinking ? (
                  <>
                    <svg
                      className="mr-2 size-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeOpacity="0.25"
                      />
                      <path d="M21 12a9 9 0 00-9-9" />
                    </svg>
                    Connecting…
                  </>
                ) : (
                  <>
                    <Link2 className="size-5" />
                    Link New Shopify Store
                  </>
                )}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Edit store modal ── */}
      {isEditModalOpen && editingStore && (
        <div
          className="fixed inset-0 z-130 flex items-center justify-center bg-black/40 p-4"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-190 rounded-xl bg-white p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-lg font-bold text-[#111827]">
                Edit Store Details
              </h2>
              <button
                type="button"
                aria-label="Close edit store details modal"
                onClick={closeEditModal}
                className="rounded-md p-1 text-[#374151] hover:bg-[#f3f4f6]"
              >
                <X className="size-6" />
              </button>
            </div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="flex gap-10 text-sm text-[#111827]">
                <div>
                  <p className="text-xs text-[#4b5563]">Original Name</p>
                  <p className="text-xs font-semibold">
                    {editingStore.storeName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#4b5563]">Store URL</p>
                  <p className="text-xs font-semibold">{editingStore.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-base font-bold italic text-[#111827]">
                <ShoppingBag className="size-5 text-[#67a844]" />
                shopify
              </div>
            </div>
            <div className="mb-6 rounded-xl bg-[#f6f6f6] p-4">
              <div className="flex items-start justify-between gap-4 border-b border-[#d4d4d4] pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center border border-[#bdbdbd] bg-white text-[#7b7b7b]">
                    {editLogoUrl ? (
                      <img
                        src={editLogoUrl}
                        alt="Store logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="size-8" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222]">
                      Shopify Store Logo
                    </p>
                    <p className="text-[12px] leading-6 text-[#6b7280]">
                      File type: JPG, PNG | Max file size: 500kb <br />
                      Recommended dimensions: 1:1
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={onLogoFileChange}
                  />
                  <Button
                    className="h-10 bg-linear-to-r from-[#0097b2] to-[#7ed957] rounded-sm border-[#3f3f3f] px-5 text-sm text-white hover:cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-5" />
                    Change Logo
                  </Button>
                  <Button
                    className="h-10 bg-linear-to-r from-[#0097b2] to-[#7ed957] rounded-sm border-[#3f3f3f] px-4 text-white hover:cursor-pointer"
                    onClick={() => setEditLogoUrl(undefined)}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              </div>
              <div className="pt-4">
                <p className="mb-2 text-sm font-semibold text-[#222]">
                  Shopify Store Name
                </p>
                <input
                  type="text"
                  value={editStoreName}
                  onChange={(event) => setEditStoreName(event.target.value)}
                  className="h-10 w-full border border-[#e3e3e3] bg-white px-3 text-xs text-[#1f2937] outline-none focus:border-[#9ca3af]"
                />
                <p className="mt-3 text-xs text-[#6b7280]">
                  <span className="font-semibold text-[#374151]">Note:</span>{" "}
                  Store logo and name will be printed on the shipping labels.{" "}
                  <a
                    href="#"
                    className="font-semibold text-[#111827] underline underline-offset-2"
                  >
                    Show Sample Preview
                  </a>
                  <ExternalLink className="mb-0.5 ml-1 inline size-4" />
                </p>
              </div>
            </div>
            <div className="mb-6 rounded-xl border border-[#e3e3e3] p-4">
              <p className="text-xs text-[#6b7280]">Alternate Domain</p>
              <p className="text-xs font-semibold text-[#1f2937]">
                {editingStore.domain}
              </p>
              <p className="mt-4 border-t border-[#e5e7eb] pt-3 text-xs leading-6 text-[#4b5563]">
                <span className="mr-1 font-semibold">Tip:</span> Showing a
                legitimate alternate domain on the label adds credibility on the
                package for the end Customer and the delivery partner. To know
                how to add an alternate domain,{" "}
                <a
                  href="#"
                  className="font-semibold underline underline-offset-2"
                >
                  Click here
                </a>
              </p>
            </div>
            <label className="mb-6 flex cursor-pointer items-center gap-3 text-xs text-[#1f2937]">
              <input
                type="checkbox"
                checked={editIsDefault}
                onChange={(event) => setEditIsDefault(event.target.checked)}
                className="size-4 border border-[#9ca3af]"
              />
              Make this store as default store
            </label>
            <Button
              className="h-10 rounded-sm bg-linear-to-r from-[#7ed957] to-[#0097b2] px-7 text-sm font-semibold text-white hover:bg-black/90"
              onClick={updateStoreDetails}
            >
              Update Store Details
            </Button>
          </div>
        </div>
      )}

      {/* ── Remove confirm modal ── */}
      {isRemoveConfirmOpen && pendingRemoveStore && (
        <div
          className="fixed inset-0 z-[135] flex items-center justify-center bg-black/40 p-4"
          onClick={closeRemoveConfirmModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-[#111827]">Remove Store?</h3>
            <p className="mt-3 text-sm leading-6 text-[#4b5563]">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[#111827]">
                {pendingRemoveStore.storeName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                className="h-10 rounded-sm px-4 text-sm text-black border bg-white hover:bg-white cursor-pointer"
                onClick={closeRemoveConfirmModal}
              >
                Cancel
              </Button>
              <Button
                className="h-10 rounded-sm bg-linear-to-r from-[#0097b2] to-[#7ed957] px-5 text-sm text-white cursor-pointer"
                onClick={confirmRemoveStore}
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Credentials Modal ── */}
      {isCredModalOpen && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40"
          onClick={closeCredentialsModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#0097b2] to-[#7ed957]">
                  <ShoppingBag className="size-4 text-white" />
                </span>
                <h2 className="text-base font-bold text-[#111827]">
                  {existingSecretId
                    ? "Shopify Credentials"
                    : "Add Shopify Credentials"}
                </h2>
              </div>
              <button
                onClick={closeCredentialsModal}
                className="rounded-md p-1 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {isLoadingSecrets ? (
                <div className="space-y-4 animate-pulse">
                  <div>
                    <div className="h-3 w-28 bg-[#e5e7eb] rounded mb-2" />
                    <div className="h-10 bg-[#f3f4f6] rounded" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-[#e5e7eb] rounded mb-2" />
                    <div className="h-10 bg-[#f3f4f6] rounded" />
                  </div>
                </div>
              ) : (
                <>
                  {existingSecretId && !isEditingCredentials && (
                    <div className="flex items-center gap-2 text-xs text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-2">
                      <Check className="size-3.5 shrink-0" />
                      Credentials saved. Click{" "}
                      <span className="font-semibold ml-1">Edit</span>&nbsp;to
                      update them.
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                      Shopify Client ID
                    </label>
                    <input
                      type="text"
                      placeholder={
                        isEditingCredentials ? "Enter Client ID" : ""
                      }
                      value={clientId}
                      readOnly={!isEditingCredentials}
                      onChange={(e) => setClientId(e.target.value)}
                      className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition-colors ${
                        !isEditingCredentials
                          ? "bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280] cursor-not-allowed select-none"
                          : "bg-white border-[#d1d5db] text-[#111827] focus:border-[#0097b2] focus:ring-1 focus:ring-[#0097b2]/20"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                      Shopify Client Secret
                    </label>
                    <input
                      type={isEditingCredentials ? "text" : "password"}
                      placeholder={
                        isEditingCredentials ? "Enter Client Secret" : ""
                      }
                      value={clientSecret}
                      readOnly={!isEditingCredentials}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className={`w-full h-10 border rounded-md px-3 text-sm outline-none transition-colors ${
                        !isEditingCredentials
                          ? "bg-[#f9fafb] border-[#e5e7eb] text-[#6b7280] cursor-not-allowed"
                          : "bg-white border-[#d1d5db] text-[#111827] focus:border-[#0097b2] focus:ring-1 focus:ring-[#0097b2]/20"
                      }`}
                    />
                  </div>
                </>
              )}
            </div>
            {!isLoadingSecrets && (
              <div className="px-6 pb-6 flex justify-end gap-3">
                {existingSecretId && !isEditingCredentials ? (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 px-5 rounded-md text-sm text-[#374151]"
                      onClick={closeCredentialsModal}
                    >
                      Close
                    </Button>
                    <Button
                      className="h-10 px-5 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#0097b2] to-[#7ed957] hover:opacity-90 transition-opacity"
                      onClick={() => setIsEditingCredentials(true)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 px-5 rounded-md text-sm text-[#374151]"
                      onClick={() => {
                        if (existingSecretId) {
                          setIsEditingCredentials(false);
                        } else {
                          closeCredentialsModal();
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={isSubmitting || !clientId || !clientSecret}
                      className="h-10 px-5 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#0097b2] to-[#7ed957] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSubmitSecrets}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin size-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              strokeOpacity="0.25"
                            />
                            <path d="M21 12a9 9 0 00-9-9" />
                          </svg>
                          Saving…
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── OAuth Success Modal ── */}
      {oauthSuccess && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isLinkingStore && setOauthSuccess(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-[#0097b2] to-[#7ed957]" />
            <div className="px-8 py-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0fdf4] border-4 border-[#bbf7d0]">
                <Check className="size-10 text-[#16a34a] stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">
                Store Connected!
              </h2>
              <p className="text-sm text-[#6b7280] mb-6">
                Your Shopify store has been successfully linked to Unicsi.
              </p>

              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 text-left space-y-3 mb-6">
                {/* Store Name */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                    <Store className="size-3.5 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                      Store Name
                    </p>
                    <p className="text-sm font-semibold text-[#111827] break-all">
                      {oauthSuccess.shopName}
                    </p>
                  </div>
                </div>
                <div className="border-t border-[#e5e7eb]" />
                {/* Store URL */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                    <ShoppingBag className="size-3.5 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                      Store URL
                    </p>
                    <p className="text-sm font-semibold text-[#111827] break-all">
                      {oauthSuccess.shopUrl}
                    </p>
                  </div>
                </div>
                <div className="border-t border-[#e5e7eb]" />
                {/* Access Token */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                    <Check className="size-3.5 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                      Access Token
                    </p>
                    <p className="text-sm font-mono font-medium text-[#374151] break-all">
                      {oauthSuccess.accessToken}
                    </p>
                  </div>
                </div>
              </div>

              {linkStoreError && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 text-left">
                  {linkStoreError}
                </p>
              )}

              <Button
                disabled={isLinkingStore}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#7ed957] text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSaveLinkedStore}
              >
                {isLinkingStore ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    OK
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── OAuth Failure Modal ── */}
      {oauthError && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOauthError(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-[#e24b4a] to-[#f09595]" />
            <div className="px-8 py-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#fcebeb] border-4 border-[#f7c1c1]">
                <X className="size-10 text-[#a32d2d] stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">
                Connection Failed
              </h2>
              <p className="text-sm text-[#6b7280] mb-6">
                We couldn't link your Shopify store. Please try again.
              </p>
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 text-left space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fee2e2]">
                    <X className="size-3.5 text-[#a32d2d]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                      Error
                    </p>
                    <p className="text-sm text-[#374151] break-all">
                      {oauthError.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-lg text-sm font-semibold text-[#374151]"
                  onClick={() => setOauthError(null)}
                >
                  Dismiss
                </Button>
                <Button
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#7ed957] text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setOauthError(null);
                    setIsLinkStoreDrawerOpen(true);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {showUpdateToast && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-xl">
          Store details updated successfully!
        </div>
      )}
    </div>
  );
}
