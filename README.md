# Lead Form → Admin Panel → Google Sheets export

Chota, simple Next.js project:
1. Public page pe ek contact/lead form hai.
2. Submissions ek local JSON file (`data/db.json`) mein store hoti hain.
3. `/admin` panel mein saari entries dikhti hain — table format mein.
4. "Export to Google Sheet" button dabate hi sirf **naye (not-yet-exported)**
   entries Google Sheet mein append ho jaati hain.

## Deploy on Vercel

1. Code ko GitHub repo mein push karo.
2. [vercel.com](https://vercel.com) pe jao → "Add New Project" → apna repo import karo.
3. **Database setup** — Project ke "Storage" tab mein jao → "Create Database" →
   "Postgres" (Neon-powered, free tier) select karo → connect karo. Vercel
   khud `POSTGRES_URL` env var add kar dega, koi manual copy-paste nahi
   chahiye. (Ya chaho to Neon/Supabase khud se bhi connect kar sakte ho —
   bas `DATABASE_URL` env var mein connection string daal dena.)
4. Project ke "Settings" → "Environment Variables" mein baaki 4 add karo:
   - `ADMIN_PASSWORD`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (poori value, quotes ke andar, `\n` waisa hi rehne do)
   - `GOOGLE_SHEET_ID`
5. "Deploy" dabao. Table (`submissions`) khud-ba-khud ban jaayegi pehli
   request pe — koi migration script chalane ki zarurat nahi.

Deploy hone ke baad `/registration` pe ek test entry daal ke `/admin` mein
check kar lena ki data aa raha hai, phir export try karna.

## Local development

```bash
npm install
cp .env.example .env.local
```

Local testing ke liye `DATABASE_URL` mein koi bhi Postgres connection string
daal do — same Vercel Postgres wali bhi use kar sakte ho (internet pe
accessible hoti hai), ya apne machine pe local Postgres chala lo.

```bash
npm run dev
```

## Google Sheets export setup (one-time, ~5 min)

1. **Google Cloud Console** → naya project (ya existing use karo) →
   "APIs & Services" → "Enabled APIs" → **Google Sheets API** ko enable karo.
2. "Credentials" → "Create Credentials" → **Service Account** banao.
   - Koi role assign karne ki zarurat nahi hai.
3. Service account create hone ke baad, uspe click karo → "Keys" tab →
   "Add Key" → "Create new key" → **JSON**. File download hogi.
4. Us JSON file mein se do cheezein chahiye:
   - `client_email` → `.env.local` mein `GOOGLE_CLIENT_EMAIL`
   - `private_key` → `.env.local` mein `GOOGLE_PRIVATE_KEY` (quotes ke andar,
     `\n` waisa hi rehne do jaisa JSON mein hai)
5. Apni Google Sheet kholo, **Share** button dabao, aur us
   `client_email` (service account) ko **Editor** access do. Ye step
   miss mat karna — isके bina export fail hoga ("permission denied").
6. Sheet ke URL se ID copy karo:
   `https://docs.google.com/spreadsheets/d/THIS_PART/edit` →
   `.env.local` mein `GOOGLE_SHEET_ID`
7. Sheet mein ek tab hona chahiye jiska naam **Sheet1** ho (ya
   `src/lib/googleSheets.js` mein `range: "Sheet1!A1"` ko apne tab
   name se replace kar do). Columns order: Date, Name, Email, Phone,
   Message — pehli row mein header khud daal lena (optional).

Bas itna hi. Ab admin panel se "Export to Google Sheet" dabaoge to
sirf naye entries hi jayenge — same entry dobara export nahi hogi.

## Deploy note (VPS / PM2 setup — alternative to Vercel)

Agar Vercel ki jagah apne VPS pe hi rakhna ho (PM2 + Nginx), to code same
rahega bas `DATABASE_URL` ko apni Postgres instance (RDS, ya VPS pe khud
chalayi hui Postgres) se point kar dena:

```bash
npm run build
pm2 start npm --name "leadform" -- start
```


## Tech stack

- Next.js 15 (App Router) + Tailwind
- Postgres (via `pg`) — works with Vercel Postgres, Neon, Supabase, or any Postgres instance
- googleapis — Google Sheets API export, auto-creates one tab per course
- Cookie-based simple admin auth (single shared password)
