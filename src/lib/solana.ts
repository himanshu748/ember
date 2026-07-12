import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Solana layer. Two primitives:
 *
 * 1. attestOnChain — Memo-program attestation (eulogy stones).
 * 2. Pledge stakes — every revival pledge gets its OWN on-chain account
 *    (derived with createAccountWithSeed from the vault + session id) holding
 *    a real stake. Checking in "I did it" settles the stake into the public
 *    Rekindled Pool with a fulfillment memo in the same transaction, so the
 *    commitment and its outcome are both addressable objects on chain, not
 *    log lines. Devnet demo of the mechanic; a mainnet version would swap the
 *    app vault for a wallet-signed escrow program.
 *
 * Judges need no wallet. If devnet is unavailable, we return an honestly
 * labelled simulated result so the flow never dead-ends.
 */

const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
const VAULT_FILE = path.join(process.cwd(), ".data", "vault.json");
const RPC = process.env.SOLANA_RPC || "https://api.devnet.solana.com";
const STAKE_LAMPORTS = 10_000_000; // 0.01 SOL at stake per pledge

export interface PledgeResult {
  tx: string;
  simulated: boolean;
  explorer: string | null;
  stakeAddress?: string;
  stakeExplorer?: string;
  stakeLamports?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadVault(web3: any) {
  if (process.env.SOLANA_VAULT_KEY) {
    return web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SOLANA_VAULT_KEY)));
  }
  if (fs.existsSync(VAULT_FILE)) {
    return web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(VAULT_FILE, "utf8"))));
  }
  const vault = web3.Keypair.generate();
  try {
    fs.mkdirSync(path.dirname(VAULT_FILE), { recursive: true });
    fs.writeFileSync(VAULT_FILE, JSON.stringify([...vault.secretKey]));
  } catch {
    /* read-only fs — ephemeral vault */
  }
  return vault;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function memoIx(web3: any, vaultPub: any, memo: object) {
  return new web3.TransactionInstruction({
    keys: [{ pubkey: vaultPub, isSigner: true, isWritable: false }],
    programId: new web3.PublicKey(MEMO_PROGRAM),
    data: Buffer.from(JSON.stringify(memo), "utf8"),
  });
}

const stakeSeed = (sessionId: string) => ("pledge:" + sessionId).slice(0, 32);
const POOL_SEED = "ember:rekindled-pool";

function simulated(memo: object): PledgeResult {
  const hash = crypto.createHash("sha256").update(JSON.stringify(memo)).digest("hex");
  return { tx: `SIMULATED-${hash.slice(0, 32)}`, simulated: true, explorer: null };
}

/** Eulogy stones and fallback attestations: memo only. */
export async function attestOnChain(memo: object): Promise<PledgeResult> {
  try {
    const web3 = await import("@solana/web3.js");
    const conn = new web3.Connection(RPC, "confirmed");
    const vault = await loadVault(web3);
    if ((await conn.getBalance(vault.publicKey)) < 10_000) throw new Error("vault unfunded");
    const tx = new web3.Transaction().add(memoIx(web3, vault.publicKey, memo));
    const sig = await web3.sendAndConfirmTransaction(conn, tx, [vault]);
    return { tx: sig, simulated: false, explorer: `https://explorer.solana.com/tx/${sig}?cluster=devnet` };
  } catch (e) {
    console.error("Attestation unavailable, simulated:", e);
    return simulated(memo);
  }
}

/** Revival pledges: create the pledge's own on-chain account holding a stake. */
export async function createPledgeStake(sessionId: string, memo: object): Promise<PledgeResult> {
  try {
    const web3 = await import("@solana/web3.js");
    const conn = new web3.Connection(RPC, "confirmed");
    const vault = await loadVault(web3);
    const seed = stakeSeed(sessionId);
    const stakeAddr = await web3.PublicKey.createWithSeed(vault.publicKey, seed, web3.SystemProgram.programId);

    const existing = await conn.getBalance(stakeAddr);
    if (existing > 0) {
      return {
        tx: "EXISTING", simulated: false, explorer: null,
        stakeAddress: stakeAddr.toBase58(),
        stakeExplorer: `https://explorer.solana.com/address/${stakeAddr.toBase58()}?cluster=devnet`,
        stakeLamports: existing,
      };
    }
    if ((await conn.getBalance(vault.publicKey)) < STAKE_LAMPORTS + 10_000) throw new Error("vault unfunded");

    const tx = new web3.Transaction().add(
      web3.SystemProgram.createAccountWithSeed({
        fromPubkey: vault.publicKey,
        basePubkey: vault.publicKey,
        seed,
        newAccountPubkey: stakeAddr,
        lamports: STAKE_LAMPORTS,
        space: 0,
        programId: web3.SystemProgram.programId,
      }),
      memoIx(web3, vault.publicKey, memo)
    );
    const sig = await web3.sendAndConfirmTransaction(conn, tx, [vault]);
    return {
      tx: sig,
      simulated: false,
      explorer: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
      stakeAddress: stakeAddr.toBase58(),
      stakeExplorer: `https://explorer.solana.com/address/${stakeAddr.toBase58()}?cluster=devnet`,
      stakeLamports: STAKE_LAMPORTS,
    };
  } catch (e) {
    console.error("Stake creation unavailable, simulated:", e);
    return simulated(memo);
  }
}

/** Check-in "I did it": settle the stake into the public Rekindled Pool. */
export async function settlePledgeStake(sessionId: string, memo: object): Promise<PledgeResult> {
  try {
    const web3 = await import("@solana/web3.js");
    const conn = new web3.Connection(RPC, "confirmed");
    const vault = await loadVault(web3);
    const seed = stakeSeed(sessionId);
    const stakeAddr = await web3.PublicKey.createWithSeed(vault.publicKey, seed, web3.SystemProgram.programId);
    const pool = await web3.PublicKey.createWithSeed(vault.publicKey, POOL_SEED, web3.SystemProgram.programId);

    const lamports = await conn.getBalance(stakeAddr);
    if (lamports === 0) {
      // Pre-stake pledge (or already settled): fall back to a fulfillment memo.
      return attestOnChain(memo);
    }
    const tx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: stakeAddr,
        basePubkey: vault.publicKey,
        toPubkey: pool,
        lamports,
        seed,
        programId: web3.SystemProgram.programId,
      }),
      memoIx(web3, vault.publicKey, memo)
    );
    const sig = await web3.sendAndConfirmTransaction(conn, tx, [vault]);
    return {
      tx: sig,
      simulated: false,
      explorer: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
      stakeAddress: pool.toBase58(),
      stakeExplorer: `https://explorer.solana.com/address/${pool.toBase58()}?cluster=devnet`,
      stakeLamports: lamports,
    };
  } catch (e) {
    console.error("Stake settlement unavailable, simulated:", e);
    return simulated(memo);
  }
}

/** Stone page: does this pledge have a live stake? */
export async function getStake(sessionId: string): Promise<{ address: string; lamports: number; explorer: string } | null> {
  try {
    const web3 = await import("@solana/web3.js");
    const conn = new web3.Connection(RPC, "confirmed");
    const vault = await loadVault(web3);
    const stakeAddr = await web3.PublicKey.createWithSeed(vault.publicKey, stakeSeed(sessionId), web3.SystemProgram.programId);
    const lamports = await conn.getBalance(stakeAddr);
    if (lamports === 0) return null;
    return {
      address: stakeAddr.toBase58(),
      lamports,
      explorer: `https://explorer.solana.com/address/${stakeAddr.toBase58()}?cluster=devnet`,
    };
  } catch {
    return null;
  }
}
