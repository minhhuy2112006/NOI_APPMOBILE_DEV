import {
    index,
    pgEnum,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
  } from 'drizzle-orm/pg-core';
  import {
    sql,
  } from 'drizzle-orm';
  import { users } from './users';
  import { organizations } from './organizations';
  
  export const organizationMemberRoleEnum =
    pgEnum(
      'organization_member_role',
      [
        'PRIMARY_REPRESENTATIVE',
        'MANAGER',
        'CAMPAIGN_MANAGER',
        'STAFF',
      ],
  );
  
  export const organizationMembers =
    pgTable(
      'organization_members',
      {
        id: uuid('id')
          .defaultRandom()
          .primaryKey(),
  
        organizationId: uuid(
          'organization_id',
        )
          .notNull()
          .references(
            () => organizations.id,
            {
              onDelete: 'cascade',
            },
          ),
  
        userId: uuid('user_id')
          .notNull()
          .references(
            () => users.id,
            {
              onDelete: 'cascade',
            },
          ),
  
        role:
          organizationMemberRoleEnum(
            'role',
          )
            .notNull()
            .default('STAFF'),
  
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
        
      },
  
      (table) => [
        uniqueIndex(
          'organization_members_org_user_unique',
        ).on(
          table.organizationId,
          table.userId,
        ),
  
        index(
          'organization_members_user_id_idx',
        ).on(
          table.userId,
        ),
  
        index(
          'organization_members_role_idx',
        ).on(
          table.role,
        ),
        uniqueIndex(
          'organization_members_one_primary_rep_idx',
        )
          .on(
            table.organizationId,
          )
          .where(
            sql`${table.role} = 'PRIMARY_REPRESENTATIVE'`,
          ),
      ],
    );