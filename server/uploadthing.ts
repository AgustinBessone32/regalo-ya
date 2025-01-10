import { createUploadthing, type FileRouter } from "uploadthing/server";
import { type Request } from "express";
import { type Session } from "express-session";

// Add session to Request type
declare module "express" {
  interface Request {
    session: Session & {
      passport?: {
        user?: number;
      };
    };
  }
}

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Authorization check
      if (!req.session?.passport?.user) {
        throw new Error("Unauthorized - Please log in to upload images");
      }

      return { userId: req.session.passport.user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload completed for user:", metadata.userId);
        console.log("File details:", {
          name: file.name,
          size: file.size,
          key: file.key,
          url: file.url
        });

        if (!file.url) {
          throw new Error("No URL returned from upload");
        }

        return { 
          url: file.url,
          size: file.size,
          name: file.name
        };
      } catch (error) {
        console.error("Upload processing error:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;