declare global {
  interface Window {
    growPayment?: {
      init: (config: any) => void;
      renderPaymentOptions: (authCode: string) => void;
      close: () => void;
    };
    meshulam_sdk_ready?: boolean;
  }
}

export {};
