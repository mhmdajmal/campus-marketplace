# Campus Market — Student Marketplace (Expo / React Native)

A complete mobile-friendly **Campus Marketplace** source project with a refreshed UI, verified Gmail sign-in, listing management, favourites, and buyer–seller messaging with sender names. Designed for a student group demonstration using **React Native + Expo + TypeScript + Firebase Authentication + Cloud Firestore**.

> **Free-only setup:** This project uses Firebase's Spark tier for supported Auth/Firestore usage. **No paid subscription, Cloudinary, payment card, Firebase Storage bucket, or gallery-upload service is required.** Gallery uploads are intentionally turned off; an existing public HTTPS image URL is optional. Usage limits apply.

## Main features

- Clean, responsive marketplace home with category browsing, keyword search, price filters, sorting, and product cards.
- Create account using a **Gmail address**, full display name, optional university/campus and faculty/department, plus password; verify email before selling or messaging.
- Edit your public name, university and faculty in Profile.
- Post, edit, mark sold/active, and delete your own listings. Every item has a price, category, condition, description, and public-campus pickup location.
- Save/unsave favourites; saved items persist in Firestore for verified accounts.
- Separate chats per **listing + buyer**: seller inbox shows each buyer's name, buyer inbox shows the seller's name, each chat bubble shows the sender's name (or **You**) and time.
- Older conversations/messages remain in Firestore. Each account backfills its own display name into previous conversations when used with the updated app.
- Report a listing. Firebase security rules protect listings, user profiles, saved IDs, and participant-only conversations.
- Demo browsing when Firebase is not configured. Real posting/messaging requires Firebase keys and published rules.

**Identity note:** The app displays names entered by users themselves. Gmail verification verifies mailbox ownership, **not** student enrolment or legal identity. Do not use this app to collect student IDs or private contact information.

## Start from ZIP — Windows 11 / VS Code

Requires **Node.js 22+**, npm and VS Code; Android users can install Expo Go. Extract the entire ZIP and open the folder containing `package.json`.

```powershell
npm install
Copy-Item .env.example .env
# Edit .env with your own Firebase web-app config (or skip for Demo Mode).
npm run verify
npx expo start -c
```

Press **`w`** in the Expo terminal to open a browser preview, or scan the QR code with Expo Go on a phone. Phone and laptop should use the same Wi-Fi when using LAN mode. **Do not** run commands in an enclosing ZIP/extracted wrapper folder; run inside `campus-marketplace-complete`.

If the user already has a working `.env` for **their own** Firebase project, copy it privately into the new project on their own computer. Never post it in a public repository, README, screenshot, or chat.

## Configure Firebase (needed for real accounts, listings, favourites & chat)

1. Open [Firebase Console](https://console.firebase.google.com/) and use your own Firebase project on the **Spark (no-cost)** plan.
2. In Project settings > Your apps, register a Firebase **Web** app. Copy its 6 public configuration values into `.env` using variable names in `.env.example`.
3. Authentication > Sign-in method > enable **Email/Password**. The app sends Gmail verification emails.
4. Firestore Database > create **the default Firestore database** with production-mode rules, if not already created.
5. Firestore Database > **Rules** > replace the current rules with this project's `firestore.rules` and click **Publish**. This step is mandatory for the updated chat-name fields. No database collections need to be manually created.
6. Restart Metro: `Ctrl+C`, `npx expo start -c`. Sign in using a verified `@gmail.com` account.

Alternatively, users with Firebase CLI and access to the correct project can deploy only rules:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

**Before deploying rules, confirm the active Firebase project.** These rules intentionally only permit verified `@gmail.com` users to write; the assignment does not support non-Gmail sign-in. **Do not** change rules to `allow read, write: if true`.

The Firebase configuration values exposed as `EXPO_PUBLIC_*` are client identifiers, not admin secrets. Nonetheless, keep `.env` outside Git and never commit Firebase Admin SDK credentials or API secrets. The `.gitignore` excludes `.env`.

## Test with two people

1. Open a normal browser window, register/verify **Seller A**, and create a listing.
2. Open a private/incognito window on the same laptop, register/verify **Buyer B** with a *different* Gmail address.
3. Buyer B opens the item, taps **Chat with seller**, sends a message. Seller A opens Messages and replies.
4. Verify inbox rows display **the other participant's name**, message bubbles say **You** or the actual registered display name, and times display.
5. Verify a second buyer sees a separate conversation for the same listing. Save/unsave a listing and test refreshing the browser.
6. Seller tests Edit, Mark sold/active and Delete on a *temporary* listing.

### Run commands

```powershell
npm run check        # TypeScript checking
npm run test:logic   # Listing and sender-identity unit tests
npm run verify       # Both checks
npx expo start -c    # Development web / Android / iOS
```

### Project structure

```text
App.tsx                 Expo entry re-export
src/App.tsx             Navigation, Firebase authentication and live listeners
src/screens/Explore.tsx Marketplace feed, categories, filters and sorting
src/screens/Detail.tsx  Listing details and Contact Seller
src/screens/Sell.tsx    Add/edit listings with safe validation
src/screens/Saved.tsx   Favourites
src/screens/Profile.tsx User profile, editing/sold/delete
src/screens/Auth.tsx    Sign up, sign in and password reset
src/screens/Messages.tsx Inbox and labelled chat bubbles
src/services/market.ts Firebase Auth/Firestore CRUD and chat operations
src/utils/chat.ts       Name attribution and unique conversation IDs
src/utils/marketplace.ts Filtering and validation
src/components/UI.tsx   Reusable design components and responsive cards
src/theme.ts            UI colours, spacing and typography
firestore.rules         Updated participant-based Firestore permissions
tests/                  No-credential unit tests
docs/                   Group workflow and test plan
.env.example            Placeholder Firebase client configuration
```

## University group assignment / GitHub

This ZIP is a **standalone consolidated source package assembled from the Campus Marketplace upgrade work**. It does **not** contain the original `webtegy/campus-marketplace` Git history. If your lecturer requires the original repository to be **cloned and extended**, a group member should clone [webtegy/campus-marketplace](https://github.com/webtegy/campus-marketplace), compare its current contents and integrate/commit this upgraded application appropriately—do not pretend the ZIP by itself preserves upstream commit history.

Each student must contribute meaningful changes using their **own Git identity**. Keep your group README accurate and link real branches/commits; don't fabricate authorship or Git contributions. Only the group can record who actually did each feature.

**Group members / contributions:**

| Member | Email / Student ID | Contribution | GitHub Branch / PR |
| --- | --- | --- | --- |
| Mohamed Aqeel | mohamedaqeel1130@gmail.com | Student Authentication, Gmail Verification & Profile Management | `feature/auth-and-profile` |
| Mohomed Ajmal | ajmalmohomed544@gmail.com | Navigation Shell, Marketplace Feed, UI Components & Theme Design | `feature/explore-and-navigation` |
| Mohamed Shamil | shamilugc@gmail.com | Real-time Buyer-Seller Messaging, Chat Identity Attribution & Chat Tests | `feature/messaging-and-chat` |
| M.H. Bandara | mhbandara2003@gmail.com | Listing Management, Sell Form Validation & Favourites (Saved Items) | `feature/listings-and-favorites` |
| K. Oshan | 2001oshan@gmail.com | Cloud Firestore Data Services, Security Rules, CI Pipeline & Test Suite | `feature/backend-services-and-tests` |

Assignment deliverables: **final GitHub repository**, **updated README** and **5–8 minute recorded demo**. Demonstrate login, selling, searching, saving, namespaced two-way chat, and GitHub contributions.

See `docs/GROUP-GITHUB-WORKFLOW.md` and `docs/TEST-PLAN.md`.

## Troubleshooting

- **Demo Mode / no live data:** Check `.env` keys are valid, save, restart Expo with `-c`.
- **Permission denied:** Sign into verified Gmail; publish the included `firestore.rules` to the matching Firebase project. Sign out/in if the auth token is stale.
- **An item won't save:** Check title >= 4 characters, description >= 10 characters, pickup location >= 2 characters, valid nonnegative price and HTTPS-only optional image URL.
- **Messages don't open:** Verify the two accounts are *different*, the item is active, and the latest Firestore rules were published.
- **No gallery image selector:** Intentional, for a free-only setup. To show images, use an existing public HTTPS image URL; otherwise the product card displays an illustrated category icon.
- **Another computer:** Copy source ZIP, install Node, run `npm install`, supply your own `.env` privately, and start Expo. No `node_modules` should be transferred.

## Licensing

The consolidated sample app code in this package includes a `LICENSE`. If integrating it with an upstream repository, follow the upstream repository's licence requirements and retain attribution as required.
