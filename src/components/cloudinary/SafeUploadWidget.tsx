"use client";

import { CldUploadWidget, CldUploadWidgetResults } from "next-cloudinary";
import { ReactNode, useCallback } from "react";

export type SafeUploadWidgetProps = {
  uploadPreset?: string;
  onUpload: (
    result: CldUploadWidgetResults,
    widget: { close: () => void }
  ) => void;
  children: (options: { open: () => void }) => ReactNode;
  onError?: (message: string) => void;
};

const SafeUploadWidget = ({
  uploadPreset,
  onUpload,
  children,
  onError,
}: SafeUploadWidgetProps) => {
  const resolvedPreset =
    uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleError = useCallback(
    (message: string) => {
      console.error(message);
      onError?.(message);
    },
    [onError]
  );

  if (!resolvedPreset) {
    const disabledOpen = () =>
      handleError("Cloudinary upload preset is not configured.");

    return <>{children({ open: disabledOpen })}</>;
  }

  return (
    <CldUploadWidget
      uploadPreset={resolvedPreset}
      onSuccess={(result, { widget }) => {
        if (result?.info) {
          onUpload(result, widget);
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
      {({ open }) => <>{children({ open })}</>}
    </CldUploadWidget>
  );
};

export default SafeUploadWidget;
