import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { PageHead } from "@/components/ui";
import { Draw } from "@/components/draw/Draw";

export const metadata: Metadata = { title: "Draw", description: `Free pre-launch lottery for ${BRAND.symbol} allocations. One signed message per wallet.` };

export default function DrawPage() {
  return (
    <>
      <PageHead eyebrow={`${BRAND.symbol} draw · pre-launch`} title="One wallet, one ticket">
        A free lottery for {BRAND.symbol} allocations before launch. You sign a message, you never send a transaction.
      </PageHead>
      <Draw />
    </>
  );
}
