import {
    boolean,
    check,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
  } from 'drizzle-orm/pg-core';
  
  import {
    sql,
  } from 'drizzle-orm';
  
  import {
    campaigns,
  } from './campaigns';
  
  export const campaignPositions =
    pgTable(
      'campaign_positions',
      {
        id: uuid('id')
          .defaultRandom()
          .primaryKey(),
  
        // Mỗi vị trí tuyển dụng luôn thuộc về đúng một campaign
        campaignId:
          uuid('campaign_id')
            .notNull()
            .references(
              () => campaigns.id,
              {
                onDelete: 'cascade',
              },
            ),
  
        // Ví dụ: "Hậu cần", "Truyền thông", "Điều phối"
        name:
          varchar(
            'name',
            {
              length: 120,
            },
          )
            .notNull(),
  
        // Mô tả công việc/vai trò của vị trí này
        description:
          text('description'),
  
        // Số TNV tối đa được CONFIRMED ở vị trí này
        capacity:
          integer('capacity')
            .notNull(),
  
        /*
         * Không xóa cứng vị trí khi không còn tuyển.
         * Sau này có application lịch sử thì dữ liệu vẫn còn nguyên.
         */
        isActive:
          boolean('is_active')
            .default(true)
            .notNull(),
  
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
        // Tăng tốc truy vấn tất cả vị trí của một campaign
        index(
          'campaign_positions_campaign_id_idx',
        ).on(
          table.campaignId,
        ),
  
        index(
          'campaign_positions_active_idx',
        ).on(
          table.isActive,
        ),
  
        /*
         * Trong cùng một campaign không tạo hai vị trí
         * có cùng tên chính xác.
         */
        uniqueIndex(
          'campaign_positions_campaign_name_unique',
        ).on(
          table.campaignId,
          table.name,
        ),
  
        // Không cho capacity = 0 hoặc số âm lọt xuống database
        check(
          'campaign_positions_capacity_positive',
          sql`
            ${table.capacity} > 0
          `,
        ),
      ],
    );