# Integrasi katalog dengan Admin Uwais Food

Website GitHub Pages bersifat statis. Karena itu, website tidak dapat membaca database internal Admin secara langsung. Admin perlu menyediakan **endpoint JSON publik khusus katalog** atau mengekspor katalog publik ke `data/products.json`.

## Kontrak JSON yang dibaca website

Website menerima salah satu bentuk berikut:

```json
{
  "updatedAt": "2026-11-09T10:00:00+07:00",
  "products": [
    {
      "id": "bolen-pisang-premium",
      "name": "Bolen Pisang Premium",
      "category": "pastry",
      "categoryLabel": "Pastry",
      "description": "Pisang keju dan cokelat.",
      "price": 65000,
      "priceLabel": "Rp65.000",
      "unit": "10 pcs",
      "tag": "FAVORIT",
      "image": "https://alamat-gambar-publik/bolen.jpg",
      "active": true
    }
  ]
}
```

`products` juga boleh berupa array JSON langsung. Kategori yang digunakan filter adalah `pastry`, `cake`, dan `hampers`. Produk dengan `active: false` tidak ditampilkan.

## Mengaktifkan endpoint
1. Admin Uwais Food perlu menyediakan URL JSON yang dapat dibaca publik tanpa login.
2. Endpoint hanya boleh mengembalikan field katalog: nama produk, kategori, deskripsi, harga publik, URL foto, label, dan status tayang.
3. Jangan mengembalikan nomor telepon pelanggan, alamat, pesanan, catatan internal, token, atau data sensitif lainnya.
4. Pastikan URL dapat diakses dari browser dan mengizinkan request lintas domain (CORS) dari domain GitHub Pages.
5. Masukkan URL tersebut pada `catalogUrl` di `config.js`.

Contoh:
```js
catalogUrl: "https://script.google.com/macros/s/ID_DEPLOYMENT/exec"
```

## Alternatif paling sederhana
Jika aplikasi Admin belum memiliki endpoint, admin dapat mengekspor atau memperbarui `data/products.json` di repository GitHub. Website akan membaca file tersebut saat halaman dimuat.

## Penting untuk proyek Uwais Food
Alamat Admin yang pernah digunakan adalah `https://varizreza.github.io/uwaisfood/`. Website showcase ini tidak mengakses atau mengubah halaman admin tersebut. Integrasi otomatis baru aktif setelah endpoint katalog publik disiapkan dan diuji. Jangan mengarahkan pengunjung website publik ke URL admin.
