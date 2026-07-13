import React, { useState, useRef } from "react";
import { Upload, File, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FileUploaderProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  allowedTypes?: "image" | "docx" | "both";
  label?: string;
  className?: string;
}

export default function FileUploader({
  onUploadSuccess,
  allowedTypes = "both",
  label = "Upload file to Cloudinary",
  className = ""
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptAttribute = () => {
    if (allowedTypes === "image") return "image/*";
    if (allowedTypes === "docx") return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return "image/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setErrorMsg("File size exceeds the 10MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMsg("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const fileType = file.name.endsWith(".docx") ? "docx" : "image";

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            file: base64Data,
            fileName: file.name,
            fileType
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setUploadStatus("success");
          onUploadSuccess(data.url, file.name);
        } else {
          throw new Error(data.error || "Failed to upload file");
        }
      };
      reader.onerror = () => {
        throw new Error("Failed to read local file");
      };
    } catch (err: any) {
      console.error("Uploader error:", err);
      setUploadStatus("error");
      setErrorMsg(err.message || "Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAcceptAttribute()}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className={`w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-dashed rounded-xl text-xs font-semibold cursor-pointer transition-all duration-250 ${
          isUploading
            ? "bg-slate-50 border-slate-300 text-slate-400 cursor-not-allowed"
            : uploadStatus === "success"
            ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            : uploadStatus === "error"
            ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
            : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-600"
        }`}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : uploadStatus === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : uploadStatus === "error" ? (
          <AlertCircle className="w-4 h-4 text-rose-600" />
        ) : allowedTypes === "image" ? (
          <ImageIcon className="w-4 h-4 text-slate-500" />
        ) : (
          <Upload className="w-4 h-4 text-slate-500" />
        )}
        <span>{isUploading ? "Uploading to Cloudinary..." : label}</span>
      </button>

      {uploadStatus === "error" && (
        <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 pl-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
