# Security Specification - Neurohx

## Data Invariants
1. A user can only access their own data (Chat, Journal, Habits, Mood, Assessment).
2. The `plan` field in the user profile can only be modified by an Admin or through a verified payment/referral outcome.
3. Timestamps (`createdAt`, `updatedAt`) must be strictly validated.
4. User IDs must be exactly matched to the authenticated user's UID.
5. All document IDs must be valid alphanumeric strings.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Theft**: Trying to create a user profile with a different UID than `request.auth.uid`.
2. **Shadow Field Injection**: Adding an `isAdmin: true` field to a user profile update.
3. **Plan Escalation**: Updating the `plan` from `free` to `premium` without a generic payment ID.
4. **Referral Fraud**: Creating a referral where the `referrerId` is the user themselves.
5. **Timestamp Spoofing**: Setting `createdAt` to a date in the past during document creation.
6. **Chat Scraping**: Listing all chats in the system without a `userId` filter.
7. **Mood Poisoning**: Entering a mood value of `10` (valid range is 1-5).
8. **Journal Size Attack**: Sending a 10MB journal entry to exhaust storage.
9. **Habit Streak Hack**: Manually updating the `streak` field to `999` without completing habits.
10. **Assessment Label Swap**: Changing a "Healthy" label to "Crisis" on a past assessment.
11. **Ticket Hijacking**: Updating a support ticket that doesn't belong to the user.
12. **Orphaned Write**: Creating a chat message for a chat ID that doesn't exist.

## Verification Checklist
- [ ] `match /{document=**}` is set to `allow read, write: if false;`
- [ ] `isValidId()` is used on all resource IDs.
- [ ] `affectedKeys().hasOnly()` is used on all updates.
- [ ] `isOwner()` is strictly enforced.
- [ ] `isVerified()` used for writes.
