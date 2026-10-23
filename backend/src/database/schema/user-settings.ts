import {
    boolean,
    pgTable,
    timestamp,
    uuid,
    varchar,
  } from 'drizzle-orm/pg-core';
  
  import { users } from './users';
  
  export const userSettings =
    pgTable('user_settings', {
      userId: uuid('user_id')
        .primaryKey()
        .references(
          () => users.id,
          {
            onDelete: 'cascade',
          },
        ),
  
      language: varchar(
        'language',
        {
          length: 10,
        },
      )
        .notNull()
        .default('vi'),
  
      notificationEnabled:
        boolean(
          'notification_enabled',
        )
          .notNull()
          .default(true),
  
      campaignNotificationEnabled:
        boolean(
          'campaign_notification_enabled',
        )
          .notNull()
          .default(true),
  
      attendanceNotificationEnabled:
        boolean(
          'attendance_notification_enabled',
        )
          .notNull()
          .default(true),
  
      updatedAt: timestamp(
        'updated_at',
        {
          withTimezone: true,
        },
      )
        .defaultNow()
        .notNull(),
    });