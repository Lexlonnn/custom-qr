import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dynamic QR Studio",
  description: "Create, customize, and track your dynamic QR codes seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GithubIcon = ({ size = 24 }: { size?: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className="lucide lucide-github"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );

  return (
    <html lang="en">
      <head>
        <meta name="author" content="Lexlonnn" />
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("%c System initialized. Built by Lexlonnn. ", "color: #00ff00; font-weight: bold; background: #000000; padding: 4px; font-family: monospace;");`,
          }}
        />
      </head>
      <body className={`${outfit.className} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative min-h-screen flex flex-col`}>
        {/* Abstract background blobs for modern look */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <main className="container mx-auto px-4 py-8 relative z-0 flex-grow">
          {children}
        </main>

        {/* Footer Branding */}
        <footer className="w-full py-8 flex justify-center items-center z-50">
          <a 
            href="https://github.com/Lexlonnn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 shadow-lg shadow-blue-500/25 px-5 py-2.5 rounded-full ring-2 ring-white/20"
          >
            <GithubIcon size={16} /> Made by Lexlonnn
          </a>
        </footer>
      </body>
    </html>
  );
}
