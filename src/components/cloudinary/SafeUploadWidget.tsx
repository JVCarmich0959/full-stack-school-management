"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

type UploadWidgetRenderProps = {
  open: () => void;
};

type SafeUploadWidgetProps = {
  uploadPreset: string;
  options?: Record<string, unknown>;
  signatureEndpoint?: string;
  onSuccess?: (result: any, meta: { widget: any }) => void;
  children: (props: UploadWidgetRenderProps) => ReactNode;
};

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
);

const CldUploadWidget = isConfigured
  ? dynamic(() =>
      import("next-cloudinary").then((mod) => mod.CldUploadWidget), {
        ssr: false,
      }
    )
  : null;

const SafeUploadWidget = ({
  uploadPreset,
  options,
  signatureEndpoint,
  onSuccess,
  children,
}: SafeUploadWidgetProps) => {
  if (!isConfigured || !CldUploadWidget) {
    return (
      <button
        type="button"
        className="text-xs text-gray-400 flex items-center gap-2 cursor-not-allowed"
        title="Cloudinary is not configured"
        disabled
      >
        <span>Upload unavailable</span>
      </button>
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={options}
      signatureEndpoint={signatureEndpoint}
      onSuccess={onSuccess}
    >
      {children}
    </CldUploadWidget>
  );
};

export default SafeUploadWidget;
