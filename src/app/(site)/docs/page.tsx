import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { PageHead } from "@/components/ui";
import { Manual } from "@/components/docs/Manual";

export const metadata: Metadata = { title: "Manual", description: `How a ${BRAND.name} pair works: seats, difficulty, fees, rewards and risks.` };

export default function DocsPage() {
  return (
    <>
      <PageHead eyebrow="Instruction manual" title="How to play">
        Everything a pair goes through, from the lobby to the payout. Parts marked planned or draft describe the launch design and can still change.
      </PageHead>
      <Manual />
    </>
  );
}
