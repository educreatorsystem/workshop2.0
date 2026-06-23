# EduCreator System Workshop 2.0 Landing Page

Fail utama:

- `index.html` - landing page, borang pembelian, upload resit, dan admin panel.
- `assets/maybank-qr.png` - gambar QR bayaran Maybank.
- `apps-script.gs` - kod Google Apps Script untuk simpan rekod ke Google Sheet, simpan resit ke Google Drive, dan hantar emel pengesahan.

## Cara publish menggunakan GitHub Pages

1. Login ke GitHub.
2. Buat repository baharu, contoh nama: `educreator-workshop`.
3. Upload fail dan folder berikut ke repository:
   - `index.html`
   - `assets/maybank-qr.png`
   - `README.md`
   - `apps-script.gs`
4. Pergi ke `Settings` repository.
5. Pilih `Pages`.
6. Pada bahagian `Build and deployment`, pilih:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
7. Klik `Save`.
8. Tunggu beberapa minit sehingga GitHub beri link website, biasanya dalam format:

```text
https://username.github.io/educreator-workshop/
```

Nota: `index.html` dan folder `assets` ialah fail website. `apps-script.gs` tidak berjalan di GitHub; kod itu perlu dipasang dalam Google Apps Script seperti langkah di bawah.

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
