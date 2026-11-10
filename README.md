# Uwais Food — Official Showcase Website

Website showcase Uwais Food dengan gaya modern M3-inspired, responsif, dan siap dipublikasikan melalui GitHub Pages.

## Isi folder
- `index.html` — halaman utama.
- `assets/styles.css` — desain, layout, responsif, dan tema gelap.
- `assets/app.js` — filter katalog, tema, menu mobile, dan pemuatan katalog.
- `config.js` — pengaturan WhatsApp, Instagram, lokasi, dan endpoint katalog.
- `data/products.json` — data katalog awal.
- `docs/INTEGRASI-ADMIN.md` — kontrak data untuk integrasi katalog Admin Uwais Food.

## Sebelum dipublikasikan
1. Buka `config.js`.
2. Isi `whatsappNumber` dengan nomor WhatsApp toko, format internasional tanpa `+` (contoh `6281234567890`).
3. Pastikan tautan Instagram benar.
4. Periksa nama, harga, deskripsi, dan foto produk di `data/products.json`.
5. Uji `index.html` melalui Live Server atau hosting sementara.

## Deploy ke GitHub Pages
1. Buat repository GitHub, misalnya `uwaisfood-website`.
2. Upload seluruh isi folder ini ke root repository (pastikan `index.html` ada di root).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/ (root)`, lalu **Save**.
6. Tunggu proses selesai. URL akan berbentuk `https://USERNAME.github.io/NAMA-REPOSITORY/`.

Jika ingin memakai domain sendiri, atur Custom domain di halaman GitHub Pages dan DNS domain.

## Catatan
- Website ini adalah showcase/katalog, bukan checkout dan bukan panel admin.
- Data contoh tetap tersedia jika endpoint katalog belum dipasang.
- Foto contoh menggunakan URL gambar eksternal; ganti dengan foto produk asli Uwais Food untuk hasil branding terbaik.
- Jangan pernah menaruh API key rahasia, data pelanggan, transaksi, atau kredensial admin di file JavaScript publik.


## Integrasi katalog otomatis dari Admin Uwais Food
Paket ini juga menyertakan:
- `AppsScript/PublicCatalog_Addon.gs`
- `AppsScript/PATCH-doGet.txt`

Ikuti patch doGet. Tambahkan file `.gs` baru ke project Apps Script Admin yang sama, lalu ganti fungsi `doGet(e)` sesuai petunjuk. Jangan mengganti backend Admin seluruhnya.

Setelah deploy versi baru, isi `catalogUrl` di `config.js` dengan URL Web App Apps Script berakhiran `/exec`, misalnya:
```js
catalogUrl: "https://script.google.com/macros/s/ID_DEPLOYMENT/exec"
```
Website menggunakan JSONP untuk mengambil katalog lintas domain dari Apps Script. Jika endpoint gagal, katalog statis `data/products.json` tetap tampil.

Catatan pemetaan saat ini:
- Kolom `Nama` → nama produk.
- Kolom `Harga` → harga.
- Kolom `Isi` → deskripsi.
- Kolom `GambarURL` → foto.
- Kategori dikenali dari kata pada nama: cake/dessert → Cake & Dessert; hampers/parcel/gift → Hampers; selainnya → Pastry.
- Semua produk bernama akan tampil. Untuk menyembunyikan produk tertentu, hapus barisnya dari Menu atau pada tahap berikutnya kita tambahkan kolom `Tampilkan di Website`.
