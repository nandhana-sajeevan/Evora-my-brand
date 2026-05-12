import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import api, { API } from "../../lib/api";
import { toast } from "sonner";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export function resolveUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // /api/files/... → prepend backend
  return `${BACKEND}${url}`;
}

/**
 * ImageUploader — uploads to /api/admin/upload and returns the public URL.
 * Supports single or multiple images.
 *
 * Props:
 *   value: string | string[]   (current image url(s))
 *   onChange: (next) => void
 *   multiple?: boolean
 *   testId?: string
 */
export default function ImageUploader({ value, onChange, multiple = false, testId = "image-uploader" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const images = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const { data } = await api.post("/admin/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push(data.url);
      }
      if (multiple) {
        onChange([...(value || []), ...uploaded]);
      } else {
        onChange(uploaded[0]);
      }
      toast("Image uploaded");
    } catch (e) {
      toast.error("Upload failed", { description: e.response?.data?.detail || e.message });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (i) => {
    if (multiple) {
      const next = [...value];
      next.splice(i, 1);
      onChange(next);
    } else {
      onChange("");
    }
  };

  return (
    <div data-testid={testId}>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-[3/4] bg-secondary border border-border group">
            <img src={resolveUrl(url)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              data-testid={`${testId}-remove-${i}`}
              onClick={() => removeAt(i)}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {(multiple || images.length === 0) && (
          <button
            type="button"
            data-testid={`${testId}-trigger`}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="aspect-[3/4] border border-dashed border-border hover:border-foreground transition-colors flex flex-col items-center justify-center gap-2 text-xs opacity-70 hover:opacity-100"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} strokeWidth={1.5} />}
            <span>{uploading ? "Uploading..." : "Upload"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />
    </div>
  );
}
