import { sql } from 'drizzle-orm';

import {
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const identityVerificationStatusEnum =
  pgEnum(
    'identity_verification_status',
    [
      'UNVERIFIED',
      'PENDING',
      'VERIFIED',
      'REJECTED',
    ],
  );
export const userRoleEnum = pgEnum(
  'user_role',
  [
    'USER',
    'ORGANIZER',
    'CAMPAIGN_MANAGER',
    'ADMIN',
  ],
);

export const users = pgTable('users', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  email: varchar('email', {
    length: 320,
  })
    .notNull()
    .unique(),

  passwordHash: text('password_hash')
    .notNull(),

  role: userRoleEnum('role')
    .notNull()
    .default('USER'),

  identityVerificationStatus:
    identityVerificationStatusEnum(
      'identity_verification_status',
    )
      .default('UNVERIFIED')
      .notNull(),
      
  name: varchar('name', {
    length: 120,
  }).notNull(),

  avatarUrl: text('avatar_url'),

  birthday: date('birthday'),

  gender: varchar('gender', {
    length: 32,
  }),

  phone: varchar('phone', {
    length: 32,
  }),

  city: varchar('city', {
    length: 120,
  }),

  emergencyName: varchar(
    'emergency_name',
    {
      length: 120,
    },
  ),

  emergencyRelationship: varchar(
    'emergency_relationship',
    {
      length: 80,
    },
  ),

  emergencyPhone: varchar(
    'emergency_phone',
    {
      length: 32,
    },
  ),

  skills: text('skills')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  interests: text('interests')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  memberSince: timestamp(
    'member_since',
    {
      withTimezone: true,
    },
  )
    .defaultNow()
    .notNull(),

  createdAt: timestamp(
    'created_at',
    {
      withTimezone: true,
    },
  )
    .defaultNow()
    .notNull(),

  updatedAt: timestamp(
    'updated_at',
    {
      withTimezone: true,
    },
  )
  
    .defaultNow()
    .notNull(),
});