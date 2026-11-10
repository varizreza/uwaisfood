# Uwais Food — Official Showcase Website

Website showcase resmi Uwais Food dengan gaya modern, responsif, dan siap dipublikasikan melalui GitHub Pages.

## Isi folder
- `index.html` — halaman utama.
- `assets/styles.css` — desain, layout, tema gelap, dan galeri.
- `assets/app.js` — filter katalog, tema, navigasi mobile, dan pemuatan konten publik CMS.
- `config.js` — pengaturan WhatsApp, Instagram, lokasi, dan endpoint publik Apps Script.
- `data/products.json` — katalog contoh/fallback.
- `docs/INTEGRASI-ADMIN.md` — panduan integrasi dengan Admin Uwais Food.

## CMS
Panel pengelolaan berada pada repository terpisah:
https://github.com/varizreza/uwaisfood-cms

Target domain CMS: https://cms.uwaisfood.my.id

Konten yang sudah dipublikasikan dari CMS meliputi teks beranda, banner, produk yang ditampilkan/unggulan, promo, galeri, profil toko, kontak, dan SEO. Data nama, harga, deskripsi, dan gambar produk tetap bersumber dari sheet Menu pada Apps Script Admin.

## Mengaktifkan sinkronisasi CMS
1. Pasang `WebsiteCMS_Addon.gs` ke project Apps Script Admin Uwais Food.
2. Ikuti `PATCH-INTEGRASI-CODEGS.md` di repository CMS untuk mendaftarkan action pada `api_()` dan endpoint publik pada `doGet(e)`.
3. Deploy Apps Script sebagai versi baru.
4. Buka `config.js` pada repository ini.
5. Isi `catalogUrl` dengan URL dasar Web App Apps Script yang berakhiran `/exec`.
6. Commit perubahan `config.js` ini.

Website membaca endpoint JSONP `?publicCatalog=1`. Setelah patch CMS dipasang, endpoint tersebut mengembalikan konten publik yang dipublikasikan serta produk aktif dari sheet Menu. Jika endpoint kosong/gagal, website tetap menampilkan katalog lokal dari `data/products.json`.

## Deploy website via GitHub Pages
1. Buka Settings → Pages pada repository ini.
2. Pilih Deploy from a branch.
3. Pilih branch `main`, folder `/(root)`.
4. Pastikan domain utama `uwaisfood.my.id` telah dikonfigurasi.
5. Aktifkan HTTPS jika sertifikat sudah tersedia.

## Keamanan
- Jangan pernah memasukkan PIN Admin, token sesi, API key, data pesanan, alamat pelanggan, atau data pribadi ke repository publik.
- Endpoint publik hanya boleh mengirim konten website yang sudah dipublikasikan dan kolom katalog publik.
- Draft dan publikasi disimpan di Google Spreadsheet oleh Apps Script, bukan di GitHub.
