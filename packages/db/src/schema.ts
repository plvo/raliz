import { relations, sql } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/pg-core';
import { boolean, decimal, index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

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
]);

// User table (keep for auth)
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
    ...timeColumns,
  },
  (t) => [index('users_email_idx').on(t.email), index('users_wallet_address_idx').on(t.walletAddress)],
);

export const userTableRelations = relations(userTable, ({ many }) => ({
  participations: many(participationTable),
  notifications: many(notificationTable),
}));

// Organizer table
export const organizerTable = pgTable(
  'organizers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    description: text('description'),
    logoUrl: varchar('logo_url', { length: 500 }),
    walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
    fanTokenAddress: varchar('fan_token_address', { length: 42 }).notNull().unique(),
    isVerified: boolean('is_verified').notNull().default(false),
    ...timeColumns,
  },
  (t) => [
    index('organizers_email_idx').on(t.email), 
    index('organizers_wallet_address_idx').on(t.walletAddress),
    index('organizers_fan_token_address_idx').on(t.fanTokenAddress)
  ],
);

export const organizerTableRelations = relations(organizerTable, ({ many }) => ({
  raffles: many(raffleTable),
}));

// Raffle table
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
    minimumFanTokens: decimal('minimum_fan_tokens', { precision: 18, scale: 8 }).notNull().default('50'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    maxWinners: varchar('max_winners', { length: 10 }).notNull().default('1'),
    maxParticipants: varchar('max_participants', { length: 10 }),
    status: raffleStatusEnum('status').notNull().default('DRAFT'),
    smartContractAddress: varchar('smart_contract_address', { length: 42 }),
    ...timeColumns,

    organizerId: uuid('organizer_id')
      .notNull()
      .references(() => organizerTable.id),
  },
  (t) => [
    index('raffles_organizer_id_idx').on(t.organizerId),
    index('raffles_status_idx').on(t.status),
    index('raffles_end_date_idx').on(t.endDate),
  ],
);

export const raffleTableRelations = relations(raffleTable, ({ one, many }) => ({
  organizer: one(organizerTable, {
    fields: [raffleTable.organizerId],
    references: [organizerTable.id],
  }),
  participations: many(participationTable),
  winners: many(winnerTable),
  notifications: many(notificationTable),
}));

// Participation table
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

// Notification table
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
