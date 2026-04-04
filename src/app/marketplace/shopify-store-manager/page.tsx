"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Check,
  ExternalLink,
  ImageOff,
  Info,
  Link2,
  Pencil,
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

type StoreRow = {
  id: number;
  linkedOn: string;
  storeName: string;
  domain: string;
  isDefault?: boolean;
  logoUrl?: string;
};

const initialStores: StoreRow[] = [
  {
    id: 1,
    linkedOn: "23 Feb 2026, 04:10 PM",
    storeName: "Store-1",
    domain: "store-1.myshopify.com",
  },
  {
    id: 2,
    linkedOn: "02 Apr 2025, 02:33 PM",
    storeName: "Store-2",
    domain: "store-2.myshopify.com",
    isDefault: true,
  },
];

const linkSteps = [
  'Click on "Link Shopify Store" and you will be redirected to Shopify App Store page',
  'Add Unicsi Dropshipping App by clicking "Add App"',
  "Login with your Shopify account and install app",
  "After installing Unicsi Dropshipping app on Shopify, you will be able to push products on Shopify from Unicsi",
];

export default function ShopifyStoreManagerPage() {
  const [storeRows, setStoreRows] = useState<StoreRow[]>(initialStores);
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

  const isEditModalOpen = editingStore !== null;
  const isRemoveConfirmOpen = pendingRemoveStore !== null;

  useEffect(() => {
    if (!isLinkStoreDrawerOpen && !isEditModalOpen && !isRemoveConfirmOpen)
      return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLinkStoreDrawerOpen(false);
        setEditingStore(null);
        setPendingRemoveStore(null);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [isEditModalOpen, isLinkStoreDrawerOpen, isRemoveConfirmOpen]);

  const openEditModal = (store: StoreRow) => {
    setEditingStore(store);
    setEditStoreName(store.storeName);
    setEditIsDefault(!!store.isDefault);
    setEditLogoUrl(store.logoUrl);
  };

  const closeEditModal = () => {
    setEditingStore(null);
  };

  const onLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setEditLogoUrl(objectUrl);
  };

  const updateStoreDetails = () => {
    if (!editingStore) return;

    setStoreRows((prev) =>
      prev.map((store) => {
        if (store.id === editingStore.id) {
          return {
            ...store,
            storeName: editStoreName.trim() || store.storeName,
            isDefault: editIsDefault,
            logoUrl: editLogoUrl,
          };
        }

        if (editIsDefault) {
          return { ...store, isDefault: false };
        }

        return store;
      }),
    );

    closeEditModal();
    setShowUpdateToast(true);
    window.setTimeout(() => setShowUpdateToast(false), 3000);
  };

  const requestRemoveStore = (store: StoreRow) => {
    setPendingRemoveStore(store);
  };

  const closeRemoveConfirmModal = () => {
    setPendingRemoveStore(null);
  };

  const confirmRemoveStore = () => {
    if (!pendingRemoveStore) return;

    setStoreRows((prev) =>
      prev.filter((store) => store.id !== pendingRemoveStore.id),
    );
    closeRemoveConfirmModal();
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
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
            className="ml-2 rounded-xs bg-linear-to-r from-[#0097b2] to-[#7ed957] px-8 text-sm text-white hover:bg-black/90"
            onClick={() => setIsLinkStoreDrawerOpen(true)}
          >
            <Link2 className="size-6" />
            Link New Shopify Store
          </Button>
        </div>
      </div>

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
            {storeRows.map((store) => (
              <tr
                key={store.id}
                className="border-t border-[#e6e6e6] align-top"
              >
                <td className="px-6 py-6 text-xs text-[#1f2937]">
                  {store.id}.
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

      {isLinkStoreDrawerOpen && (
        <div
          className="fixed inset-0 z-120 flex justify-end bg-black/40"
          onClick={() => setIsLinkStoreDrawerOpen(false)}
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

            <div className="sticky bottom-0 border-t border-[#ececec] bg-white px-12 py-18">
              <Button className="h-12 w-full justify-center rounded-xs bg-black text-sm font-semibold text-white hover:cursor-pointer">
                <Link2 className="size-5" />
                Link New Shopify Store
              </Button>
            </div>
          </aside>
        </div>
      )}

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
                      File type: JPG, PNG | Max file size: 500kb
                      <br />
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
                <span className="mr-1 font-semibold">Tip:</span>
                Showing a legitimate alternate domain on the label adds
                credibility on the package for the end Customer and the delivery
                partner. To know how to add an alternate domain,{" "}
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

      {showUpdateToast && (
        <div className="fixed bottom-6 left-1/2 z-140 -translate-x-1/2 rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-xl">
          Store details updated Successfully!
        </div>
      )}
    </div>
  );
}
