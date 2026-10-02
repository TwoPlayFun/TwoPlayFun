# Two Play

**Two players. One pool. Real earnings.**
Co-op liquidity on Robinhood Chain where two players pool together.

Website: [twoplay.fun](https://twoplay.fun) · X: [@twoplayfun](https://x.com/twoplayfun) · Source: [GitHub](https://github.com/TwoPlayFun/TwoPlayFun) · Token: `$TWOPLAY`

## The problem

Providing liquidity is a single-player grind. To open a pool position you need both sides of the pair, so an ETH holder has to buy the token first and a token holder has to buy ETH first. New tokens struggle to find that second side, and the people who could supply it never meet. While you wait for anything to happen, there is nothing to do.

## The solution

Two Play turns a liquidity position into a co-op game:

- **Player 1 brings ETH, Player 2 brings the token.** Each player only deposits the asset they already hold.
- **The lobby matches them.** Both pick the same difficulty (price range): Casual (full range), Standard (wide band) or Expert (tight band).
- **Together they open one pair on Robinhood Chain.** Each seat records what it brought, and both seats earn the pool's trading fees plus `$TWOPLAY` rewards.
- **Waiting is part of the game.** The Arcade has mini-games to play until player 2 shows up.
- **The Draw** is a free pre-launch lottery for `$TWOPLAY` allocations: one signed message per wallet, no gas.

## What you can try

Live today:

- **Connect wallet**: any EVM wallet that supports custom networks (MetaMask, Rabby, OKX, Coinbase Wallet and others). Robinhood Chain is added to the wallet on connect.
- **Lobby** (`/lobby`): open a room, pick your seat and difficulty, or take the open seat in someone else's room. Amounts are checked against your real ETH balance on Robinhood Chain. Rooms are kept in your browser in this preview, so you can play both seats by switching accounts in your wallet.
- **Arcade** (`/arcade`): *Pair Drop*, a playable mini-game (keyboard or touch).
- **Manual** (`/docs`): how seats, difficulty, fees, rewards and risks work.
- **Draw** (`/draw`): sign one free message and get a ticket code; eligibility is read live from the chain.
- Live chain data on the home page (latest block, gas).

Coming at launch:

- Deposits into the lobby contract and on-chain pairs (the deposit button reads "Opens at launch").
- Matching across devices, seat swaps, fee and reward payouts.
- The public draw entry list and a shared arcade leaderboard.
- The `$TWOPLAY` contract address.

## Run it locally

Requirements: Node.js 20 or newer and npm.

1. Download ZIP or fork this repository, then open a terminal in its folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build and start:

   ```bash
   npm run build
   npm start
   ```

4. Open http://localhost:4810

Environment variables are optional; the site runs without any. To use them, copy `.env.example` to `.env.local` and fill in what you need:

| Variable | Purpose | Format |
|---|---|---|
| `ROBINHOOD_RPC_URL` | Private Robinhood Chain RPC used by the server-side relay (`/api/rpc`). Empty uses the public RPC. | Full HTTPS URL, e.g. from your RPC provider's dashboard |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Enables the WalletConnect option in the wallet dialog. | 32-character project id from cloud.reown.com |

On Vercel, set the same names under Project → Settings → Environment Variables and redeploy.

## Network in your wallet

The site adds the network for you on connect. To add it by hand:

| Field | Value |
|---|---|
| Network name | Robinhood Chain |
| Chain ID | 4663 |
| Currency symbol | ETH |
| RPC URL | https://rpc.mainnet.chain.robinhood.com |
| Block explorer | https://robinhoodchain.blockscout.com |

## Project layout

```
src/
  app/                 routes: / (home), /lobby, /arcade, /docs, /draw, /api/rpc
  components/
    arcade/            Pair Drop game and the arcade page
    lobby/             room grid, seats and pairing flow
    docs/              the manual
    draw/              signing flow and ticket
    wallet/            wallet provider, connect dialog, account menu
    site/              header, footer, boot screen
  config/
    brand.ts           name, links, chain settings and the token contract address
    game.ts            seats, difficulty levels and shared constants
    wallets.ts         wallets offered in the connect dialog
  lib/                 RPC helpers and the lobby room store
public/                logos and wallet icons (.webp)
```

## Token contract

`$TWOPLAY` on Robinhood Chain: **published at launch.**

The address is set in one place, `src/config/brand.ts` (`CA`). Until it holds a real `0x` address, the copy buttons in the header and footer stay disabled and read "Published at launch". Official announcements come only from [@twoplayfun](https://x.com/twoplayfun).

---

Pre-launch preview. No deposits are accepted yet and nothing here is financial advice. Pools carry smart contract and price risk.
