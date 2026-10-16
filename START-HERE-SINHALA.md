# Campus Market — ඉක්මනින් Run කරන හැටි

**මෙය සම්පූර්ණ standalone Expo source project ZIP එකකි.** කලින් දුන්න `upgrade-files` ZIP එක වගේ නෙවෙයි. මේකේ `package.json`, `App.tsx`, `src/` ඇතුළත්.

## VS Code Run

1. ZIP එකට `Extract All` කරන්න.
2. `campus-marketplace-complete` folder එක VS Code > File > Open Folder වලින් open කරන්න.
3. VS Code Terminal > New Terminal open කරන්න.
4. Commands එකින් එක run කරන්න:

```powershell
npm install
Copy-Item .env.example .env
```

5. පරණ project එකේ වැඩ කළ `.env` values හයක් තියෙනවා නම් ඒවා අලුත් `.env` එකට paste කරන්න. GitHub එකට `.env` යවන්න එපා. Firebase නැත්නම් Demo Mode පමණයි.
6. Firebase Console > Firestore > Rules හි **මේ ZIP එකේ `firestore.rules`** paste කර Publish කරන්න (data delete කරන්න එපා).
7. Terminal එකේ:

```powershell
npm run verify
npx expo start -c
```

Browser සඳහා `w` press කරන්න. Android phone සඳහා Expo Go QR code scan කරන්න.

## Chat names test

Normal browser එකේ seller login වෙන්න. Incognito browser එකේ වෙනත් verified Gmail එකකින් buyer login වෙන්න. Buyer එකෙන් item open කර **Chat with seller** කරන්න. දැන් Messages tab එකේ අනෙක් පුද්ගලයාගේ නම හා chat bubbles වල `You` / sender name පෙන්වන්න ඕනේ.

## ගාස්තු

Firebase Spark free tier භාවිත කරන්න. Blaze / billing / cloud storage enable කරන්න එපා. Gallery uploads මේ version එකේ නැහැ; photo නැති items දැමිය හැකියි, හෝ public HTTPS image URL එකක් දාන්න.

## යාළුවාට project එක දෙන්න

ZIP එකම දෙන්න. `.env` එක GitHub එකට හෝ public share එකකට දාන්න එපා. යාළුවා `npm install` කරලා තමන්ගේ `.env` configuration දාලා run කරන්න ඕනේ. Original repository history අවශ්‍ය නම් group member කෙනෙක් original repo clone කරලා files integrate කරන්න; ZIP එකේ Git history ඇතුළත් නොවේ.
