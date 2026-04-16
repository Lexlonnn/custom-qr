import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QRCodeEditor from "@/components/QRCodeEditor";
import { supabase } from "@/lib/supabase";

export default async function EditPage({
  params,
}: {
  params: Promise<{ editId: string }>;
}) {
  const { editId } = await params;

  const { data, error } = await supabase
    .from("qr_codes")
    .select("slug, destination_url, style_config, scan_count")
    .eq("edit_id", editId)
    .single();

  if (error || !data) {
    console.error("Fetch Error:", error);
    notFound();
  }

  return (
    <div className="flex flex-col min-h-[80vh] items-center py-10 animate-fade-in-up">
      <div className="w-full max-w-6xl mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition mb-6 font-medium bg-slate-100 dark:bg-slate-800/50 py-2 px-4 rounded-full text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit your QR Code</h1>
        <p className="text-slate-500">
          Make changes to your styling and destination URL in real-time.
        </p>
      </div>
      <QRCodeEditor editId={editId} initialData={data} />
    </div>
  );
}
