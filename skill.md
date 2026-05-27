# Skill

Dokumen ini adalah katalog semua skill yang tersedia dalam sistem agen. Setiap skill merupakan unit kemampuan yang dapat dipanggil oleh agen untuk menyelesaikan tugas tertentu.

---

## Apa Itu Skill?

Skill adalah modul kemampuan yang terdefinisi dengan jelas — mencakup tujuan, cara penggunaan, input yang diterima, dan output yang dihasilkan. Agen membaca katalog ini untuk menentukan skill mana yang paling tepat digunakan dalam konteks tertentu.

---

## Panduan Penggunaan Skill

- Setiap skill memiliki nama unik dan deskripsi pemicu (trigger)
- Agen memilih skill berdasarkan kecocokan antara instruksi dan deskripsi skill
- Satu tugas dapat menggunakan lebih dari satu skill secara berurutan
- Skill baru dapat ditambahkan tanpa mengubah struktur agen inti

---

## Katalog Skill

---

### Skill: Membaca File

**Trigger:** Gunakan saat ada file yang diunggah dan kontennya belum tersedia dalam konteks.  
**Input:** Path file dari direktori unggahan  
**Output:** Isi file dalam format teks atau struktur data yang sesuai  
**Mendukung:** PDF, DOCX, XLSX, CSV, JSON, gambar  

---

### Skill: Membuat Dokumen Word

**Trigger:** Gunakan saat pengguna meminta dokumen .docx, laporan, memo, surat, atau template Word.  
**Input:** Konten teks, judul, dan instruksi pemformatan  
**Output:** File .docx yang siap diunduh  
**Catatan:** Tidak digunakan untuk PDF atau spreadsheet  

---

### Skill: Membuat Presentasi

**Trigger:** Gunakan saat ada file .pptx yang terlibat — baik sebagai input maupun output.  
**Input:** Konten slide, judul, dan struktur presentasi  
**Output:** File .pptx yang siap diunduh  
**Mendukung:** Membuat, membaca, mengedit, dan menggabungkan slide  

---

### Skill: Membuat Spreadsheet

**Trigger:** Gunakan saat spreadsheet adalah output utama yang dibutuhkan.  
**Input:** Data tabular, formula, atau instruksi pemformatan  
**Output:** File .xlsx yang siap diunduh  
**Mendukung:** Membuat, membaca, mengedit, dan membersihkan data  

---

### Skill: Membuat PDF

**Trigger:** Gunakan saat pengguna ingin membuat, mengisi, menggabungkan, atau memanipulasi PDF.  
**Input:** Konten teks, file sumber, atau instruksi transformasi  
**Output:** File .pdf yang siap diunduh  
**Catatan:** Gunakan skill membaca PDF terpisah untuk ekstraksi konten  

---

### Skill: Membaca PDF

**Trigger:** Gunakan saat perlu membaca, memeriksa, atau mengekstrak konten dari file PDF.  
**Input:** Path file PDF dari direktori unggahan  
**Output:** Teks atau data yang diekstrak dari PDF  
**Catatan:** Tidak digunakan untuk pembuatan atau manipulasi PDF  

---

### Skill: Desain Frontend

**Trigger:** Gunakan saat membangun antarmuka web, komponen UI, halaman, atau aplikasi berbasis browser.  
**Input:** Deskripsi desain, spesifikasi komponen, atau referensi visual  
**Output:** Kode HTML, CSS, atau React yang siap digunakan  
**Mendukung:** Website, dashboard, landing page, form, dan widget interaktif  

---

### Skill: Pengetahuan Produk

**Trigger:** Gunakan saat respons akan menyertakan fakta spesifik tentang produk Anthropic.  
**Input:** Pertanyaan tentang Claude API, Claude Code, atau Claude.ai  
**Output:** Informasi akurat dan terkini tentang produk  
**Catatan:** Selalu konsultasikan skill ini sebelum menjawab soal spesifikasi produk  

---

## Menambahkan Skill Baru

Untuk menambahkan skill baru ke dalam katalog, ikuti langkah berikut:

1. Buat file `SKILL.md` dengan mengacu pada template di `skill-template`
2. Definisikan nama, trigger, input, output, dan batasan dengan jelas
3. Simpan di direktori skill yang sesuai
4. Tambahkan entri ringkasan di dokumen ini
5. Uji skill dengan beberapa skenario nyata sebelum dirilis

---

## Prioritas Pengembangan Skill Baru

Skill berikut diidentifikasi sebagai kebutuhan berikutnya berdasarkan roadmap:

| Skill | Prioritas | Target Fase |
|-------|-----------|-------------|
| Integrasi Kalender | Tinggi | Fase 3 |
| Manajemen Email | Tinggi | Fase 3 |
| Analisis Data Lanjutan | Sedang | Fase 3 |
| Pencarian Web | Sedang | Fase 3 |
| Pembuatan Gambar | Rendah | Fase 4 |

---

## Referensi

- Definisi agen: `agent.md`
- Rencana pengembangan: `roadmap.md`

---

*Versi: 1.0 | Terakhir diperbarui: Mei 2026*
