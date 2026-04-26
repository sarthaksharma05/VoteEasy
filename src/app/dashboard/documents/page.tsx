"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, FileUp, Image as ImageIcon, Loader2, Trash2, Eye } from "lucide-react";

interface DocumentItem {
  id: string;
  category: string;
  name: string;
  date: string;
  status: "Verified" | "Pending" | "Rejected";
  type: "pdf" | "image";
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch("/api/documents", { credentials: "include" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load documents");
        }

        setDocuments(data.documents ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        category: "Extra Upload",
        name: file.name,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Pending",
        type: file.type.includes("image") ? "image" : "pdf",
      };
      setDocuments((prev) => [...prev, newDoc]);
      setUploadMessage("Extra uploads are shown locally for now. Verified registration documents are loaded from your submitted form.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const getStatusBadge = (status: DocumentItem["status"]) => {
    switch (status) {
      case "Verified":
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider">Verified</span>;
      case "Pending":
        return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider">Pending</span>;
      case "Rejected":
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1a1a]">My Documents</h1>
        <p className="mt-1 text-[15px] text-[#666]">Manage your securely stored identity documents.</p>
      </div>

      {uploadMessage && (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
          {uploadMessage}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-[10px] bg-white" style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Loader2 className="animate-spin text-[#f05a1a]" size={28} />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-[10px] p-10 text-center" style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="w-16 h-16 rounded-full bg-[#f5f0eb] flex items-center justify-center mx-auto mb-4">
            <FileText size={28} color="#999" />
          </div>
          <h3 className="text-[17px] font-semibold text-[#1a1a1a] mb-1">No documents yet</h3>
          <p className="text-[14px] text-[#888]">Once you submit registration documents, they will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-[10px] p-5 flex flex-col justify-between" style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[8px] bg-[#f5f0eb] flex items-center justify-center shrink-0">
                  {doc.type === "image" ? <ImageIcon size={24} color="#666" /> : <FileText size={24} color="#666" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#999]">{doc.category}</p>
                      <h3 className="text-[16px] font-semibold text-[#1a1a1a] truncate">{doc.name}</h3>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p className="text-[13px] text-[#666]">Uploaded {doc.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#e5e5e5]">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] bg-[#f5f0eb] text-[#1a1a1a] text-[13px] font-semibold opacity-60 cursor-not-allowed">
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-4">Upload New Document</h3>
        <div
          className="bg-white rounded-[10px] p-8 border-2 border-dashed border-[#d8d2cb] text-center hover:border-[#f05a1a] transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-full bg-[rgba(240,90,26,0.1)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#f05a1a] transition-colors">
            <FileUp size={24} className="text-[#f05a1a] group-hover:text-white transition-colors" />
          </div>
          <p className="text-[16px] font-medium text-[#1a1a1a] mb-1">Drop files here or click to browse</p>
          <p className="text-[13px] text-[#666]">Accepted formats: PDF, JPG, PNG - max 5MB</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      </div>
    </div>
  );
}

