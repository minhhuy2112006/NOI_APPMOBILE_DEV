import {
    index,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
  } from 'drizzle-orm/pg-core';
  
  import { users } from './users';
  
  export const authSessions =
    pgTable(
      'auth_sessions',
      {
        id: uuid('id')
          .defaultRandom()
          .primaryKey(),
  
        userId: uuid('user_id')
          .notNull()
          .references(
            () => users.id,
            {
              onDelete: 'cascade',
            },
          ),
  
        refreshTokenHash: varchar(
          'refresh_token_hash',
          {
            length: 64,
          },
        ).notNull(),
  
        deviceName: varchar(
          'device_name',
          {
            length: 160,
          },
        ),
  
        userAgent: text('user_agent'),
  
        createdAt: timestamp(
          'created_at',
          {
            withTimezone: true,
          },
        )
          .defaultNow()
          .notNull(),
  
        lastUsedAt: timestamp(
          'last_used_at',
          {
            withTimezone: true,
          },
        )
          .defaultNow()
          .notNull(),
  
        expiresAt: timestamp(
          'expires_at',
          {
            withTimezone: true,
          },
        ).notNull(),
  
        revokedAt: timestamp(
          'revoked_at',
          {
            withTimezone: true,
          },
        ),
      },
      (table) => [
        index(
          'auth_sessions_user_id_idx',
        ).on(table.userId),
  
        index(
          'auth_sessions_expires_at_idx',
        ).on(table.expiresAt),
      ],
    );