/**
 * MONAD Blockchain integration for LOCALIZAME
 * Records missing person alerts immutably on-chain
 */
import { ethers } from "ethers";
import abi from "./contract-abi.json";

const CONTRACT_ADDRESS = "0x0CbAA7Ce9dED87e6e822d123C479dfC1077f456B";
const RPC_URL          = "https://testnet-rpc.monad.xyz";
const PRIVATE_KEY      = process.env.DEPLOYER_PRIVATE_KEY ?? "";

let _provider: ethers.JsonRpcProvider | null = null;
let _contract:  ethers.Contract | null = null;

function getContract(): ethers.Contract {
  if (!_contract) {
    _provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, _provider);
    _contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
  }
  return _contract;
}

/**
 * Record a missing person alert on MONAD blockchain
 * @returns txHash of the on-chain transaction
 */
export async function recordAlertOnChain(params: {
  missingName: string;
  description: string;
  lat: number;
  lng: number;
}): Promise<string> {
  try {
    const contract = getContract();

    // Convert coordinates to int256 (multiply by 1e6 for precision)
    const latInt = Math.round(params.lat * 1_000_000);
    const lngInt = Math.round(params.lng * 1_000_000);

    const tx = await contract.createAlert(
      params.missingName.slice(0, 100),
      params.description.slice(0, 500),
      latInt,
      lngInt
    );

    const receipt = await tx.wait();
    console.log("✅ MONAD tx confirmed:", receipt.hash);
    return receipt.hash as string;
  } catch (err) {
    console.error("⚠️ Blockchain write failed (non-blocking):", err);
    return ""; // Don't block alert creation if chain is slow
  }
}

export const EXPLORER_URL = "https://testnet.monadexplorer.com";
export const CONTRACT_URL = `${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`;
