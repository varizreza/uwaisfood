# Integrasi CMS dengan Admin Uwais Food

Website showcase mengambil konten publik dari CMS melalui Web App Google Apps Script Admin Uwais Food.

## Prasyarat
- Project Apps Script Admin yang aktif dan terhubung ke Spreadsheet Uwais Food.
- Add-on `WebsiteCMS_Addon.gs` dari repository `varizreza/uwaisfood-cms`.
- Patch dispatcher dan doGet pada file `apps-script/PATCH-INTEGRASI-CODEGS.md`.
- Deployment Apps Script versi terbaru yang tetap memakai URL /exec yang sama.

## Menyiapkan URL publik
Endpoint publik CMS memakai JSONP sehingga dapat dipanggil website GitHub Pages:
```
https://script.google.com/macros/s/ID_DEPLOYMENT/exec?publicCatalog=1&callback=namaCallback
```
Untuk tes JSON biasa, buka:
```
https://script.google.com/macros/s/ID_DEPLOYMENT/exec?websiteCmsPublic=1
```
Endpoint hanya mengirim:
- Konten website yang sudah dipublikasikan.
- Nama, kategori, deskripsi, harga publik, gambar, label, dan status tampil produk dari sheet Menu.

Endpoint tidak mengirim PIN/token, data pesanan, pelanggan, alamat/nomor pelanggan, data pembayaran, QRIS, atau pengaturan internal.

## Menghubungkan website
1. Buka file `config.js` pada repository website.
2. Isi `catalogUrl` dengan URL dasar deployment Apps Script yang berakhiran `/exec`, tanpa parameter query.
3. Commit perubahan tersebut.

Contoh:
```js
catalogUrl: "https://script.google.com/macros/s/ID_DEPLOYMENT/exec"
```

Website akan memanggil `?publicCatalog=1&callback=...` dan menerapkan data konten CMS saat endpoint merespons. Jika endpoint belum tersedia atau gagal, katalog lokal `data/products.json` tetap digunakan sebagai fallback.

## Pemetaan sumber produk
- Sheet `Menu` kolom Nama → nama produk.
- Kolom Harga → harga produk.
- Kolom Isi → deskripsi.
- Kolom GambarURL → URL foto.
- CMS menyimpan pengaturan tayang, unggulan, label, dan urutan secara terpisah pada sheet `WebsiteCMS`; master Menu tidak diubah.

## Pemecahan masalah
- Respons 404 / bukan JSONP: pastikan patch doGet sudah dipasang dan deployment Apps Script sudah diperbarui.
- Login CMS gagal dengan aksi tidak dikenal: pastikan lima action CMS didaftarkan pada objek `fns` di `api_()`.
- Draft tidak tersimpan: pastikan CMS memakai URL /exec yang sama dengan Admin dan token belum kedaluwarsa.
- Foto tidak tampil: pastikan Drive mengizinkan berbagi file dengan Anyone with the link.
- Katalog masih statis: cek nilai `catalogUrl` di `config.js` dan uji endpoint publik secara langsung.
