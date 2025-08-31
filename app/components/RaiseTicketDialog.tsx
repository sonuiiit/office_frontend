"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface RaiseTicketDialogProps {
  recordId: string;
  open: boolean;
  onClose: () => void;
}

const RaiseTicketDialog: React.FC<RaiseTicketDialogProps> = ({
  recordId,
  open,
  onClose,
}) => {
  const [ticketText, setTicketText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTicketText, setLoadingTicketText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔹 Fetch generated ticket text when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchTicketText = async () => {
      setLoadingTicketText(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/chat/get_create_ticket_data`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recordId }),
          }
        );
        const data = await res.json();
        if (res.ok && data.ticket_text) {
          setTicketText(data.ticket_text);
        }
      } catch (err) {
        console.error("Error fetching ticket text:", err);
      } finally {
        setLoadingTicketText(false);
      }
    };

    fetchTicketText();
  }, [open, recordId]);

  // Upload file and return its link
  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/file/upload_and_return_link`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      return data.file_url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!ticketText.trim()) return alert("Please enter issue description");
    setLoading(true);

    try {
      const uploadedLinks = await Promise.all(
        files.map((file) => uploadFile(file))
      );
      const validLinks = uploadedLinks.filter((link): link is string => !!link);

      const payload = {
        recordId,
        ticket_text: ticketText,
        ticket_files: validLinks,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/chat/create_ticket`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.status || "Ticket created"}`);
        onClose();
        setTicketText("");
        setFiles([]);
      } else {
        alert(`❌ Failed: ${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error while raising ticket");
    } finally {
      setLoading(false);
    }
  };

  // Trigger hidden input
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!p-6 !m-4 max-w-xl !space-y-6 !rounded-xl">
        <DialogHeader>
          <DialogTitle className="!text-lg !font-semibold">
            Raise a Ticket
          </DialogTitle>
        </DialogHeader>

        {/* Description */}
        <Textarea
          placeholder="Describe your issue..."
          value={loadingTicketText ? "⏳ Generating ticket text..." : ticketText}
          onChange={(e) => setTicketText(e.target.value)}
          rows={5}
          disabled={loadingTicketText}
          className="w-full !min-h-[100px] !p-3 !m-1"
        />

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="hidden"
        />

        {/* Upload Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleFileButtonClick}
          className="w-full !border-dashed !border-2 !py-6 !px-3 !m-1 !text-blue-600 hover:!bg-blue-50"
        >
          📂 Upload files
        </Button>

        {/* Preview Selected Files */}
        {files.length > 0 && (
          <div className="!space-y-2 !mt-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between !p-2 !rounded !border !bg-gray-50"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="!w-10 !h-10 !rounded object-cover !border"
                  />
                ) : (
                  <span className="!text-lg">📄</span>
                )}

                <div className="flex-1 !ml-3 truncate">
                  <p className="!text-sm !font-medium truncate">{file.name}</p>
                  <p className="!text-xs !text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="!text-red-500 hover:!text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 !mt-4">
          <Button
            variant="outline"
            onClick={() => onClose()}
            className="!px-6 !py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || loadingTicketText}
            className="!px-8 !py-2 !bg-green-600 !text-white hover:!bg-green-700"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseTicketDialog;
