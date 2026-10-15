# Tài khoản mobile

Routes: /account (main tab), /account/[section] (profile, edit, registrations, donations, points, support, settings, password, security, devices, terms, privacy). Unknown section has a safe return to Account. Nested screens use safe area, back navigation, keyboard avoidance and scrolling; assistant dock supplies bottom inset.

Attendance uses existing /attendance. NOI AI uses existing useAssistant().open. No second attendance, AI or auth module.

## Data and integration boundaries
- Profile and goals: session-only demo profile; existing 12 activities / 86 hours are explicitly sample values. Not inferred from attendance. Reconnect these selectors to profile and aggregate APIs when authenticated.
- CampaignDetailScreen submit/cancel callbacks update this same session list; new submissions remain submitted, never confirmed automatically. Existing approvals are preserved on duplicate submit.
- Registration list reads demoSession.applications for current demo actor, same source as attendance approval. submitted/waitlisted are waiting; confirmed is eligible for attendance; completed/cancelled remain separate. No check-in actions here.
- DonationPanel and DonationFlowScreen write to donationSession. Store and Account read walletSession. Existing wallet redemption rules unchanged. Demo contributions are never counted as paid money. Nothing is sent to a fabricated endpoint.
- Notifications are session-only UI preferences, not push subscriptions. Profile edits and support drafts reset on app restart. Support drafts are not submitted.
- Existing demo logout is retained: exit demo and reset profile. No remember-account option because no mobile authentication session supports it.
- Security/password/devices require the real auth adapter. These pages clearly say unavailable; no fake success or fake devices.
- No configured official support email/Zalo, terms or privacy documents were found in the mobile app. Email has an explanatory empty state; Zalo is omitted; legal pages await approved content.

## Backend work before production
Connect authenticated profile read/update; current-user application query; verified donation history and payment methods; points ledger and published reward policy; support ticket submission/contact configuration; notification preferences/push registration; legal content; real auth signOut/password/session management. Authorization and verified payment status must remain server-controlled. Do not use sessionStore as production persistence/authentication.

## Manual iPhone QA
Open all eight Account menus; back/swipe-back/deep-link fallback; large text at 320/375 pt; scroll through Profile; keyboard in Edit/Support; edit and return; donation demo then Account history (paid total stays zero); redeem gift then Account balance; FAQ search/no result; existing NOI AI sheet; attendance link; settings unavailable states; cancel logout then confirm logout. Native device QA is still required.

## Files changed in this task

Added:
- src/app/account/[section].tsx
- src/features/account/AccountDetailScreen.tsx
- src/features/account/model.ts
- src/features/account/navigation.ts
- src/features/account/session.ts
- src/lib/sessionStore.ts
- src/features/contributions/session.ts
- src/features/store/session.ts
- src/features/campaigns/registrationState.ts
- src/features/campaigns/registrationSession.ts
- tests/account.test.mjs
- docs/account.md

Updated:
- src/features/account/AccountScreen.tsx
- src/features/contributions/DonationPanel.tsx
- src/features/contributions/DonationFlowScreen.tsx
- src/features/store/StoreScreen.tsx
- src/features/campaigns/CampaignDetailScreen.tsx
- tests/button-render.test.mjs

Validation: TypeScript passed; 45 tests passed; ESLint zero errors, eight existing unused-symbol warnings in campaign/contribution screens. Final iOS bundle export passed after registration integration (1,628 modules). Menu route targets and their handlers were inspected in source. Device-level tapping, safe-area, scrolling and keyboard verification still require an iPhone and are not claimed as tested.

