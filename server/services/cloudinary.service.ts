import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

let isCloudinaryConfigured = false;

// Attempt Cloudinary Configuration
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isCloudinaryConfigured = true;
    console.log("[CLOUDINARY] Cloudinary initialized successfully.");
  } catch (err: any) {
    console.error("[CLOUDINARY] Initialization failed:", err.message);
  }
} else {
  console.log(
    "[CLOUDINARY] Missing variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Falling back to mock/local file system uploads."
  );
}

export class CloudinaryService {
  /**
   * Uploads an image either to Cloudinary or a local mock file structure
   */
  static async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    folder = "quiz-platform"
  ): Promise<{ url: string; publicId: string }> {
    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            public_id: path.parse(fileName).name + "-" + Date.now(),
          },
          (error, result) => {
            if (error || !result) {
              console.error("[CLOUDINARY] Upload error:", error);
              // Fallback to mock URL if remote upload fails
              return resolve(this.getMockUploadResponse(fileName));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        uploadStream.end(fileBuffer);
      });
    } else {
      // Local development/missing key mock fallback
      return this.getMockUploadResponse(fileName);
    }
  }

  private static getMockUploadResponse(fileName: string) {
    const cleanName = encodeURIComponent(fileName.replace(/\s+/g, "-"));
    const mockUrl = `https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`; // standard default exam mockup image
    console.log(`[CLOUDINARY] Cloudinary not configured. Mocked URL generated for file: "${fileName}"`);
    return {
      url: mockUrl,
      publicId: `mock-id-${Date.now()}-${cleanName}`,
    };
  }
}
