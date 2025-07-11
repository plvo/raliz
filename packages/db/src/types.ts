import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  notificationTable,
  organizerTable,
  participationTable,
  raffleTable,
  userTable,
  winnerTable,
} from './schema';

export type User = InferSelectModel<typeof userTable>;
export type UserInsert = InferInsertModel<typeof userTable>;

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
