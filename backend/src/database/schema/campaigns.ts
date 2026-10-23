import {
    check,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
  } from 'drizzle-orm/pg-core';
  
  import {
    sql,
  } from 'drizzle-orm';
  
  import {
    organizations,
  } from './organizations';
  
  import {
    users,
  } from './users';
  
  export const campaignStatusEnum =
    pgEnum(
      'campaign_status',
      [
        'DRAFT',
        'PENDING_REVIEW',
        'PUBLISHED',
        'ONGOING',
        'COMPLETED',
        'CANCELLED',
      ],
    );
  
  export const campaignRecruitmentStatusEnum =
    pgEnum(
      'campaign_recruitment_status',
      [
        'OPEN',
        'WAITLIST_ONLY',
        'CLOSED',
      ],
    );
  
  export const campaigns =
    pgTable(
      'campaigns',
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
                onDelete: 'restrict',
              },
            ),
  
        createdByUserId:
          uuid('created_by_user_id')
            .notNull()
            .references(
              () => users.id,
              {
                onDelete: 'restrict',
              },
            ),
  
        title:
          varchar(
            'title',
            {
              length: 180,
            },
          )
            .notNull(),
  
        summary:
          varchar(
            'summary',
            {
              length: 500,
            },
          ),
  
        description:
          text('description'),
  
        coverImageUrl:
          text('cover_image_url'),
  
        locationName:
          varchar(
            'location_name',
            {
              length: 255,
            },
          ),
  
        startAt:
          timestamp(
            'start_at',
            {
              withTimezone: true,
            },
          ),
  
        endAt:
          timestamp(
            'end_at',
            {
              withTimezone: true,
            },
          ),
  
        capacity:
          integer('capacity'),
  
        status:
          campaignStatusEnum(
            'status',
          )
            .default('DRAFT')
            .notNull(),
  
        recruitmentStatus:
          campaignRecruitmentStatusEnum(
            'recruitment_status',
          )
            .default('CLOSED')
            .notNull(),
  
        submittedAt:
          timestamp(
            'submitted_at',
            {
              withTimezone: true,
            },
          ),
  
        publishedAt:
          timestamp(
            'published_at',
            {
              withTimezone: true,
            },
          ),
  
        completedAt:
          timestamp(
            'completed_at',
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
          'campaigns_organization_id_idx',
        ).on(
          table.organizationId,
        ),
  
        index(
          'campaigns_status_idx',
        ).on(
          table.status,
        ),
  
        index(
          'campaigns_recruitment_status_idx',
        ).on(
          table.recruitmentStatus,
        ),
  
        index(
          'campaigns_start_at_idx',
        ).on(
          table.startAt,
        ),
  
        check(
          'campaigns_capacity_positive',
          sql`
            ${table.capacity} IS NULL
            OR ${table.capacity} > 0
          `,
        ),
  
        check(
          'campaigns_valid_time_range',
          sql`
            ${table.startAt} IS NULL
            OR ${table.endAt} IS NULL
            OR ${table.endAt} > ${table.startAt}
          `,
        ),
      ],
    );