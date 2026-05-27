# PDF Splitter — Sistem Agen Berbasis AI

Selamat datang di repositori **PDF Splitter**. Proyek ini membangun sistem agen yang andal, modular, dan mudah dikembangkan — mampu menangani berbagai tugas manipulasi dokumen secara cerdas dengan intervensi manusia yang minimal.

---

## 🧠 Tentang Proyek

PDF Splitter adalah sistem berbasis **Agentic Workflow** yang dirancang untuk:

- Membaca, memproses, dan memanipulasi berbagai format dokumen (PDF, DOCX, XLSX, dan lainnya)
- Mengeksekusi tugas secara mandiri menggunakan skill yang termodulasi
- Berkolaborasi antar komponen secara terstruktur dengan hasil yang akurat dan dapat ditindaklanjuti

---

## 📁 Struktur Repositori

```
PDF Splitter/
├── agent.md        # Definisi identitas, kemampuan, dan SOP agen utama
├── skill.md        # Katalog lengkap semua skill yang tersedia dalam sistem
├── roadmap.md      # Rencana pengembangan bertahap dari fondasi hingga multi-agent
└── README.md       # Dokumen ini — panduan umum proyek
```

### Penjelasan Dokumen Inti

| File | Peran |
|---|---|
| [`agent.md`](agent.md) | *Source of truth* untuk perilaku agen: cara kerja, batasan, dan protokol komunikasi |
| [`skill.md`](skill.md) | Katalog skill yang bisa dipanggil agen untuk menyelesaikan tugas tertentu |
| [`roadmap.md`](roadmap.md) | Rencana strategis pengembangan sistem dari Q2 2026 hingga Q2 2027 |

---

## ⚙️ Skill yang Tersedia

Sistem ini saat ini memiliki **7 skill aktif**:

| Skill | Trigger | Output |
|---|---|---|
| 📄 Membaca File | Ada file yang diunggah dan belum dibaca | Teks / data terstruktur |
| 📝 Membuat Dokumen Word | Permintaan laporan, memo, surat, atau template | File `.docx` |
| 📊 Membuat Spreadsheet | Spreadsheet sebagai output utama | File `.xlsx` |
| 📑 Membuat Presentasi | File `.pptx` terlibat sebagai input/output | File `.pptx` |
| 🖨️ Membuat PDF | Buat, isi, gabung, atau manipulasi PDF | File `.pdf` |
| 🔍 Membaca PDF | Baca atau ekstrak konten dari PDF | Teks / data |
| 🌐 Desain Frontend | Membangun antarmuka web atau komponen UI | HTML / CSS / React |

---

## 🗺️ Status Pengembangan

| Fase | Deskripsi | Target | Status |
|---|---|---|---|
| **Fase 1** | Fondasi — arsitektur & dokumen inti | Q2 2026 | ✅ Selesai |
| **Fase 2** | Pengembangan Skill — 5–10 skill inti | Q3 2026 | 🔄 Dalam Pengerjaan |
| **Fase 3** | Integrasi Eksternal — API kalender, email, dll. | Q4 2026 | 📋 Direncanakan |
| **Fase 4** | Monitoring & Observabilitas — dashboard real-time | Q1 2027 | 📋 Direncanakan |
| **Fase 5** | Multi-Agent System — ekosistem agen kolaboratif | Q2 2027 | 📋 Direncanakan |

---

## 🚀 Panduan Penggunaan

### Bagi Pengguna / Pengembang
1. Baca [`agent.md`](agent.md) untuk memahami cara agen menerima dan memproses instruksi
2. Lihat [`skill.md`](skill.md) untuk mengetahui kemampuan yang bisa digunakan
3. Rujuk [`roadmap.md`](roadmap.md) sebelum menambahkan fitur baru agar selaras dengan prioritas

### Bagi Agen AI
> Anda **wajib** membaca `agent.md` terlebih dahulu untuk memahami persona, batasan, dan aturan main sebelum melakukan tindakan apapun dalam repositori ini.

### Menambahkan Skill Baru
1. Buat file skill baru mengacu pada format di `skill.md`
2. Definisikan **nama, trigger, input, output, dan batasan** dengan jelas
3. Tambahkan entri ringkasan di katalog dalam `skill.md`
4. Uji dengan beberapa skenario nyata sebelum dirilis

---

## 📌 Prinsip Pengembangan

- **Modular** — Setiap skill adalah unit mandiri yang dapat ditambah tanpa mengubah inti agen
- **Terstruktur** — Semua output harus akurat, ringkas, dan dapat ditindaklanjuti
- **Iteratif** — Rilis lebih sering, pelajari lebih cepat
- **Transparan** — Setiap eksekusi dicatat untuk keperluan audit dan debugging

---

## 📋 Catatan Versi

| Versi | Tanggal | Keterangan |
|---|---|---|
| 1.0 | Mei 2026 | Inisiasi proyek, dokumen fondasi selesai |

---

*Dikelola secara kolaboratif bersama Agen AI. Versi: 1.0 | Terakhir diperbarui: Mei 2026*
