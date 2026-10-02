import { PAYSTACK_SCRIPT } from "@/lib/store/paystack-script";

type PaystackSuccess = { reference?: string };

type PaystackPopup = {
  resumeTransaction: (
    accessCode: string,
    callbacks?: {
      onSuccess?: (transaction: PaystackSuccess) => void;
      onCancel?: () => void;
    },
  ) => void;
};

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopup;
  }
}

let loading: Promise<void> | null = null;

function ensurePaystack() {
  if (window.PaystackPop) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading = null;
        reject(new Error("Could not load Paystack."));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

export function preloadPaystack() {
  if (typeof window === "undefined") return;
  void ensurePaystack().catch(() => {});
}

export async function openPaystackCheckout(input: {
  accessCode: string;
  authorizationUrl: string;
  reference: string;
  onCancel: () => void;
  onPaid?: () => void;
}) {
  const openHostedPage = () => {
    window.location.assign(input.authorizationUrl);
  };

  try {
    await ensurePaystack();
    const Popup = window.PaystackPop;
    if (!Popup) {
      openHostedPage();
      return;
    }
    const popup = new Popup();
    popup.resumeTransaction(input.accessCode, {
      onSuccess(transaction) {
        input.onPaid?.();
        const reference = transaction.reference || input.reference;
        window.location.assign(`/checkout/paystack?reference=${encodeURIComponent(reference)}`);
      },
      onCancel: input.onCancel,
    });
  } catch {
    openHostedPage();
  }
}
