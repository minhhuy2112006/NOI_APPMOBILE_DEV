import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
  } from 'drizzle-orm/pg-core';
  
  export const organizationVerificationStatusEnum =
    pgEnum(
      'organization_verification_status',
      [
        'UNVERIFIED',
        'PENDING',
        'VERIFIED',
        'REJECTED',
      ],
    );
  export const organizationStatusEnum =
    pgEnum(
      'organization_status',
      [
        'ACTIVE',
        'SUSPENDED',
        'ARCHIVED',
      ],
    );  
  export const organizations =
    pgTable('organizations', {
      id: uuid('id')
        .defaultRandom()
        .primaryKey(),
  
      name: varchar('name', {
        length: 180,
      })
        .notNull(),
  
      description: text('description'),
      
      logoUrl: text('logo_url'),
  
      contactEmail: varchar(
        'contact_email',
        {
          length: 320,
        },
      ),
  
      contactPhone: varchar(
        'contact_phone',
        {
          length: 32,
        },
      ),
  
      verificationStatus:
        organizationVerificationStatusEnum(
          'verification_status',
        )
          .notNull()
          .default('UNVERIFIED'),
          
      status:
        organizationStatusEnum('status')
          .default('ACTIVE')
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