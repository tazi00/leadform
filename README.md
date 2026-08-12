# Registration Form → Google Sheets (direct, no database)

Chota, simple Next.js project:
1. `/registration` pe form hai — submit hote hi data **seedha Google Sheet**
   mein chala jaata hai (koi database beech mein nahi hai).
2. Har course apna alag tab (sheet) leta hai — same spreadsheet ke andar.
   Naya course aaya to naya tab khud-ba-khud ban jaata hai.
3. `/admin` panel Sheet se hi live data padh ke dikhata hai — "Refresh"
   button se latest data mil jaata hai, aur "Delete" se seedha Sheet se
   row hat jaati hai.

## Run locally

```bash
npm install
cp .env.example .env.local   # fir values fill karo (neeche steps hain)
npm run dev
```

- Form: http://localhost:3000 (redirect karta hai `/registration` pe)
- Admin: http://localhost:3000/admin (login page pe redirect hoga)
- Default admin password: `admin123` (`ADMIN_PASSWORD` env var se change karo)

## Google Sheets setup (one-time, ~5 min)

1. **Google Cloud Console** → naya project (ya existing use karo) →
   "APIs & Services" → "Enabled APIs" → **Google Sheets API** ko enable karo.
2. "Credentials" → "Create Credentials" → **Service Account** banao.
3. Service account create hone ke baad, uspe click karo → "Keys" tab →
   "Add Key" → "Create new key" → **JSON**. File download hogi.
4. Us JSON file mein se do cheezein chahiye:
   - `client_email` → `.env.local` mein `GOOGLE_CLIENT_EMAIL`
   - `private_key` → `.env.local` mein `GOOGLE_PRIVATE_KEY` (quotes ke andar,
     `\n` waisa hi rehne do jaisa JSON mein hai)
5. Apni Google Sheet kholo, **Share** button dabao, aur us
   `client_email` (service account) ko **Editor** access do. Ye step
   miss mat karna — isके bina kuch bhi kaam nahi karega.
6. Sheet ke URL se ID copy karo:
   `https://docs.google.com/spreadsheets/d/THIS_PART/edit` →
   `.env.local` mein `GOOGLE_SHEET_ID`

Bas itna hi — koi database, koi migration, kuch nahi chahiye. Form
submit hote hi entry seedha sheet mein dikhegi.

## Deploy on Vercel

1. Code ko GitHub repo mein push karo.
2. [vercel.com](https://vercel.com) pe "Add New Project" → repo import karo.
3. "Settings" → "Environment Variables" mein ye 4 add karo:
   - `ADMIN_PASSWORD`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
4. "Deploy" dabao. Koi database setup nahi chahiye — Vercel ka serverless
   environment yahan bilkul fine hai kyunki storage hi nahi hai, sab
   seedha Google Sheets API se ho raha hai.

## Deploy note (VPS / PM2 setup — alternative to Vercel)

```bash
npm run build
pm2 start npm --name "leadform" -- start
```

## Tech stack

- Next.js 15 (App Router) + Tailwind
- googleapis — Google Sheets hi ek "database" hai, ek course = ek tab
- Cookie-based simple admin auth (single shared password)
