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
      console.log("Upload middleware - checking auth"); // Add logging
      const user = req.session?.passport?.user;
      if (!user) {
        throw new Error("Unauthorized");
      }

      return { userId: user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File details:", {
        url: file.url,
        name: file.name,
        size: file.size,
      });

      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;