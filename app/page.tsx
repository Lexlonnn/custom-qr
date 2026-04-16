"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, ArrowRight, Link as LinkIcon, Loader2, Camera, Lock } from "lucide-react";
import ScannerModal from "@/components/ScannerModal";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [passcode, setPasscode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugError, setSlugError] = useState(false);

  const [showScanner, setShowScanner] = useState(false);

  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }

    if (passcode.length !== 4 || !/^\d+$/.test(passcode)) {
      setError("Passcode must be exactly 4 digits.");
      return;
    }

    try {
      new URL(url); // validate URL format client side
    } catch (err) {
      setError("Invalid URL format. Include http:// or https://");
      return;
    }

    setLoading(true);
    setError("");
    setSlugError(false);

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_url: url,
          custom_slug: customSlug || undefined,
          passcode: passcode
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'Custom Short Link is already taken') {
          setSlugError(true);
        }
        throw new Error(data.error || "Failed to generate");
      }

      // Redirect to edit page
      router.push(`/edit/${data.edit_id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 relative">
      {/* Top Right "Scan to Edit" button */}
      <div className="absolute top-0 right-0 p-4">
        <button
          onClick={() => setShowScanner(true)}
          className="btn-secondary py-2 px-4 flex items-center gap-2 rounded-full text-sm shadow-md"
        >
          <Camera size={16} /> Scan to Edit
        </button>
      </div>

      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 shadow-inner">
          <QrCode size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Dynamic QR Studio
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-2">
          Create trackable, customizable, and editable QR codes in seconds.
        </p>
      </div>

      <div className="w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleGenerate} className="glassmorphism rounded-3xl p-6 md:p-8 flex flex-col gap-5">

          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
            <Lock size={18} className="mt-0.5 shrink-0" />
            <div>
              <strong>How it works:</strong> Create a secret Passcode below. Later, if you need to update where your QR code points, just click <strong>Scan to Edit</strong> and enter your passcode.
            </div>
          </div>

          <div>
            <label className="label-base flex items-center gap-2">
              <LinkIcon size={16} /> Destination URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://your-website.com"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                className="input-base"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-base flex items-center gap-2">
                <span className={slugError ? "text-red-500" : ""}>Custom Short Link</span> <span className="text-slate-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="/your-word"
                  value={customSlug}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
                    setCustomSlug(val);
                    setError("");
                    setSlugError(false);
                  }}
                  className={`input-base pl-8 text-sm ${slugError ? "text-red-500 border-red-500" : ""}`}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="label-base flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} /> Passcode <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="password"
                placeholder="4-digit PIN"
                value={passcode}
                maxLength={4}
                pattern="\d*"
                onChange={(e) => {
                  // Only allow numbers
                  const val = e.target.value.replace(/\D/g, '');
                  setPasscode(val);
                  setError("");
                }}
                className="input-base text-sm tracking-widest"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">Exactly 4 numbers allowed.</p>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center font-medium animate-pulse text-sm bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 h-14 w-full flex items-center justify-center gap-2 text-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : "Generate Secure QR"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>

      {showScanner && <ScannerModal onClose={() => setShowScanner(false)} />}
    </div>
  );
}
