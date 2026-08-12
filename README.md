# Lead Form → Admin Panel → Google Sheets export

Chota, simple Next.js project:
1. Public page pe ek contact/lead form hai.
2. Submissions ek local JSON file (`data/db.json`) mein store hoti hain.
3. `/admin` panel mein saari entries dikhti hain — table format mein.
4. "Export to Google Sheet" button dabate hi sirf **naye (not-yet-exported)**
   entries Google Sheet mein append ho jaati hain.

## Run locally

```bash
npm install
cp .env.example .env.local   # fir values fill karo (neeche steps hain)
npm run dev
```

- Form: http://localhost:3000
- Admin: http://localhost:3000/admin (login page pe redirect hoga)
- Default admin password: `admin123` (ADMIN_PASSWORD env var se change karo)

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

## Deploy note (VPS / PM2 setup)

Since tum already PM2 + Nginx use karte ho (etcrm.ddns.net jaisa),
same pattern follow kar sakte ho:

```bash
npm run build
pm2 start npm --name "leadform" -- start
```

`data/db.json` file-based storage hai — agar high-traffic/production
use hoga to isse Postgres/SQLite mein migrate karna better rahega,
lekin chote lead-gen forms ke liye ye kaafi hai.

## Tech stack

- Next.js 15 (App Router) + Tailwind
- lowdb — simple JSON file storage for submissions
- googleapis — Google Sheets API export
- Cookie-based simple admin auth (single shared password)
