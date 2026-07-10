import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Solana devnet pledge/eulogy attestation via the Memo program, signed by a
 * local demo vault (judges need no wallet). If devnet airdrop is rate-limited
 * and the vault is empty, we return an honestly-labelled simulated signature
 * so the flow never dead-ends.
 */

const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
const VAULT_FILE = path.join(process.cwd(), ".data", "vault.json");
const RPC = process.env.SOLANA_RPC || "https://api.devnet.solana.com";

export interface PledgeResult {
  tx: string;
  simulated: boolean;
  explorer: string | null;
}

export async function attestOnChain(memo: object): Promise<PledgeResult> {
  const payload = JSON.stringify(memo);
  try {
    const web3 = await import("@solana/web3.js");
    const conn = new web3.Connection(RPC, "confirmed");

    let vault: InstanceType<typeof web3.Keypair>;
    if (fs.existsSync(VAULT_FILE)) {
      vault = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(VAULT_FILE, "utf8"))));
    } else {
      vault = web3.Keypair.generate();
      fs.mkdirSync(path.dirname(VAULT_FILE), { recursive: true });
      fs.writeFileSync(VAULT_FILE, JSON.stringify([...vault.secretKey]));
    }

    let balance = await conn.getBalance(vault.publicKey);
    if (balance < 5_000_000) {
      try {
        const sig = await conn.requestAirdrop(vault.publicKey, web3.LAMPORTS_PER_SOL);
        await conn.confirmTransaction(sig, "confirmed");
        balance = await conn.getBalance(vault.publicKey);
      } catch {
        /* airdrop rate-limited — fall through to simulated */
      }
    }
    if (balance < 10_000) throw new Error("vault unfunded");

    const ix = new web3.TransactionInstruction({
      keys: [{ pubkey: vault.publicKey, isSigner: true, isWritable: false }],
      programId: new web3.PublicKey(MEMO_PROGRAM),
      data: Buffer.from(payload, "utf8"),
    });
    const tx = new web3.Transaction().add(ix);
    const sig = await web3.sendAndConfirmTransaction(conn, tx, [vault]);
    return {
      tx: sig,
      simulated: false,
      explorer: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
    };
  } catch (e) {
    console.error("On-chain attestation unavailable, recording simulated pledge:", e);
    const hash = crypto.createHash("sha256").update(payload).digest("hex");
    return { tx: `SIMULATED-${hash.slice(0, 32)}`, simulated: true, explorer: null };
  }
}
