const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a single image file to Cloudinary using an unsigned upload
 * preset (configured in the Cloudinary dashboard, scoped to a
 * `mossain/` folder so assets stay organized per-client).
 *
 * Returns { url, publicId } on success.
 */
export async function uploadImageToCloudinary(file, folder = "mossain") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Upload gambar gagal.");
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * Builds a Cloudinary delivery URL with basic responsive transforms,
 * so cards/heroes never ship an oversized original.
 */
export function cld(url, { width, height, crop = "fill", quality = "auto", format = "auto" } = {}) {
  if (!url || !url.includes("/upload/")) return url;
  const transforms = [
    format && `f_${format}`,
    quality && `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ]
    .filter(Boolean)
    .join(",");
  return url.replace("/upload/", `/upload/${transforms}/`);
}
