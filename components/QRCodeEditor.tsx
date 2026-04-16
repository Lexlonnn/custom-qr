"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Download, RefreshCw, Eye, Settings, Link as LinkIcon, BarChart } from "lucide-react";

interface QRCodeEditorProps {
  editId: string;
  initialData: {
    slug: string;
    destination_url: string;
    scan_count: number;
    style_config: any;
  };
}

export default function QRCodeEditor({ editId, initialData }: QRCodeEditorProps) {
  const [url, setUrl] = useState(initialData.destination_url);
  const [slug, setSlug] = useState(initialData.slug);
  const [dotsColor, setDotsColor] = useState(initialData.style_config?.dotsOptions?.color || "#0f172a");
  const [bgColor, setBgColor] = useState(initialData.style_config?.backgroundOptions?.color || "#ffffff");
  const [dotsType, setDotsType] = useState(initialData.style_config?.dotsOptions?.type || "rounded");
  const [logo, setLogo] = useState<string | null>(initialData.style_config?.image || null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [slugError, setSlugError] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<any>(null);

  const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`;

  // Initialize QR
  useEffect(() => {
    // We dynamically load QRCodeStyling to avoid SSR canvas issues just in case, but it's safe to use locally if handled well.
    qrCode.current = new QRCodeStyling({
      width: 300,
      height: 300,
      data: publicLink,
      image: logo || undefined,
      dotsOptions: {
        color: dotsColor,
        type: dotsType as any,
      },
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.current.append(qrRef.current);
    }
  }, []);

  // Update QR on state change
  useEffect(() => {
    if (!qrCode.current) return;

    qrCode.current.update({
      data: publicLink,
      image: logo || undefined,
      dotsOptions: {
        color: dotsColor,
        type: dotsType as any,
      },
      backgroundOptions: {
        color: bgColor,
      }
    });
  }, [publicLink, dotsColor, bgColor, dotsType, logo]);

  const handleDownload = (ext: "png" | "svg") => {
    if (qrCode.current) {
      qrCode.current.download({ extension: ext, name: `dynamic-qr-${initialData.slug}` });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");

    if (!slug || slug.trim().length === 0) {
      setSlugError(true);
      setSaveMessage("Error: Custom link cannot be empty.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/update/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug !== initialData.slug ? slug : undefined,
          destination_url: url,
          style_config: {
            dotsOptions: { color: dotsColor, type: dotsType },
            backgroundOptions: { color: bgColor },
            image: logo
          }
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.includes('taken')) {
          setSlugError(true);
        }
        throw new Error(data.error || "Failed to save differences.");
      }

      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      setSaveMessage("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">

      {/* Left Pane: Configurator */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-2 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="text-blue-500" /> Configuration
          </h2>
          <div className="text-sm font-medium flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">
            <BarChart size={16} />
            {initialData.scan_count} Scans
          </div>
        </div>

        <div>
          <label className="label-base flex items-center gap-2">
            <LinkIcon size={16} /> Destination URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-base"
          />
          <p className="text-xs text-slate-500 mt-2">
            This is where users will go when they scan your QR code.
          </p>
        </div>

        <div className="flex flex-col justify-end">
          <div className="relative flex items-center">
            <span className={`absolute left-4 pointer-events-none text-sm font-medium ${slugError ? "text-red-500" : "text-slate-400"}`}>
              /
            </span>
            <input
              type="text"
              placeholder="custom-link"
              value={slug}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
                setSlug(val);
                setSaveMessage(""); // clear errors so they can save newly typed keys
                setSlugError(false);
              }}
              className={`input-base pl-8 ${slugError ? "text-red-500 border-red-500 ring-red-500" : ""}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">Dots Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={dotsColor}
                onChange={(e) => setDotsColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-sm font-mono text-slate-600">{dotsColor}</span>
            </div>
          </div>
          <div>
            <label className="label-base">Background</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-sm font-mono text-slate-600">{bgColor}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="label-base">Dot Style</label>
          <select
            value={dotsType}
            onChange={(e) => setDotsType(e.target.value)}
            className="input-base"
          >
            <option value="square">Square</option>
            <option value="dots">Dots</option>
            <option value="rounded">Rounded</option>
            <option value="classy">Classy</option>
            <option value="classy-rounded">Classy Rounded</option>
            <option value="extra-rounded">Extra Rounded</option>
          </select>
        </div>

        <div>
          <label className="label-base">Center Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-400"
          />
          {logo && (
            <button onClick={() => setLogo(null)} className="text-sm text-red-500 mt-2 hover:underline">
              Remove Logo
            </button>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'} font-medium`}>
            {saveMessage}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Right Pane: Preview */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 -z-10" />

        <div className="mb-8 w-full flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="text-indigo-500" /> Preview
          </h2>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-xl mb-8 border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 duration-300">
          <div ref={qrRef} className="rounded-xl overflow-hidden" />
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl w-full max-w-sm mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Public Code Link</p>
          <p className="font-mono text-sm break-all font-medium text-blue-600 dark:text-blue-400 selection:bg-blue-200">
            {publicLink}
          </p>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={() => handleDownload('png')}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Download size={18} /> PNG
          </button>
          <button
            onClick={() => handleDownload('svg')}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Download size={18} /> SVG
          </button>
        </div>
      </div>
    </div>
  );
}
