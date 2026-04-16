"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Lock, Loader2, QrCode } from "lucide-react";

interface ScannerModalProps {
  onClose: () => void;
}

export default function ScannerModal({ onClose }: ScannerModalProps) {
  const router = useRouter();
  const [scannedSlug, setScannedSlug] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const urlString = result[0].rawValue;
      try {
        const url = new URL(urlString);
        // Extract slug assuming format is domain.com/{slug}
        if (!url.pathname.startsWith('/edit') && !url.pathname.startsWith('/api') && url.pathname.length > 1) {
          const extractedSlug = url.pathname.replace('/', '');
          setScannedSlug(extractedSlug);
        } else {
          setError("This is not a valid Dynamic QR Studio code.");
        }
      } catch {
        setError("Invalid QR code format.");
      }
    }
  };

  const handleAuth = async () => {
    if (!passcode || passcode.length < 4) {
      setError("Please enter a valid passcode (min 4 chars)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: scannedSlug, passcode })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Navigate to the edit view for this QR!
      router.push(`/edit/${data.edit_id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative border border-white/20">
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <QrCode size={20} className="text-blue-500" />
            Scan to Edit
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-grow flex flex-col items-center">
          {!scannedSlug ? (
            <div className="w-full">
              <p className="text-center text-sm text-slate-500 mb-4">
                Point your camera at your generated QR code.
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-square max-h-[300px]">
                <Scanner 
                  onScan={handleScan}
                  formats={['qr_code']}
                  components={{
                    onOff: true,
                    torch: true,
                    zoom: true,
                    finder: true
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' }
                  }}
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center mt-4 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">{error}</p>}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-fade-in-up">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Lock size={32} />
              </div>
              <h4 className="text-lg font-semibold mb-2">QR Scanned!</h4>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Found slug: <span className="font-mono font-bold">{scannedSlug}</span>. <br/>
                Enter your 4-digit passcode to edit.
              </p>

              <input
                type="password"
                placeholder="4-Digit PIN"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError("");
                }}
                className="input-base text-center text-xl tracking-widest mb-4"
                maxLength={10}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
              
              <button 
                onClick={handleAuth}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Unlock Editor"}
              </button>

              {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
              
              <button 
                onClick={() => { setScannedSlug(null); setError(""); setPasscode(""); }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-sm mt-6"
              >
                Scan a different code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
