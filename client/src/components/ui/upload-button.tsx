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
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete,
    onUploadError,
  });

  const handleFileSelect = useCallback(
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

  const handleButtonClick = () => {
    // Programmatically trigger file input click
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="w-full">
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <Button 
        type="button"
        variant="outline" 
        className="w-full" 
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        {isUploading ? "Subiendo..." : "Subir Imagen"}
      </Button>
    </div>
  );
}