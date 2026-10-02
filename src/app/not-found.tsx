import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <>
    <SiteHeader />
    <main className="wrap grid grid-cols-1 min-h-[60vh] place-items-center py-20">
      <div className="crt w-full max-w-[520px] p-8 text-center">
        <p className="font-pixel text-[12px] uppercase text-phos-dim">Error 404</p>
        <p className="h-display mt-3 text-[34px] text-phos">No data on this block</p>
        <p className="mt-3 text-[15px] text-phos-dim">The page you were looking for is not on this memory card.</p>
        <Link href="/" className="btn mt-6">
          Back to start
        </Link>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
