# Manual testing checklist

## Environment
- Run `npm install`, `npm run verify`, `npx expo start -c`.
- Have one normal browser logged into a verified seller Gmail and one private browser logged into a different verified buyer Gmail.
- Deploy the package's exact `firestore.rules` to the proper Firebase project.

## Authentication / profile
- [ ] Register buyer using full name + Gmail + password; optionally fill campus/faculty.
- [ ] App requires Gmail verification before posting/chatting.
- [ ] Login and logout work.
- [ ] Profile shows name, university/campus and faculty; editing those values persists after refresh.
- [ ] Name in chat identifies sender; no one else's email, phone or home address is shown.

## Listings
- [ ] Seller can publish without photo; product card shows illustrated category icon.
- [ ] Validation rejects missing title/description, invalid price and bad image URL.
- [ ] Edit stays on same listing; refresh retains changes.
- [ ] Sold status prevents new chats and excludes item from normal search feed.
- [ ] Mark active restores an eligible listing.
- [ ] Delete on web asks confirmation and removes temporary listing. Test on Android too.

## Search / Saved
- [ ] Search by item title, description or pickup area.
- [ ] Filter by category and price; sort recent / low / high.
- [ ] Save/unsave; saved listing remains after browser refresh.

## Messaging
- [ ] Buyer sends seller a message; seller replies; both messages arrive live.
- [ ] Seller inbox shows buyer name + item, buyer inbox shows seller name + item.
- [ ] Chat bubbles show `You` and other participant's name, plus time.
- [ ] Second buyer creates a separate conversation on same listing.
- [ ] Old chats still show and backfill participant name after accounts reopen updated app.
- [ ] Unverified user cannot send/receive privileged data; Firestore permissions are not made public.

## Submission
- [ ] README updated with real group members and actual contributions.
- [ ] Group members commit via their own identities to feature branches.
- [ ] GitHub code and README uploaded, `.env` not tracked.
- [ ] 5–8 minute demo video separately recorded.
