import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  userTable,
  organizerTable,
  raffleTable,
  participationTable,
  winnerTable,
  notificationTable,
  seasonTable,
  userSeasonStatsTable,
  organizerSeasonStatsTable,
  seasonRewardTable,
} from './schema';

// User types
export type User = InferSelectModel<typeof userTable>;
export type CreateUser = InferInsertModel<typeof userTable>;

// Organizer types
export type Organizer = InferSelectModel<typeof organizerTable>;
export type CreateOrganizer = InferInsertModel<typeof organizerTable>;

// Raffle types
export type Raffle = InferSelectModel<typeof raffleTable>;
export type CreateRaffle = InferInsertModel<typeof raffleTable>;

// Participation types
export type Participation = InferSelectModel<typeof participationTable>;
export type CreateParticipation = InferInsertModel<typeof participationTable>;

// Winner types
export type Winner = InferSelectModel<typeof winnerTable>;
export type CreateWinner = InferInsertModel<typeof winnerTable>;

// Notification types
export type Notification = InferSelectModel<typeof notificationTable>;
export type CreateNotification = InferInsertModel<typeof notificationTable>;

// Season types - NEW
export type Season = InferSelectModel<typeof seasonTable>;
export type CreateSeason = InferInsertModel<typeof seasonTable>;

// User Season Stats types - NEW
export type UserSeasonStats = InferSelectModel<typeof userSeasonStatsTable>;
export type CreateUserSeasonStats = InferInsertModel<typeof userSeasonStatsTable>;

// Organizer Season Stats types - NEW
export type OrganizerSeasonStats = InferSelectModel<typeof organizerSeasonStatsTable>;
export type CreateOrganizerSeasonStats = InferInsertModel<typeof organizerSeasonStatsTable>;

// Season Reward types - NEW
export type SeasonReward = InferSelectModel<typeof seasonRewardTable>;
export type CreateSeasonReward = InferInsertModel<typeof seasonRewardTable>;
