"use client";

import React, { useState, useEffect } from "react";
import { logsAPI, LogFileDto } from "@/lib/api";
import { FileText, Eye, Trash2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LogsTab() {
  const [logFiles, setLogFiles] = useState<LogFileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [viewingLines, setViewingLines] = useState(250);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    loadLogFiles();
  }, []);

  const loadLogFiles = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getFiles();
      if (res.success && res.data) {
        setLogFiles(res.data);
      } else {
        toast.error("Günlük dosyaları yüklenirken hata oluştu");
      }
    } catch (err) {
      toast.error("Günlük dosyaları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const viewLogFile = async (fileName: string) => {
    setSelectedFile(fileName);
    setContentLoading(true);
    try {
      const res = await logsAPI.viewFile(fileName, viewingLines);
      if (res.success) {
        setLogContent(res.data || "");
      } else {
        toast.error("Günlük dosyası okunamadı");
      }
    } catch (err) {
      toast.error("Günlük dosyası okunurken hata oluştu");
    } finally {
      setContentLoading(false);
    }
  };

  const deleteLogFile = async (fileName: string) => {
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await logsAPI.deleteFile(fileName);
      if (res.success) {
        toast.success("Günlük dosyası başarıyla silindi");
        if (selectedFile === fileName) {
          setSelectedFile(null);
          setLogContent("");
        }
        loadLogFiles();
      } else {
        toast.error("Dosya silinirken hata oluştu");
      }
    } catch (err) {
      toast.error("Dosya silinirken bir hata oluştu");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Logs List */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Günlük Dosyaları</h3>
          </div>

          {logFiles.length === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto mb-2 text-slate-400" size={32} />
              <p className="text-sm text-slate-500">Günlük dosyası bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logFiles.map((file) => (
                <button
                  key={file.fileName}
                  onClick={() => viewLogFile(file.fileName)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFile === file.fileName
                      ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100"
                      : "hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <div className="text-sm font-medium truncate">{file.fileName}</div>
                  <div className="text-xs text-slate-500 mt-1">{formatFileSize(file.size)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logs Viewer */}
      <div className="lg:col-span-2">
        {selectedFile ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900 overflow-hidden flex flex-col h-[600px]">
            <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200">{selectedFile}</h3>
                <button
                  onClick={() => deleteLogFile(selectedFile)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors dark:bg-red-900 dark:text-red-200"
                >
                  <Trash2 size={16} />
                  Sil
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <label className="text-slate-600 dark:text-slate-400">Gösterilecek satır:</label>
                <select
                  value={viewingLines}
                  onChange={(e) => {
                    setViewingLines(Number(e.target.value));
                    if (selectedFile) viewLogFile(selectedFile);
                  }}
                  className="px-2 py-1 rounded border border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-zinc-800"
                >
                  <option value={100}>Son 100</option>
                  <option value={250}>Son 250</option>
                  <option value={500}>Son 500</option>
                  <option value={1000}>Son 1000</option>
                </select>
              </div>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-slate-50 dark:bg-zinc-950">
              {contentLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600"></div>
                </div>
              ) : logContent ? (
                <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {logContent}
                </pre>
              ) : (
                <div className="text-slate-500 text-center py-8">
                  İçerik boş veya yüklenirken bir hata oluştu
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-zinc-900">
            <Eye className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="text-slate-600 dark:text-slate-400">Görüntülemek için bir günlük dosyası seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}
