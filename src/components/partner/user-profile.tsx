"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useAuth";
import {
  useProfile,
  useUpdateProfile,
  useBankDetails,
  useCreateBankDetails,
  useUpdateBankDetails,
  useGstDetails,
  useCreateGstDetails,
  useUpdateGstDetails,
} from "@/hooks/useProfile";
interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  store_id: string;
}
interface BankFormState {
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  proofFileName: string;
}
interface BankApiData {
  holderName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  bankDetailProof: string | null;
}
interface GstFormState {
  nameAsPerGst: string;
  gstId: string;
  gstCertificateFileName: string;
  panCardNumber: string;
  panCardFileName: string;
}
const UserProfilePage = () => {
  const { data: user } = useUser();

  /* ---------------- PROFILE ---------------- */
  const { data: profile } = useProfile();

  // useEffect(() => {
  //   console.log("PROFILE:", profile);
  // }, [profile]);

  const { mutate: updateProfile } = useUpdateProfile();

  /* ---------------- BANK ---------------- */
  const { data: bankDetails } = useBankDetails();
  const { mutateAsync: createBank, isPending: isCreatingBank } =
    useCreateBankDetails();
  const { mutateAsync: updateBank, isPending: isUpdatingBank } =
    useUpdateBankDetails();

  /* ---------------- GST ---------------- */
  const { data: gstDetails } = useGstDetails();

  console.log("GST-DATA:", gstDetails);
  const { mutate: createGst } = useCreateGstDetails();
  const { mutate: updateGst } = useUpdateGstDetails();

  const [isEditing, setIsEditing] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);
  const [isGstEditing, setIsGstEditing] = useState(false);
  const [bankError, setBankError] = useState("");
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gstFileInputRef = useRef<HTMLInputElement | null>(null);
  const panFileInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------- PROFILE FORM ---------------- */
  const initialData = useMemo<ProfileFormState>(
    () => ({
      name: profile?.data?.name ?? "",
      email: profile?.data?.email ?? "",
      phone: profile?.data?.phone ?? "",
      store_id: profile?.data?.store_id?.toString() ?? "",
    }),
    [profile],
  );

  const [formData, setFormData] = useState<ProfileFormState>(initialData);

  useEffect(() => {
    if (!isEditing) {
      setFormData(initialData);
    }
  }, [initialData, isEditing]);

  /* ---------------- BANK FORM ---------------- */
  const initialBankData = useMemo<BankFormState>(
    () => ({
      accountHolderName: bankDetails?.data?.holderName ?? "",
      bankAccountNumber: bankDetails?.data?.accountNumber ?? "",
      ifscCode: bankDetails?.data?.ifsc ?? "",
      proofFileName: bankDetails?.data?.bankDetailProof ?? "No File Selected",
    }),
    [bankDetails],
  );

  const hasExistingBankDetails = useMemo(() => {
    const bankData = bankDetails?.data as BankApiData | null | undefined;
    if (!bankData) return false;

    return [bankData.holderName, bankData.accountNumber, bankData.ifsc].some(
      (value) => typeof value === "string" && value.trim() !== "",
    );
  }, [bankDetails]);

  const isBankSaving = isCreatingBank || isUpdatingBank;

  const [bankFormData, setBankFormData] =
    useState<BankFormState>(initialBankData);

  useEffect(() => {
    if (!isBankEditing) {
      setBankFormData(initialBankData);
      setBankProofFile(null);
    }
  }, [initialBankData, isBankEditing]);

  /* ---------------- GST FORM ---------------- */
  const initialGstData = useMemo<GstFormState>(
    () => ({
      nameAsPerGst: gstDetails?.data?.nameAsPerGst ?? "",
      gstId: gstDetails?.data?.gstId ?? "",
      gstCertificateFileName:
        gstDetails?.data?.gstCertificateFileName ?? "No File Selected",
      panCardNumber: gstDetails?.data?.panCardNumber ?? "",
      panCardFileName: gstDetails?.data?.panCardFileName ?? "No File Selected",
    }),
    [gstDetails],
  );

  const [gstFormData, setGstFormData] = useState<GstFormState>(initialGstData);

  useEffect(() => {
    if (!isGstEditing) {
      setGstFormData(initialGstData);
    }
  }, [initialGstData, isGstEditing]);

  /* ---------------- PROFILE ACTIONS ---------------- */
  const onEdit = () => {
    setFormData(initialData);
    setIsEditing(true);
  };

  const onCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  const onSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const onCopyStoreId = async () => {
    if (!formData.store_id) return;
    await navigator.clipboard.writeText(formData.store_id);
  };

  /* ---------------- BANK ACTIONS ---------------- */
  const onBankEdit = () => {
    setBankError("");
    setIsBankEditing(true);
  };

  const onBankCancel = () => {
    setBankFormData(initialBankData);
    setBankProofFile(null);
    setBankError("");
    setIsBankEditing(false);
  };

  const onBankSave = async () => {
    setBankError("");

    const holderName = bankFormData.accountHolderName.trim();
    const accountNumber = bankFormData.bankAccountNumber.trim();
    const ifsc = bankFormData.ifscCode.trim().toUpperCase();

    if (!holderName || !accountNumber || !ifsc) {
      setBankError(
        "Account holder name, account number and IFSC are required.",
      );
      return;
    }

    if (!bankProofFile && !hasExistingBankDetails) {
      setBankError("Bank detail proof file is required.");
      return;
    }

    const payload = new FormData();
    payload.append("holderName", holderName);
    payload.append("accountNumber", accountNumber);
    payload.append("ifsc", ifsc);
    if (bankProofFile) {
      payload.append("bankDetailProof", bankProofFile);
    }

    try {
      if (hasExistingBankDetails) {
        await updateBank(payload);
      } else {
        await createBank(payload);
      }
      setIsBankEditing(false);
    } catch (error) {
      setBankError(
        error instanceof Error
          ? error.message
          : "Unable to save bank details. Please try again.",
      );
    }
  };

  /* ---------------- GST ACTIONS ---------------- */
  const onGstEdit = () => {
    setIsGstEditing(true);
  };

  const onGstCancel = () => {
    setGstFormData(initialGstData);
    setIsGstEditing(false);
  };

  const onGstSave = () => {
    if (gstDetails?.data) {
      updateGst(gstFormData);
    } else {
      createGst(gstFormData);
    }
    setIsGstEditing(false);
  };

  return (
    <section className="flex flex-col gap-6 mx-6">
      <h1 className="text-xl font-semibold text-foreground">Profile</h1>

      {/* Profile Section */}
      <div className="rounded-lg border border-slate-300 bg-[#f8f8f8] p-6 md:p-8">
        <div className="mb-8 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Personal Details
          </h2>

          {isEditing ? (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-4 text-sm font-semibold"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="my-button h-12 px-4 text-sm font-semibold text-white"
                onClick={onSave}
              >
                <Check className="h-5 w-5" />
                Save
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="my-button h-12 px-4 text-sm font-semibold text-white hover:text-white"
              onClick={onEdit}
            >
              <Pencil className="h-5 w-5" />
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={formData.name}
              readOnly={!isEditing}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="h-14 bg-background text-sm border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Phone No.
            </label>
            <Input
              value={formData.phone}
              readOnly={!isEditing}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="h-14 bg-background text-sm border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={formData.email}
              readOnly={!isEditing}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="h-14 bg-background text-sm border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Store ID
            </label>
            <div className="relative">
              <Input
                value={formData.store_id}
                readOnly
                className="h-14 bg-background pr-12 text-sm border border-slate-300"
              />
              <button
                type="button"
                aria-label="Copy store ID"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground"
                onClick={onCopyStoreId}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bank details Section */}
      <div className="rounded-lg border border-slate-300 bg-[#f8f8f8] p-6 md:p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Bank Details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please enter details carefully. This will be used for all kind of
              payments i.e. Margin, Refunds.
            </p>
          </div>

          {isBankEditing ? (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-4 text-sm font-semibold"
                onClick={onBankCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="my-button h-12 px-4 text-sm font-semibold text-white"
                onClick={onBankSave}
                disabled={isBankSaving}
              >
                <Check className="h-5 w-5" />
                {isBankSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="my-button h-12 px-4 text-sm font-semibold text-white hover:text-white"
              onClick={onBankEdit}
            >
              <Pencil className="h-5 w-5" />
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Account Holder Name
            </label>
            <Input
              value={bankFormData.accountHolderName}
              readOnly={!isBankEditing}
              onChange={(e) =>
                setBankFormData((prev) => ({
                  ...prev,
                  accountHolderName: e.target.value,
                }))
              }
              className="h-14 bg-background text-sm border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Bank Account Number
            </label>
            <Input
              value={bankFormData.bankAccountNumber}
              readOnly={!isBankEditing}
              onChange={(e) =>
                setBankFormData((prev) => ({
                  ...prev,
                  bankAccountNumber: e.target.value,
                }))
              }
              className="h-14 bg-background text-sm border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              IFSC Code
            </label>
            <Input
              value={bankFormData.ifscCode}
              readOnly={!isBankEditing}
              onChange={(e) =>
                setBankFormData((prev) => ({
                  ...prev,
                  ifscCode: e.target.value,
                }))
              }
              className="h-14 bg-background text-sm border border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Upload Bank Detail Proof
              <span className="ml-1 text-muted-foreground">
                (Bank Statement / Passbook / Cheque)
              </span>
            </label>
            <div className="flex h-14 items-center rounded-md border border-input bg-background">
              <div className="flex-1 truncate px-3 text-sm text-foreground">
                {bankFormData.proofFileName}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (!selectedFile) return;
                  setBankProofFile(selectedFile);
                  setBankFormData((prev) => ({
                    ...prev,
                    proofFileName: selectedFile.name,
                  }));
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!isBankEditing}
                className="mr-1 h-12 rounded-sm px-5 text-xs border border-slate-500"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              File type: JPG, PNG | Max file size: 200 kb
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span>{" "}
              Uploaded image should clearly show the account holder&apos;s name
              and bank account number.
            </p>
            {bankError && (
              <p className="text-xs font-medium text-red-600">{bankError}</p>
            )}
          </div>
        </div>
      </div>
      {/* GST Details Section */}
      <div className="rounded-lg border border-slate-300 bg-[#f8f8f8] p-6 md:p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              GST Details
            </h2>
          </div>

          {isGstEditing ? (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-4 text-sm font-semibold"
                onClick={onGstCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="my-button h-12 px-4 text-sm font-semibold text-white"
                onClick={onGstSave}
              >
                <Check className="h-5 w-5" />
                Save
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="my-button h-12 px-4 text-sm font-semibold text-white hover:text-white"
              onClick={onGstEdit}
            >
              <Pencil className="h-5 w-5" />
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground mr-2">
              Name (As per printed on GST Certificate)
            </label>
            <Input
              value={gstFormData.nameAsPerGst}
              readOnly={!isGstEditing}
              onChange={(e) =>
                setGstFormData((prev) => ({
                  ...prev,
                  nameAsPerGst: e.target.value,
                }))
              }
              className="h-14 max-w-160 bg-background text-base border border-slate-300"
            />
          </div>

          <div className="border-t border-border" />

          <h3 className="text-base font-semibold text-foreground">
            GST Information
          </h3>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                GST ID
              </label>
              <Input
                value={gstFormData.gstId}
                readOnly={!isGstEditing}
                onChange={(e) =>
                  setGstFormData((prev) => ({ ...prev, gstId: e.target.value }))
                }
                className="h-14 bg-background text-base border border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Upload GST Certificate Photo
              </label>
              <div className="flex h-14 items-center rounded-md border border-input bg-background">
                <div className="flex-1 truncate px-3 text-sm text-foreground">
                  {gstFormData.gstCertificateFileName}
                </div>
                <input
                  ref={gstFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (!selectedFile) return;
                    setGstFormData((prev) => ({
                      ...prev,
                      gstCertificateFileName: selectedFile.name,
                    }));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isGstEditing}
                  className="mr-1 h-12 rounded-sm px-5 text-xs border border-slate-500"
                  onClick={() => gstFileInputRef.current?.click()}
                >
                  Choose
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                File type: JPG, PNG | Max file size: 200 kb
              </p>
            </div>
          </div>

          <div className="border-t border-border" />

          <h3 className="text-base font-semibold text-foreground">
            PAN Card Information
          </h3>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                PAN Card No. (Used for GST registration)
              </label>
              <Input
                value={gstFormData.panCardNumber}
                readOnly={!isGstEditing}
                onChange={(e) =>
                  setGstFormData((prev) => ({
                    ...prev,
                    panCardNumber: e.target.value,
                  }))
                }
                className="h-14 bg-background text-sm border border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Upload PAN Card Photo
              </label>
              <div className="flex h-14 items-center rounded-md border border-input bg-background">
                <div className="flex-1 truncate px-3 text-sm text-foreground">
                  {gstFormData.panCardFileName}
                </div>
                <input
                  ref={panFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (!selectedFile) return;
                    setGstFormData((prev) => ({
                      ...prev,
                      panCardFileName: selectedFile.name,
                    }));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isGstEditing}
                  className="mr-1 h-12 rounded-sm px-5 text-xs border border-slate-500"
                  onClick={() => panFileInputRef.current?.click()}
                >
                  Choose
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                File type: JPG, PNG | Max file size: 200 kb
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfilePage;
