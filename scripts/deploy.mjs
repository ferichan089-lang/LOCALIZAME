/**
 * Deploy Localizame.sol to MONAD Testnet
 * Usage: node scripts/deploy.mjs
 */
import { ethers } from "ethers";
import solc from "solc";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRIVATE_KEY = "70d2616cb19895ad22402caed85af2f3f2ae70432c13393b0895879ff4010e75";
const RPC_URL     = "https://testnet-rpc.monad.xyz";

console.log("🟣 Conectando a MONAD Testnet…");
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("📬 Wallet:", wallet.address);

// ── Read contract source ──
const source = readFileSync(join(__dirname, "../contracts/Localizame.sol"), "utf8");

// ── Compile with solc ──
console.log("⚙️  Compilando Localizame.sol…");
const input = {
  language: "Solidity",
  sources:  { "Localizame.sol": { content: source } },
  settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errs = output.errors.filter(e => e.severity === "error");
  if (errs.length > 0) {
    console.error("❌ Errores de compilación:", errs);
    process.exit(1);
  }
}

const contract  = output.contracts["Localizame.sol"]["Localizame"];
const abi       = contract.abi;
const bytecode  = "0x" + contract.evm.bytecode.object;

console.log("✅ Compilado. ABI entries:", abi.length);

// ── Check balance ──
const balance = await provider.getBalance(wallet.address);
console.log("💰 Balance:", ethers.formatEther(balance), "MON");

if (balance === 0n) {
  console.error("❌ Wallet sin fondos. Necesitas MON testnet.");
  process.exit(1);
}

// ── Deploy ──
console.log("🚀 Desplegando contrato…");
const factory  = new ethers.ContractFactory(abi, bytecode, wallet);
const deployed = await factory.deploy();
console.log("⏳ Tx hash:", deployed.deploymentTransaction().hash);

await deployed.waitForDeployment();
const address = await deployed.getAddress();

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ CONTRATO DESPLEGADO EN MONAD");
console.log("📍 Address:", address);
console.log("🔗 Explorer: https://testnet.monadexplorer.com/address/" + address);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log("➡️  Agrega esto a Vercel env vars:");
console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
console.log(`   NEXT_PUBLIC_CHAIN_ID=41454`);

// ── Save ABI ──
import { writeFileSync } from "fs";
writeFileSync(
  join(__dirname, "../src/lib/contract-abi.json"),
  JSON.stringify(abi, null, 2)
);
writeFileSync(
  join(__dirname, "../src/lib/contract-address.txt"),
  address
);
console.log("📄 ABI guardado en src/lib/contract-abi.json");
console.log("📄 Address guardado en src/lib/contract-address.txt");
