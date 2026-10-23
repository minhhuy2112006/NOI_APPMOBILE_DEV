import {
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import {
    eq,
  } from 'drizzle-orm';
  
  import { DatabaseService } from '../database/database.service';
  
  import {
    userSettings,
    users,
  } from '../database/schema';
  
  import type { UpdateProfileDto } from './dto/update-profile.dto';
  import type { UpdateSettingsDto } from './dto/update-settings.dto';
  
  @Injectable()
  export class UsersService {
    constructor(
      private readonly database: DatabaseService,
    ) {}
  
    async getProfile(
      userId: string,
    ) {
      const [user] =
        await this.database.db
          .select({
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
            birthday: users.birthday,
            gender: users.gender,
            phone: users.phone,
            email: users.email,
            city: users.city,
  
            emergencyName:
              users.emergencyName,
  
            emergencyRelationship:
              users.emergencyRelationship,
  
            emergencyPhone:
              users.emergencyPhone,
  
            skills: users.skills,
            interests: users.interests,
  
            memberSince:
              users.memberSince,
  
            createdAt:
              users.createdAt,
  
            updatedAt:
              users.updatedAt,
          })
          .from(users)
          .where(
            eq(users.id, userId),
          )
          .limit(1);
  
      if (!user) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message:
            'Không tìm thấy người dùng.',
        });
      }
  
      return user;
    }
  
    async updateProfile(
      userId: string,
      dto: UpdateProfileDto,
    ) {
      const values: {
        name?: string;
        birthday?: string;
        gender?: string;
        phone?: string;
        city?: string;
  
        emergencyName?: string;
        emergencyRelationship?: string;
        emergencyPhone?: string;
  
        skills?: string[];
        interests?: string[];
  
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };
  
      if (dto.name !== undefined) {
        values.name =
          dto.name.trim();
      }
  
      if (dto.birthday !== undefined) {
        values.birthday =
          dto.birthday;
      }
  
      if (dto.gender !== undefined) {
        values.gender =
          dto.gender.trim();
      }
  
      if (dto.phone !== undefined) {
        values.phone =
          dto.phone.trim();
      }
  
      if (dto.city !== undefined) {
        values.city =
          dto.city.trim();
      }
  
      if (
        dto.emergencyName !== undefined
      ) {
        values.emergencyName =
          dto.emergencyName.trim();
      }
  
      if (
        dto.emergencyRelationship !==
        undefined
      ) {
        values.emergencyRelationship =
          dto.emergencyRelationship.trim();
      }
  
      if (
        dto.emergencyPhone !== undefined
      ) {
        values.emergencyPhone =
          dto.emergencyPhone.trim();
      }
  
      if (dto.skills !== undefined) {
        values.skills =
          dto.skills
            .map((item) => item.trim())
            .filter(Boolean);
      }
  
      if (dto.interests !== undefined) {
        values.interests =
          dto.interests
            .map((item) => item.trim())
            .filter(Boolean);
      }
  
      try {
        const [updated] =
          await this.database.db
            .update(users)
            .set(values)
            .where(
              eq(users.id, userId),
            )
            .returning({
              id: users.id,
            });
  
        if (!updated) {
          throw new NotFoundException({
            code: 'USER_NOT_FOUND',
            message:
              'Không tìm thấy người dùng.',
          });
        }
      } catch (error: unknown) {
        if (
          this.isUniqueViolation(error)
        ) {
          throw new ConflictException({
            code: 'EMAIL_ALREADY_REGISTERED',
            message:
              'Email này đã được sử dụng.',
          });
        }
  
        throw error;
      }
  
      return this.getProfile(userId);
    }
  
    async getSettings(
      userId: string,
    ) {
      const [settings] =
        await this.database.db
          .select()
          .from(userSettings)
          .where(
            eq(
              userSettings.userId,
              userId,
            ),
          )
          .limit(1);
  
      if (!settings) {
        throw new NotFoundException({
          code: 'USER_SETTINGS_NOT_FOUND',
          message:
            'Không tìm thấy cài đặt người dùng.',
        });
      }
  
      return settings;
    }
  
    async updateSettings(
      userId: string,
      dto: UpdateSettingsDto,
    ) {
      const [updated] =
        await this.database.db
          .update(userSettings)
          .set({
            ...dto,
            updatedAt: new Date(),
          })
          .where(
            eq(
              userSettings.userId,
              userId,
            ),
          )
          .returning();
  
      if (!updated) {
        throw new NotFoundException({
          code: 'USER_SETTINGS_NOT_FOUND',
          message:
            'Không tìm thấy cài đặt người dùng.',
        });
      }
  
      return updated;
    }
  
    private isUniqueViolation(
      error: unknown,
    ): boolean {
      if (
        typeof error !== 'object' ||
        error === null ||
        !('code' in error)
      ) {
        return false;
      }
  
      return (
        (
          error as {
            code?: unknown;
          }
        ).code === '23505'
      );
    }
  }