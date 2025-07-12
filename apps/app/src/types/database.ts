import type { Organizer } from '@repo/db';

export type OrgWithoutWallet = Omit<Organizer, 'walletAddress'>;

// Ranking-specific types
export type OrganizerRanking = Omit<Organizer, 'walletAddress' | 'email' | 'password'>;

export interface RankingStats {
  totalChzEngaged: string;
  totalPoints: number;
  rank: number;
  completedRaffles: number;
}
