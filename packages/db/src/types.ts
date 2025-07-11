import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  notificationTable,
  organizerTable,
  participationTable,
  raffleTable,
  userAccountTable,
  userSessionTable,
  userTable,
  winnerTable,
} from './schema';

export type User = InferSelectModel<typeof userTable>;
export type UserInsert = InferInsertModel<typeof userTable>;

export type UserAccount = InferSelectModel<typeof userAccountTable>;
export type UserAccountInsert = InferInsertModel<typeof userAccountTable>;

export type UserSession = InferSelectModel<typeof userSessionTable>;
export type UserSessionInsert = InferInsertModel<typeof userSessionTable>;

export type Organizer = InferSelectModel<typeof organizerTable>;
export type OrganizerInsert = InferInsertModel<typeof organizerTable>;

export type Raffle = InferSelectModel<typeof raffleTable>;
export type RaffleInsert = InferInsertModel<typeof raffleTable>;

export type Participation = InferSelectModel<typeof participationTable>;
export type ParticipationInsert = InferInsertModel<typeof participationTable>;

export type Winner = InferSelectModel<typeof winnerTable>;
export type WinnerInsert = InferInsertModel<typeof winnerTable>;

export type Notification = InferSelectModel<typeof notificationTable>;
export type NotificationInsert = InferInsertModel<typeof notificationTable>;
