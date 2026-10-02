import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { Arcade } from "@/components/arcade/Arcade";

export const metadata: Metadata = { title: "Arcade", description: "Mini-games to play while the lobby finds your partner." };

export default function ArcadePage() {
  return (
    <>
      <PageHead eyebrow="Arcade · while you wait" title="Insert coin">
        Waiting for player 2 should not feel like waiting. Pick up a cartridge and play; your room keeps its place in the lobby.
      </PageHead>
      <Arcade />
    </>
  );
}
