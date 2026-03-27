export interface AlertSummary {
  id: string;
  missingName: string;
  missingAge: number | null;
  missingGender: string | null;
  description: string;
  photoUrl: string | null;
  lastSeenWhere: string;
  lastSeenAt: string;
  lastLat: number;
  lastLng: number;
  status: string;
  donationRaised: number;
  donationTarget: number;
  createdAt: string;
  txHash?: string | null;
  _count: { tips: number; donations: number };
}

export interface AlertDetail extends AlertSummary {
  height: string | null;
  skinTone: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  clothingDesc: string | null;
  otherFeatures: string | null;
  contactPhone: string | null;
  contactName: string | null;
  tips: Tip[];
  donations: Donation[];
}

export interface Tip {
  id: string;
  alertId: string;
  authorName: string;
  content: string;
  lat: number;
  lng: number;
  isWithinRadius: boolean;
  pointsEarned: number;
  createdAt: string;
}

export interface Donation {
  id: string;
  alertId: string;
  donorName: string;
  amountMXN: number;
  message: string | null;
  createdAt: string;
}

// v2: MONAD blockchain types (ready for integration)
export interface BlockchainAlert {
  onChainId: string;    // bytes32 keccak256 of alert.id
  txHash: string;       // creation tx
  donationPool: string; // in wei
  isFound: boolean;
}
