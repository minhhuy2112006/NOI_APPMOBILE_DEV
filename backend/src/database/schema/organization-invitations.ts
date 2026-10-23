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

  import {
    organizationMemberRoleEnum,
  } from './organization-members';
  
  import {
    organizations,
  } from './organizations';
  
  import {
    users,
  } from './users';
  
  export const organizationInvitationStatusEnum =
    pgEnum(
      'organization_invitation_status',
      [
        'PENDING',
        'PENDING_VERIFICATION',
        'ACCEPTED',
        'DECLINED',
        'EXPIRED',
        'CANCELLED',
      ],
    );
  
  export const organizationInvitations =
    pgTable(
      'organization_invitations',
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
  
        invitedUserId:
          uuid('invited_user_id')
            .notNull()
            .references(
              () => users.id,
              {
                onDelete: 'cascade',
              },
            ),
  
        invitedByUserId:
          uuid('invited_by_user_id')
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
            .default('STAFF')
            .notNull(),
  
        status:
          organizationInvitationStatusEnum(
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
          'organization_invitations_org_id_idx',
        ).on(
          table.organizationId,
        ),
  
        index(
          'organization_invitations_invited_user_id_idx',
        ).on(
          table.invitedUserId,
        ),
  
        index(
          'organization_invitations_status_idx',
        ).on(
          table.status,
        ),
        uniqueIndex(
            'organization_invitations_one_active_idx',
          )
            .on(
              table.organizationId,
              table.invitedUserId,
            )
            .where(
              sql`${table.status} IN ('PENDING', 'PENDING_VERIFICATION')`,
            ),
      ],
    );