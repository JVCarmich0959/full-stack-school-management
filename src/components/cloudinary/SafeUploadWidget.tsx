"use client";

import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import { useCallback } from "react";
import type { CldUploadWidgetResults } from "next-cloudinary";

type UploadWidgetRenderProps = {
  open: () => void;
};

type SafeUploadWidgetProps = {
  uploadPreset?: string;
  options?: Record<string, unknown>;
  signatureEndpoint?: string;
  onUpload?: (
    result: CldUploadWidgetResults,
    meta: { widget: { close: () => void } }
  ) => void;
  onError?: (message: string) => void;
  children: (props: UploadWidgetRenderProps) => ReactElement;
};

const CldUploadWidget = dynamic(
  () => import("next-cloudinary").then((mod) => mod.CldUploadWidget),
  { ssr: false },
);

const SafeUploadWidget = ({
  uploadPreset,
  options,
  signatureEndpoint,
  onUpload,
  onError,
  children,
}: SafeUploadWidgetProps) => {
  const resolvedPreset = uploadPreset ?? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const isConfigured = Boolean(
    resolvedPreset && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  );

  const handleError = useCallback(
    (message: string) => {
      console.error(message);
      onError?.(message);
    },
    [onError],
  );

  if (!isConfigured) {
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
      uploadPreset={resolvedPreset as string}
      options={options}
      signatureEndpoint={signatureEndpoint}
      onSuccess={(result, meta) => {
        if (result?.info) {
          onUpload?.(result, meta);
          return;
        }

        handleError("No upload info returned from Cloudinary.");
      }}
      onError={(error) => {
        const message =
          typeof error === "string" ? error : JSON.stringify(error ?? {});
        handleError(message);
      }}
    >
      {({ open }) => children({ open })}
    </CldUploadWidget>
  );
};

export default SafeUploadWidget;
