import { relations, sql } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/pg-core';
import { boolean, decimal, index, integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

const timeColumns = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
};

// Enums
export const raffleStatusEnum = pgEnum('raffle_status', ['DRAFT', 'ACTIVE', 'ENDED']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'RAFFLE_CREATED',
  'PARTICIPATION_CONFIRMED',
  'WINNER_SELECTED',
  'RAFFLE_ENDED',
  'SEASON_REWARD',
  'LEADERBOARD_UPDATE',
]);
export const rewardTypeEnum = pgEnum('reward_type', ['TEAM_TOP3', 'INDIVIDUAL_MVP', 'SPECIAL']);

// User table (updated with competition fields)
export const userTable = pgTable(
  'users',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    walletAddress: varchar('wallet_address', { length: 42 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique(),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    phone: varchar('phone', { length: 255 }),

    emailVerified: boolean('email_verified').notNull().default(false),

    // Competition fields
    totalPoints: integer('total_points').notNull().default(0),
    totalParticipations: integer('total_participations').notNull().default(0),
    favoriteOrganizerId: uuid('favorite_organizer_id'),

    ...timeColumns,
  },
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_wallet_address_idx').on(t.walletAddress),
    index('users_total_points_idx').on(t.totalPoints),
    index('users_favorite_organizer_idx').on(t.favoriteOrganizerId),
  ],
);

export const userTableRelations = relations(userTable, ({ many, one }) => ({
  participations: many(participationTable),
  notifications: many(notificationTable),
  seasonStats: many(userSeasonStatsTable),
  seasonRewards: many(seasonRewardTable),
  favoriteOrganizer: one(organizerTable, {
    fields: [userTable.favoriteOrganizerId],
    references: [organizerTable.id],
  }),
}));

// Organizer table (updated with competition fields)
export const organizerTable = pgTable(
  'organizers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    password: varchar('password', { length: 255 }),
    description: text('description'),
    logoUrl: varchar('logo_url', { length: 500 }),
    walletAddress: varchar('wallet_address', { length: 43 }).notNull().unique(),
    fanTokenAddress: varchar('fan_token_address', { length: 43 }).notNull().unique(),
    fanTokenSymbol: varchar('fan_token_symbol', { length: 10 }).notNull(),
    isVerified: boolean('is_verified').notNull().default(false),

    // Competition fields
    totalChzEngaged: decimal('total_chz_engaged', { precision: 18, scale: 8 }).notNull().default('0'),
    totalCompletedRaffles: integer('total_completed_raffles').notNull().default(0),
    leaderboardRank: integer('leaderboard_rank'),

    ...timeColumns,
  },
  (t) => [
    index('organizers_email_idx').on(t.email),
    index('organizers_wallet_address_idx').on(t.walletAddress),
    index('organizers_fan_token_address_idx').on(t.fanTokenAddress),
    index('organizers_total_chz_engaged_idx').on(t.totalChzEngaged),
    index('organizers_leaderboard_rank_idx').on(t.leaderboardRank),
  ],
);

export const organizerTableRelations = relations(organizerTable, ({ many }) => ({
  raffles: many(raffleTable),
  seasonStats: many(organizerSeasonStatsTable),
  seasonRewards: many(seasonRewardTable),
  usersFavorited: many(userTable),
}));

// Season table - NEW
export const seasonTable = pgTable(
  'seasons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    rewardsDistributed: boolean('rewards_distributed').notNull().default(false),
    ...timeColumns,
  },
  (t) => [
    index('seasons_is_active_idx').on(t.isActive),
    index('seasons_start_date_idx').on(t.startDate),
    index('seasons_end_date_idx').on(t.endDate),
  ],
);

export const seasonTableRelations = relations(seasonTable, ({ many }) => ({
  raffles: many(raffleTable),
  userStats: many(userSeasonStatsTable),
  organizerStats: many(organizerSeasonStatsTable),
  rewards: many(seasonRewardTable),
}));

// User Season Stats table - NEW
export const userSeasonStatsTable = pgTable(
  'user_season_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasonTable.id, { onDelete: 'cascade' }),
    organizerId: uuid('organizer_id').references(() => organizerTable.id), // Team supported this season

    totalPoints: integer('total_points').notNull().default(0),
    totalParticipations: integer('total_participations').notNull().default(0),
    totalChzSpent: decimal('total_chz_spent', { precision: 18, scale: 8 }).notNull().default('0'),
    rankInTeam: integer('rank_in_team'),
    lastParticipationDate: timestamp('last_participation_date'),

    ...timeColumns,
  },
  (t) => [
    index('user_season_stats_user_id_idx').on(t.userId),
    index('user_season_stats_season_id_idx').on(t.seasonId),
    index('user_season_stats_organizer_id_idx').on(t.organizerId),
    index('user_season_stats_total_points_idx').on(t.totalPoints),
    index('user_season_stats_rank_in_team_idx').on(t.rankInTeam),
  ],
);

export const userSeasonStatsTableRelations = relations(userSeasonStatsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userSeasonStatsTable.userId],
    references: [userTable.id],
  }),
  season: one(seasonTable, {
    fields: [userSeasonStatsTable.seasonId],
    references: [seasonTable.id],
  }),
  organizer: one(organizerTable, {
    fields: [userSeasonStatsTable.organizerId],
    references: [organizerTable.id],
  }),
}));

// Organizer Season Stats table - NEW
export const organizerSeasonStatsTable = pgTable(
  'organizer_season_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizerId: uuid('organizer_id')
      .notNull()
      .references(() => organizerTable.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasonTable.id, { onDelete: 'cascade' }),

    totalChzEngaged: decimal('total_chz_engaged', { precision: 18, scale: 8 }).notNull().default('0'),
    totalRafflesCompleted: integer('total_raffles_completed').notNull().default(0),
    totalParticipantsUnique: integer('total_participants_unique').notNull().default(0),
    averageParticipationRate: decimal('average_participation_rate', { precision: 5, scale: 2 }).notNull().default('0'),
    leaderboardPosition: integer('leaderboard_position'),

    ...timeColumns,
  },
  (t) => [
    index('organizer_season_stats_organizer_id_idx').on(t.organizerId),
    index('organizer_season_stats_season_id_idx').on(t.seasonId),
    index('organizer_season_stats_total_chz_engaged_idx').on(t.totalChzEngaged),
    index('organizer_season_stats_leaderboard_position_idx').on(t.leaderboardPosition),
  ],
);

export const organizerSeasonStatsTableRelations = relations(organizerSeasonStatsTable, ({ one }) => ({
  organizer: one(organizerTable, {
    fields: [organizerSeasonStatsTable.organizerId],
    references: [organizerTable.id],
  }),
  season: one(seasonTable, {
    fields: [organizerSeasonStatsTable.seasonId],
    references: [seasonTable.id],
  }),
}));

// Season Reward table - NEW
export const seasonRewardTable = pgTable(
  'season_rewards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasonTable.id, { onDelete: 'cascade' }),
    rewardType: rewardTypeEnum('reward_type').notNull(),
    organizerId: uuid('organizer_id').references(() => organizerTable.id), // For team rewards
    userId: varchar('user_id', { length: 255 }).references(() => userTable.id), // For individual rewards

    position: integer('position'), // 1, 2, 3 for TOP 3
    rewardAmountChz: decimal('reward_amount_chz', { precision: 18, scale: 8 }),
    rewardDescription: text('reward_description').notNull(),
    distributed: boolean('distributed').notNull().default(false),
    transactionHash: varchar('transaction_hash', { length: 66 }),
    distributedAt: timestamp('distributed_at'),

    ...timeColumns,
  },
  (t) => [
    index('season_rewards_season_id_idx').on(t.seasonId),
    index('season_rewards_reward_type_idx').on(t.rewardType),
    index('season_rewards_organizer_id_idx').on(t.organizerId),
    index('season_rewards_user_id_idx').on(t.userId),
    index('season_rewards_distributed_idx').on(t.distributed),
    index('season_rewards_position_idx').on(t.position),
  ],
);

export const seasonRewardTableRelations = relations(seasonRewardTable, ({ one }) => ({
  season: one(seasonTable, {
    fields: [seasonRewardTable.seasonId],
    references: [seasonTable.id],
  }),
  organizer: one(organizerTable, {
    fields: [seasonRewardTable.organizerId],
    references: [organizerTable.id],
  }),
  user: one(userTable, {
    fields: [seasonRewardTable.userId],
    references: [userTable.id],
  }),
}));

// Raffle table (updated with season and competition fields)
export const raffleTable = pgTable(
  'raffles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    prizeDescription: text('prize_description').notNull(),
    imageUrl: varchar('image_url', { length: 500 }),
    participationPrice: decimal('participation_price', { precision: 18, scale: 8 }).notNull().default('0'),
    tokenSymbol: varchar('token_symbol', { length: 10 }).notNull().default('CHZ'),
    minimumFanTokens: integer('minimum_fan_tokens').notNull().default(50),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    maxWinners: varchar('max_winners', { length: 10 }).notNull().default('1'),
    maxParticipants: varchar('max_participants', { length: 10 }),
    status: raffleStatusEnum('status').notNull().default('DRAFT'),
    smartContractAddress: varchar('smart_contract_address', { length: 42 }),
    contractRaffleId: integer('contract_raffle_id'), // ID de la raffle dans le smart contract

    // Competition fields
    totalChzCollected: decimal('total_chz_collected', { precision: 18, scale: 8 }).notNull().default('0'),

    ...timeColumns,

    organizerId: uuid('organizer_id')
      .notNull()
      .references(() => organizerTable.id),
    seasonId: uuid('season_id').references(() => seasonTable.id), // NEW: Season association
  },
  (t) => [
    index('raffles_organizer_id_idx').on(t.organizerId),
    index('raffles_season_id_idx').on(t.seasonId),
    index('raffles_status_idx').on(t.status),
    index('raffles_end_date_idx').on(t.endDate),
    index('raffles_total_chz_collected_idx').on(t.totalChzCollected),
    index('raffles_contract_raffle_id_idx').on(t.contractRaffleId), // Index pour recherche rapide
  ],
);

export const raffleTableRelations = relations(raffleTable, ({ one, many }) => ({
  organizer: one(organizerTable, {
    fields: [raffleTable.organizerId],
    references: [organizerTable.id],
  }),
  season: one(seasonTable, {
    fields: [raffleTable.seasonId],
    references: [seasonTable.id],
  }),
  participations: many(participationTable),
  winners: many(winnerTable),
  notifications: many(notificationTable),
}));

// Participation table (updated with competition fields)
export const participationTable = pgTable(
  'participations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
    transactionHash: varchar('transaction_hash', { length: 66 }),
    amountPaid: decimal('amount_paid', { precision: 18, scale: 8 }).notNull(),
    tokenUsed: varchar('token_used', { length: 10 }).notNull(),
    participatedAt: timestamp('participated_at').notNull().defaultNow(),
    isWinner: boolean('is_winner').notNull().default(false),
    notifiedAt: timestamp('notified_at'),

    // Competition fields
    pointsEarned: integer('points_earned').notNull().default(1), // 1 for participation + 5 bonus if winner

    ...timeColumns,

    raffleId: uuid('raffle_id')
      .notNull()
      .references(() => raffleTable.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id),
  },
  (t) => [
    index('participations_raffle_id_idx').on(t.raffleId),
    index('participations_user_id_idx').on(t.userId),
    index('participations_wallet_address_idx').on(t.walletAddress),
    index('participations_transaction_hash_idx').on(t.transactionHash),
    index('participations_points_earned_idx').on(t.pointsEarned),
  ],
);

export const participationTableRelations = relations(participationTable, ({ one }) => ({
  raffle: one(raffleTable, {
    fields: [participationTable.raffleId],
    references: [raffleTable.id],
  }),
  user: one(userTable, {
    fields: [participationTable.userId],
    references: [userTable.id],
  }),
  winner: one(winnerTable, {
    fields: [participationTable.id],
    references: [winnerTable.participationId],
  }),
}));

// Winner table
export const winnerTable = pgTable(
  'winners',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    winnerRank: varchar('winner_rank', { length: 10 }).notNull(),
    hasBeenContacted: boolean('has_been_contacted').notNull().default(false),
    drawnAt: timestamp('drawn_at').notNull().defaultNow(),
    contactedAt: timestamp('contacted_at'),
    contactNotes: text('contact_notes'),
    ...timeColumns,

    participationId: uuid('participation_id')
      .notNull()
      .references(() => participationTable.id, { onDelete: 'cascade' }),
    raffleId: uuid('raffle_id')
      .notNull()
      .references(() => raffleTable.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id),
  },
  (t) => [
    index('winners_raffle_id_idx').on(t.raffleId),
    index('winners_user_id_idx').on(t.userId),
    index('winners_participation_id_idx').on(t.participationId),
  ],
);

export const winnerTableRelations = relations(winnerTable, ({ one }) => ({
  participation: one(participationTable, {
    fields: [winnerTable.participationId],
    references: [participationTable.id],
  }),
  raffle: one(raffleTable, {
    fields: [winnerTable.raffleId],
    references: [raffleTable.id],
  }),
  user: one(userTable, {
    fields: [winnerTable.userId],
    references: [userTable.id],
  }),
}));

// Notification table (updated with new notification types)
export const notificationTable = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    ...timeColumns,

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    raffleId: uuid('raffle_id').references(() => raffleTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('notifications_user_id_idx').on(t.userId),
    index('notifications_raffle_id_idx').on(t.raffleId),
    index('notifications_is_read_idx').on(t.isRead),
    index('notifications_type_idx').on(t.type),
  ],
);

export const notificationTableRelations = relations(notificationTable, ({ one }) => ({
  user: one(userTable, {
    fields: [notificationTable.userId],
    references: [userTable.id],
  }),
  raffle: one(raffleTable, {
    fields: [notificationTable.raffleId],
    references: [raffleTable.id],
  }),
}));
