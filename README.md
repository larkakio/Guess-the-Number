# Neon Cipher — Guess the Number (Base)

Mobile-first **Guess the Number** game with swipe controls, daily on-chain **check-in** on Base, and **ERC-8021** builder attribution via `ox`.

## Structure

- `web/` — Next.js App Router (Vercel **Root Directory** = `web`)
- `contracts/` — Foundry: `CheckIn.sol`

## Commands

```bash
cd web && npm install && npm run build
cd ../contracts && forge test
```

Deploy the contract (set an RPC URL and private key via Foundry env), then set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` and other `NEXT_PUBLIC_*` variables from `web/.env.example`.

**Deployed CheckIn (Base mainnet):** `0x68cece54F672dCdD470aAC02372d96452a5087a3` — already referenced in `web/.env.example` and `web/.env.local`.

**Production app:** [https://guess-the-number-self-eight.vercel.app](https://guess-the-number-self-eight.vercel.app) · Base App ID `69dcab4bed56423f0cd3e6ea` (meta `base:app_id` via `NEXT_PUBLIC_BASE_APP_ID`).

## Requirements summary

See `PROMPT.md` in the parent Downloads folder for full product requirements (Base.dev app id, builder code, meta tag, no `msg.value` on check-in, JPG icon/thumbnail constraints).
