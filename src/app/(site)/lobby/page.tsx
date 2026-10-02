import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { PageHead } from "@/components/ui";
import { Lobby } from "@/components/lobby/Lobby";

export const metadata: Metadata = { title: "Lobby", description: `Open a room or take a seat. 1P brings ETH, 2P brings ${BRAND.symbol}.` };

export default function LobbyPage() {
  return (
    <>
      <PageHead eyebrow={`Lobby · ${BRAND.ticker} / ETH`} title="Find your player 2">
        Open a room on a free memory card block, pick your seat and difficulty, and wait for a partner on the other side. Deposits stay closed until launch; everything
        else here works today.
      </PageHead>
      <Lobby />
    </>
  );
}
