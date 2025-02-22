import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../../../server/uploadthing";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type UploadButtonProps = {
  endpoint: keyof OurFileRouter;
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  onUploadBegin?: () => void;
};

export function UploadButton({
  endpoint,
  onClientUploadComplete,
  onUploadError,
  onUploadBegin
}: UploadButtonProps) {
  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(endpoint, {
    onClientUploadComplete,
    onUploadError,
  });

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      try {
        onUploadBegin?.();
        await startUpload(Array.from(files));
      } catch (err) {
        onUploadError?.(err as Error);
      }
    },
    [startUpload, onUploadError, onUploadBegin]
  );

  return (
    <Button variant="outline" className="w-full relative" disabled={isUploading}>
      <label className="absolute inset-0 cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept={permittedFileInfo?.config?.accept ? 
            permittedFileInfo.config.accept.join(",") : 
            "image/*"}
          onChange={onChange}
          disabled={isUploading}
        />
        <span className="flex items-center justify-center w-full h-full">
          {isUploading ? "Subiendo..." : "Subir Imagen"}
        </span>
      </label>
    </Button>
  );
}