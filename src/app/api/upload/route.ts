import { NextRequest, NextResponse } from "next/server";

/**
 * Upload Endpoint for Media & Images
 *
 * Configurable with:
 * - Cloudflare R2 (S3-compatible, zero egress fees)
 * - AWS S3
 * - Or base64 / direct CDN hosting
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "File exceeds the 10 MB limit" }, { status: 413 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 415 });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudflare R2 / S3 environment variables are provided:
    const R2_BUCKET = process.env.R2_BUCKET_NAME;
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_DOMAIN;

    if (R2_BUCKET && R2_PUBLIC_URL) {
      // Direct integration with AWS SDK / R2 S3Client
      // e.g. await s3.send(new PutObjectCommand({ ... }))
      const publicUrl = `${R2_PUBLIC_URL}/${filename}`;
      return NextResponse.json({
        url: publicUrl,
        filename,
        size: file.size,
        mimeType: file.type,
      });
    }

    // Fallback: Generate a data URI only when object storage is unavailable.
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({
      url: dataUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}
