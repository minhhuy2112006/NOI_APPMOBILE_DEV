import {
    index,
    pgEnum,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
  } from 'drizzle-orm/pg-core';
  import { sql } from 'drizzle-orm'
  import {
    organizations,
  } from './organizations';
  
  import {
    users,
  } from './users';
  
  export const organizationRepresentativeTransferStatusEnum =
    pgEnum(
      'organization_representative_transfer_status',
      [
        'PENDING',
        'ACCEPTED',
        'DECLINED',
        'EXPIRED',
        'CANCELLED',
      ],
    );
  
  export const organizationRepresentativeTransfers =
    pgTable(
      'organization_representative_transfers',
      {
        id: uuid('id')
          .defaultRandom()
          .primaryKey(),
  
        organizationId:
          uuid('organization_id')
            .notNull()
            .references(
              () => organizations.id,
              {
                onDelete: 'cascade',
              },
            ),
  
        fromUserId:
          uuid('from_user_id')
            .notNull()
            .references(
              () => users.id,
              {
                onDelete: 'cascade',
              },
            ),
  
        toUserId:
          uuid('to_user_id')
            .notNull()
            .references(
              () => users.id,
              {
                onDelete: 'cascade',
              },
            ),
  
        status:
          organizationRepresentativeTransferStatusEnum(
            'status',
          )
            .default('PENDING')
            .notNull(),
  
        expiresAt:
          timestamp(
            'expires_at',
            {
              withTimezone: true,
            },
          )
            .notNull(),
  
        acceptedAt:
          timestamp(
            'accepted_at',
            {
              withTimezone: true,
            },
          ),
  
        declinedAt:
          timestamp(
            'declined_at',
            {
              withTimezone: true,
            },
          ),
  
        cancelledAt:
          timestamp(
            'cancelled_at',
            {
              withTimezone: true,
            },
          ),
  
        createdAt:
          timestamp(
            'created_at',
            {
              withTimezone: true,
            },
          )
            .defaultNow()
            .notNull(),
  
        updatedAt:
          timestamp(
            'updated_at',
            {
              withTimezone: true,
            },
          )
            .defaultNow()
            .notNull(),
      },
      (table) => [
        index(
          'organization_rep_transfers_org_id_idx',
        ).on(
          table.organizationId,
        ),
  
        index(
          'organization_rep_transfers_from_user_idx',
        ).on(
          table.fromUserId,
        ),
  
        index(
          'organization_rep_transfers_to_user_idx',
        ).on(
          table.toUserId,
        ),
  
        index(
          'organization_rep_transfers_status_idx',
        ).on(
          table.status,
        ),
        uniqueIndex(
            'organization_rep_transfers_one_pending_idx',
          )
            .on(
              table.organizationId,
            )
            .where(
              sql`${table.status} = 'PENDING'`,
            ),
      ],
    );