'use server';

import { withAction } from '@/lib/wrappers/with-action';
import {
  type Organizer,
  type OrganizerSeasonStats,
  type Season,
  desc,
  eq,
  organizerSeasonStatsTable,
  organizerTable,
  seasonTable,
  sql,
} from '@repo/db';

// Type for ranking data
export interface OrganizerRankingData {
  organizer: Omit<Organizer, 'walletAddress' | 'email' | 'password'>;
  totalChzEngaged: string;
  totalPoints: number;
  rank: number;
  seasonStats?: OrganizerSeasonStats[];
}

export interface SeasonRankingData {
  season: Season;
  organizerStats: Array<{
    organizer: Omit<Organizer, 'walletAddress' | 'email' | 'password'>;
    stats: OrganizerSeasonStats;
    points: number;
    rank: number;
  }>;
}

// Get overall ranking (all-time)
export async function getOverallRanking() {
  return withAction<OrganizerRankingData[]>(async (db) => {
    const organizers = await db.query.organizerTable.findMany({
      columns: {
        walletAddress: false,
        email: false,
        password: false,
      },
      orderBy: [desc(organizerTable.totalChzEngaged)],
    });

    const rankingData: OrganizerRankingData[] = organizers.map((organizer, index) => ({
      organizer,
      totalChzEngaged: organizer.totalChzEngaged,
      totalPoints: Math.floor(Number.parseFloat(organizer.totalChzEngaged) * 10),
      rank: index + 1,
    }));

    return rankingData;
  });
}

// Get ranking for a specific season
export async function getSeasonRanking(seasonId: string) {
  return withAction<SeasonRankingData | null>(async (db) => {
    const season = await db.query.seasonTable.findFirst({
      where: eq(seasonTable.id, seasonId),
    });

    if (!season) {
      return null;
    }

    const seasonStats = await db.query.organizerSeasonStatsTable.findMany({
      where: eq(organizerSeasonStatsTable.seasonId, seasonId),
      with: {
        organizer: {
          columns: {
            walletAddress: false,
            email: false,
            password: false,
          },
        },
      },
      orderBy: [desc(organizerSeasonStatsTable.totalChzEngaged)],
    });

    const organizerStats = seasonStats.map((stat, index) => ({
      organizer: stat.organizer,
      stats: stat,
      points: Math.floor(Number.parseFloat(stat.totalChzEngaged) * 10),
      rank: index + 1,
    }));

    return {
      season,
      organizerStats,
    };
  });
}

// Get all seasons for selection
export async function getSeasons() {
  return withAction<Season[]>(async (db) => {
    const seasons = await db.query.seasonTable.findMany({
      orderBy: [desc(seasonTable.startDate)],
    });
    return seasons;
  });
}

// Get current active season
export async function getCurrentSeason() {
  return withAction<Season | null>(async (db) => {
    const season = await db.query.seasonTable.findFirst({
      where: eq(seasonTable.isActive, true),
    });
    return season ?? null;
  });
}

// Get top 3 organizers for overall ranking
export async function getTopOrganizers() {
  return withAction<OrganizerRankingData[]>(async (db) => {
    const organizers = await db.query.organizerTable.findMany({
      columns: {
        walletAddress: false,
        email: false,
        password: false,
      },
      orderBy: [desc(organizerTable.totalChzEngaged)],
      limit: 3,
    });

    const rankingData: OrganizerRankingData[] = organizers.map((organizer, index) => ({
      organizer,
      totalChzEngaged: organizer.totalChzEngaged,
      totalPoints: Math.floor(Number.parseFloat(organizer.totalChzEngaged) * 10),
      rank: index + 1,
    }));

    return rankingData;
  });
}
