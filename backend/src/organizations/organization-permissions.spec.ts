import {
    describe,
    expect,
    it,
  } from '@jest/globals';
  
  import {
    ORGANIZATION_PERMISSIONS,
    ORGANIZATION_ROLE_PERMISSIONS,
  } from './organization-permissions';
  
  describe(
    'ORGANIZATION_ROLE_PERMISSIONS',
    () => {
      it(
        'PRIMARY_REPRESENTATIVE should have all organization permissions',
        () => {
          const permissions =
            ORGANIZATION_ROLE_PERMISSIONS
              .PRIMARY_REPRESENTATIVE;
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .VIEW_ORGANIZATION,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .UPDATE_ORGANIZATION,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .INVITE_MEMBER,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .MANAGE_MEMBER,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .TRANSFER_REPRESENTATIVE,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .CREATE_CAMPAIGN,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
        },
      );
  
      it(
        'MANAGER should manage organization and campaigns but not members',
        () => {
          const permissions =
            ORGANIZATION_ROLE_PERMISSIONS
              .MANAGER;
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .VIEW_ORGANIZATION,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .UPDATE_ORGANIZATION,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .CREATE_CAMPAIGN,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .INVITE_MEMBER,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .MANAGE_MEMBER,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .TRANSFER_REPRESENTATIVE,
          );
        },
      );
  
      it(
        'CAMPAIGN_MANAGER should manage campaigns only',
        () => {
          const permissions =
            ORGANIZATION_ROLE_PERMISSIONS
              .CAMPAIGN_MANAGER;
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .VIEW_ORGANIZATION,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .CREATE_CAMPAIGN,
          );
  
          expect(
            permissions,
          ).toContain(
            ORGANIZATION_PERMISSIONS
              .MANAGE_CAMPAIGN,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .UPDATE_ORGANIZATION,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .INVITE_MEMBER,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .MANAGE_MEMBER,
          );
  
          expect(
            permissions,
          ).not.toContain(
            ORGANIZATION_PERMISSIONS
              .TRANSFER_REPRESENTATIVE,
          );
        },
      );
  
      it(
        'STAFF should only have view permission',
        () => {
          const permissions =
            ORGANIZATION_ROLE_PERMISSIONS
              .STAFF;
  
          expect(
            permissions,
          ).toEqual([
            ORGANIZATION_PERMISSIONS
              .VIEW_ORGANIZATION,
          ]);
        },
      );
    },
  );