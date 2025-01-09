import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../../../server/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

type UploadButtonProps = {
  endpoint: keyof OurFileRouter;
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
};

export function UploadButton({
  endpoint,
  onClientUploadComplete,
  onUploadError
}: UploadButtonProps) {
  const { startUpload, permittedFileInfo } = useUploadThing(endpoint, {
    onClientUploadComplete,
    onUploadError,
  });

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      try {
        await startUpload(Array.from(files));
      } catch (err) {
        onUploadError?.(err as Error);
      }
    },
    [startUpload, onUploadError]
  );

  return (
    <Button variant="outline" className="w-full" asChild>
      <label>
        <input
          type="file"
          className="hidden"
          accept={permittedFileInfo?.config?.accept?.join(",")}
          onChange={onChange}
        />
        Subir Imagen
      </label>
    </Button>
  );
}