# EduCreator System Workshop 2.0 Landing Page

Fail utama:

- `index.html` - landing page, borang pembelian, upload resit, dan admin panel.
- `apps-script.gs` - kod Google Apps Script untuk simpan rekod ke Google Sheet, simpan resit ke Google Drive, dan hantar emel pengesahan.

## Cara pasang Apps Script

1. Buka projek Apps Script yang digunakan untuk web app.
2. Gantikan kod sedia ada dengan kandungan `apps-script.gs`.
3. Pergi ke `Project Settings`, tambah Script Property:
   - `ADMIN_PASSWORD`
   - Nilai: `heryani95`
4. Deploy semula sebagai Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Pastikan URL deployment sama seperti dalam `index.html`, atau kemas kini nilai `CONFIG.scriptUrl`.

## Admin

Jika `ADMIN_PASSWORD` belum ditetapkan dalam Script Properties, kata laluan sementara dalam kod ialah:

```text
heryani95
```

Kata laluan admin semasa ialah `heryani95`.

## Aliran sistem

1. Pelanggan buat bayaran RM50.
2. Pelanggan isi borang dan muat naik resit.
3. Apps Script simpan data ke Google Sheet dan resit ke folder Drive.
4. Admin log masuk di bahagian Admin.
5. Admin klik `Sahkan`.
6. Sistem hantar emel pengesahan bersama maklumat bengkel dan link Telegram.
