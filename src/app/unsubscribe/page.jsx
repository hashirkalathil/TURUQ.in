"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserMinus, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    if (email) {
      const performUnsubscribe = async () => {
        try {
          const res = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            setStatus("success");
          } else {
            setStatus("error");
          }
        } catch (error) {
          setStatus("error");
        }
      };
      performUnsubscribe();
    } else {
      setStatus("error");
    }
  }, [email]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-background">
      <div className="max-w-md w-full text-center space-y-8 p-10 lg:p-16 rounded-[40px] border border-black bg-[#ffedd9] shadow-2xl">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-200 rounded-full animate-pulse">
               <UserMinus size={40} className="text-gray-500" />
            </div>
            <h1 className="text-2xl font-oswald font-bold uppercase">Processing...</h1>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-oswald font-bold text-black uppercase">Unsubscribed</h1>
              <p className="text-lg font-rachana text-black/70">
                You have been successfully removed from our mailing list. We're sorry to see you go!
              </p>
            </div>
            <Link href="/" className="inline-block px-8 py-3 bg-red-600 text-white font-oswald font-bold rounded-full hover:bg-red-700 transition-colors">
              BACK TO HOME
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 animate-in shake duration-500">
            <div className="flex justify-center">
              <AlertCircle size={80} className="text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-oswald font-bold text-black uppercase">Oops!</h1>
              <p className="text-lg font-rachana text-black/70">
                We couldn't process your request. The link might be invalid or expired.
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <p className="text-sm font-poppins text-black/50">
                If you're still receiving emails, please contact us directly.
              </p>
              <Link href="/" className="inline-block px-8 py-3 border border-black text-black font-oswald font-bold rounded-full hover:bg-black hover:text-white transition-all">
                GO HOME
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
