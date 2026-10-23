import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
  } from 'drizzle-orm/pg-core';
  
  import {
    campaigns,
  } from './campaigns';
  
  import {
    campaignPositions,
  } from './campaign-positions';
  
  import {
    users,
  } from './users';
  
  /*
   * Trạng thái của một đơn ứng tuyển.
   *
   * Lưu ý:
   * Application status khác recruitment status của campaign.
   * recruitmentStatus nói campaign đang nhận loại đơn nào.
   * applicationStatus nói đơn của một người đang ở bước nào.
   */
  export const campaignApplicationStatusEnum =
    pgEnum(
      'campaign_application_status',
      [
        'PENDING_REVIEW',
        'SELECTED_PENDING_CONFIRMATION',
        'CONFIRMED',
  
        'WAITLISTED',
        'WAITLIST_INVITED',
  
        'REJECTED',
        'DECLINED',
        'CONFIRMATION_EXPIRED',
  
        'WITHDRAW_REQUESTED',
        'WITHDRAWN',
  
        'PARTICIPATION_COMPLETED',
      ],
    );
  
  export const campaignApplications =
    pgTable(
      'campaign_applications',
      {
        id: uuid('id')
          .defaultRandom()
          .primaryKey(),
  
        /*
         * Campaign mà người dùng đăng ký.
         *
         * Không cho xóa campaign nếu vẫn còn application lịch sử.
         */
        campaignId:
          uuid('campaign_id')
            .notNull()
            .references(
              () => campaigns.id,
              {
                onDelete: 'restrict',
              },
            ),
  
        /*
         * Vị trí người dùng muốn tham gia.
         *
         * Position được soft-disable bằng isActive,
         * nên không cần xóa application lịch sử.
         */
        positionId:
          uuid('position_id')
            .notNull()
            .references(
              () => campaignPositions.id,
              {
                onDelete: 'restrict',
              },
            ),
  
        // User nộp đơn ứng tuyển.
        applicantUserId:
          uuid('applicant_user_id')
            .notNull()
            .references(
              () => users.id,
              {
                onDelete: 'restrict',
              },
            ),
  
        /*
         * Nội dung người dùng gửi khi ứng tuyển.
         * Ví dụ: lý do muốn tham gia, kinh nghiệm liên quan.
         */
        motivation:
          text('motivation'),
  
        status:
          campaignApplicationStatusEnum(
            'status',
          )
            .default('PENDING_REVIEW')
            .notNull(),
  
        /*
         * Thời hạn để TNV xác nhận sau khi được BTC chọn.
         *
         * Chỉ có ý nghĩa khi:
         * SELECTED_PENDING_CONFIRMATION
         * hoặc WAITLIST_INVITED.
         */
        confirmationExpiresAt:
          timestamp(
            'confirmation_expires_at',
            {
              withTimezone: true,
            },
          ),
  
        // BTC chọn ứng viên.
        selectedAt:
          timestamp(
            'selected_at',
            {
              withTimezone: true,
            },
          ),
  
        // TNV xác nhận tham gia và chính thức chiếm slot.
        confirmedAt:
          timestamp(
            'confirmed_at',
            {
              withTimezone: true,
            },
          ),
  
        // Đưa vào danh sách chờ.
        waitlistedAt:
          timestamp(
            'waitlisted_at',
            {
              withTimezone: true,
            },
          ),
  
        // BTC mời một người từ waitlist lên.
        waitlistInvitedAt:
          timestamp(
            'waitlist_invited_at',
            {
              withTimezone: true,
            },
          ),
  
        // BTC từ chối application.
        rejectedAt:
          timestamp(
            'rejected_at',
            {
              withTimezone: true,
            },
          ),
  
        // TNV được chọn nhưng chủ động không tham gia.
        declinedAt:
          timestamp(
            'declined_at',
            {
              withTimezone: true,
            },
          ),
  
        // Hết hạn xác nhận.
        confirmationExpiredAt:
          timestamp(
            'confirmation_expired_at',
            {
              withTimezone: true,
            },
          ),
  
        // TNV gửi yêu cầu rút khỏi campaign.
        withdrawRequestedAt:
          timestamp(
            'withdraw_requested_at',
            {
              withTimezone: true,
            },
          ),
  
        // Rút khỏi campaign thành công.
        withdrawnAt:
          timestamp(
            'withdrawn_at',
            {
              withTimezone: true,
            },
          ),
  
        // Sau này BTC xác nhận người này hoàn tất tham gia.
        participationCompletedAt:
          timestamp(
            'participation_completed_at',
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
        /*
         * Một user chỉ có một application trong một campaign.
         *
         * Đây là constraint quan trọng để tránh duplicate apply
         * và tránh một người chiếm nhiều position cùng campaign.
         */
        uniqueIndex(
          'campaign_applications_campaign_user_unique',
        ).on(
          table.campaignId,
          table.applicantUserId,
        ),
  
        // BTC thường lấy toàn bộ đơn của một campaign để review.
        index(
          'campaign_applications_campaign_id_idx',
        ).on(
          table.campaignId,
        ),
  
        // Dùng để tính số application/confirmed của từng position.
        index(
          'campaign_applications_position_id_idx',
        ).on(
          table.positionId,
        ),
  
        // Người dùng xem danh sách đơn của chính mình.
        index(
          'campaign_applications_applicant_user_id_idx',
        ).on(
          table.applicantUserId,
        ),
  
        /*
         * Dùng rất nhiều ở các query:
         * pending review, confirmed, waitlisted...
         */
        index(
          'campaign_applications_status_idx',
        ).on(
          table.status,
        ),
  
        /*
         * Query phổ biến của BTC:
         * lấy application của campaign theo status.
         */
        index(
          'campaign_applications_campaign_status_idx',
        ).on(
          table.campaignId,
          table.status,
        ),
      ],
    );