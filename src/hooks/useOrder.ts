import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const BULK_ORDER_ENDPOINT = "dropshipper/bulk/orders";

export interface BulkOrderPayload {
  productId: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  transactionReference: string;
  paymentMode: string;
  amount: number;
  paymentScreenshot: File;
  notes?: string;
  gstNumber: any;
}

const toBulkOrderFormData = (payload: BulkOrderPayload) => {
  console.log("data is coming ", payload);
  const formData = new FormData();
  formData.append("productId", payload.productId);
  formData.append("quantity", String(payload.quantity));
  formData.append("customerName", payload.customerName);
  formData.append("customerPhone", payload.customerPhone);
  if (payload.customerEmail) {
    formData.append("customerEmail", payload.customerEmail);
  }
  formData.append("deliveryAddress", payload.deliveryAddress);
  formData.append("transactionReference", payload.transactionReference);
  formData.append("paymentMode", payload.paymentMode);
  formData.append("amount", String(payload.amount));
  formData.append("gstNumber", payload.gstNumber);
 
  if (payload.notes) {
    formData.append("notes", payload.notes);
  }
  if (payload.paymentScreenshot instanceof File) {
    formData.append("paymentScreenshot", payload.paymentScreenshot);
  } else {
    console.error("Invalid file for paymentScreenshot");
  }
  console.log("here data isempty ", formData);
  return formData;
};

export const useOrder = () => {
  const queryClient = useQueryClient();

  const createBulkOrder = useMutation({
    mutationFn: (data: BulkOrderPayload) =>
      apiClient.postForm(BULK_ORDER_ENDPOINT, toBulkOrderFormData(data)),

    onSuccess: (data) => {
      // Optional: invalidate or refetch related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      console.log("Bulk order created successfully", data);
    },

    onError: (error: any) => {
      console.error("Error creating bulk order:", error.message);
    },
  });

  return {
    createBulkOrder,
  };
};
