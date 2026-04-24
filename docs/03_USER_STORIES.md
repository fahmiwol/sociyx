# SocioStudio — User Stories & Acceptance Criteria

**Version:** 1.0.0  
**Format:** As a [role], I want [feature], so that [benefit]  
**Status legend:** 🔴 Belum Dimulai | 🟡 In Progress | 🟢 Done

---

## Table of Contents

1. [Epic 1 — Auth & Organization](#epic-1--auth--organization)
2. [Epic 2 — Client Onboarding & Management](#epic-2--client-onboarding--management)
3. [Epic 3 — Social Account Connection](#epic-3--social-account-connection)
4. [Epic 4 — Content Research](#epic-4--content-research)
5. [Epic 5 — Caption & Hashtag Generation](#epic-5--caption--hashtag-generation)
6. [Epic 6 — Media Management](#epic-6--media-management)
7. [Epic 7 — Image Editor](#epic-7--image-editor)
8. [Epic 8 — Image-to-Video](#epic-8--image-to-video)
9. [Epic 9 — Post Management](#epic-9--post-management)
10. [Epic 10 — Scheduling & Publishing](#epic-10--scheduling--publishing)
11. [Epic 11 — Analytics](#epic-11--analytics)
12. [Epic 12 — Team Management](#epic-12--team-management)
13. [Epic 13 — Billing & Plan](#epic-13--billing--plan)

---

## Epic 1 — Auth & Organization

### US-001 — Register Organisasi Baru 🔴

**Story:**  
Sebagai pemilik agensi baru, saya ingin mendaftar dan membuat organisasi sehingga tim saya bisa mulai menggunakan platform.

**Acceptance Criteria:**
- [ ] Form register: nama lengkap, email, password (min 8 karakter, 1 huruf besar, 1 angka), nama organisasi
- [ ] Email verifikasi dikirim setelah register
- [ ] Setelah verifikasi, user otomatis login dan diarahkan ke onboarding
- [ ] Organisasi dibuat dengan plan Starter secara default
- [ ] Slug organisasi di-generate otomatis dari nama (bisa diedit)
- [ ] Jika email sudah terdaftar, tampilkan pesan error yang jelas

**Story Points:** 3  
**Priority:** P0

---

### US-002 — Login & Logout 🔴

**Story:**  
Sebagai user terdaftar, saya ingin login dengan email/password sehingga bisa mengakses workspace saya.

**Acceptance Criteria:**
- [ ] Form login: email + password
- [ ] Tombol "Lupa Password" mengirim email reset
- [ ] JWT access token (15 menit) + refresh token (30 hari) di-set setelah login
- [ ] Refresh token otomatis diperbarui sebelum expired tanpa user perlu login ulang
- [ ] Tombol logout membersihkan semua token dari client dan server
- [ ] Sesi tidak valid jika user di-kick dari org

**Story Points:** 2  
**Priority:** P0

---

### US-003 — Magic Link Login 🔴

**Story:**  
Sebagai user yang malas ingat password, saya ingin login via magic link email sehingga lebih mudah.

**Acceptance Criteria:**
- [ ] Input email → kirim magic link
- [ ] Link expired dalam 10 menit
- [ ] Klik link → otomatis login dan redirect ke dashboard
- [ ] Link hanya bisa dipakai sekali

**Story Points:** 2  
**Priority:** P1

---

## Epic 2 — Client Onboarding & Management

### US-010 — Membuat Client Baru via Wizard 🔴

**Story:**  
Sebagai admin agensi, saya ingin setup client baru melalui wizard step-by-step sehingga semua informasi brand ter-capture lengkap dan konsisten.

**Acceptance Criteria:**
- [ ] Wizard terdiri dari 7 langkah: Profil Brand, Brand Guidelines, Sosial Media, Objektif, Strategi, Credentials, Review
- [ ] Navigasi maju-mundur antar step tanpa kehilangan data yang sudah diisi
- [ ] Data setiap step di-autosave ke draft (localStorage atau backend) setiap 30 detik
- [ ] Indikator progress menunjukkan step mana yang sudah completed
- [ ] Validasi required fields (nama, industri) sebelum bisa submit
- [ ] Setelah simpan, client langsung tersedia di Content Studio selector
- [ ] Bisa keluar dari wizard dan lanjutkan nanti (resume draft)

**Story Points:** 8  
**Priority:** P0

---

### US-011 — Input Brand Guidelines 🔴

**Story:**  
Sebagai content creator, saya ingin menyimpan brand guidelines client (tone, warna, font, blacklist) sehingga AI bisa generate konten sesuai brand secara otomatis tanpa saya briefing ulang.

**Acceptance Criteria:**
- [ ] Color picker dengan input hex yang tersinkron dua arah
- [ ] Tone voice bisa dipilih dari preset ATAU ditulis bebas
- [ ] Blacklist kata: input tag-based (Enter atau koma untuk tambah, klik × untuk hapus)
- [ ] Brand assets (Canva, Drive, Figma): input URL dengan validasi format https://
- [ ] Simpan → guidelines langsung ter-load di sesi Content Studio berikutnya
- [ ] Bisa preview ringkasan brand guidelines sebelum simpan

**Story Points:** 5  
**Priority:** P0

---

### US-012 — Edit & Update Client Data 🔴

**Story:**  
Sebagai admin, saya ingin edit informasi client kapan saja sehingga data selalu up-to-date.

**Acceptance Criteria:**
- [ ] Semua data yang diisi saat wizard bisa diedit melalui halaman Setup Client
- [ ] Perubahan tersimpan dengan tombol "Simpan Perubahan" (bukan auto-save)
- [ ] Konfirmasi dialog sebelum meninggalkan halaman jika ada unsaved changes
- [ ] History perubahan tersimpan di audit_logs

**Story Points:** 3  
**Priority:** P0

---

### US-013 — Archive & Restore Client 🔴

**Story:**  
Sebagai admin, saya ingin mengarsipkan client yang sudah tidak aktif sehingga tidak muncul di workspace aktif tapi datanya tidak hilang.

**Acceptance Criteria:**
- [ ] Tombol "Arsipkan" di settings client → konfirmasi dialog
- [ ] Client ter-arsipkan tidak muncul di dropdown Content Studio
- [ ] Ada filter "Tampilkan Archived" di halaman Semua Client
- [ ] Bisa restore client yang diarsipkan
- [ ] Soft delete: data tidak terhapus dari database

**Story Points:** 2  
**Priority:** P1

---

### US-014 — Search & Filter Client 🔴

**Story:**  
Sebagai user dengan banyak client, saya ingin bisa search dan filter client dengan cepat sehingga tidak perlu scroll panjang.

**Acceptance Criteria:**
- [ ] Search bar di halaman Semua Client: realtime filter by nama, industri
- [ ] Filter by: industri, platform aktif, status (active/archived)
- [ ] Sort by: nama (A-Z), tanggal dibuat, tanggal update terakhir
- [ ] Hasil search tersimpan di URL query params (shareable/bookmarkable)

**Story Points:** 3  
**Priority:** P1

---

## Epic 3 — Social Account Connection

### US-020 — Connect Instagram via OAuth 🔴

**Story:**  
Sebagai user, saya ingin menghubungkan akun Instagram client via OAuth sehingga bisa publish langsung tanpa menyimpan password.

**Acceptance Criteria:**
- [ ] Klik "Hubungkan Instagram" → popup OAuth resmi Instagram (Meta) terbuka
- [ ] User authorize → popup tertutup → status berubah menjadi "Terhubung"
- [ ] Access token dan refresh token tersimpan terenkripsi di database (tidak pernah exposed ke frontend)
- [ ] Profile info (handle, nama, followers) di-fetch dan ditampilkan
- [ ] Token refresh otomatis 48 jam sebelum expired via background job
- [ ] Alert muncul jika token mendekati expired (< 7 hari) atau sudah expired

**Story Points:** 5  
**Priority:** P0

---

### US-021 — Connect TikTok, Facebook, Twitter, Threads, YouTube 🔴

**Story:**  
Sebagai user, saya ingin menghubungkan semua platform sosial media client sehingga bisa publish ke semua dari satu tempat.

**Acceptance Criteria:**
- [ ] OAuth flow tersedia untuk: TikTok, Facebook Page, Twitter/X, Threads, YouTube
- [ ] Setiap platform menampilkan scope permission yang diminta sebelum authorize
- [ ] Facebook: user bisa pilih Page mana yang dihubungkan (jika multiple pages)
- [ ] Status koneksi per platform ditampilkan dengan warna: hijau (connected), kuning (expiring), merah (error)
- [ ] Bisa disconnect dan reconnect kapan saja

**Story Points:** 8  
**Priority:** P1

---

### US-022 — Notifikasi Token Expired 🔴

**Story:**  
Sebagai user, saya ingin mendapat notifikasi saat token platform akan expired sehingga bisa reconnect sebelum scheduled post gagal.

**Acceptance Criteria:**
- [ ] Email notifikasi 7 hari sebelum token expired
- [ ] In-app notifikasi 3 hari sebelum expired
- [ ] Banner warning di Client Overview saat ada platform dengan token < 48 jam
- [ ] Link langsung ke halaman reconnect dari notifikasi
- [ ] Setelah reconnect, notifikasi dismissed otomatis

**Story Points:** 3  
**Priority:** P1

---

## Epic 4 — Content Research

### US-030 — Riset Topik Konten dengan AI 🔴

**Story:**  
Sebagai content creator, saya ingin dapat ide konten dan analisis tren untuk topik tertentu sehingga bisa membuat konten yang relevan dan menarik.

**Acceptance Criteria:**
- [ ] Input field untuk topik/keyword (max 200 karakter)
- [ ] Tombol "Riset" memanggil AI dengan brand context client yang dipilih
- [ ] Response streaming (terlihat mengetik secara real-time, bukan loading lalu muncul semua)
- [ ] Output mencakup: analisis tren, 5 ide konten, 2 hook/pembuka, hashtag tematik, angle diferensiasi
- [ ] Bisa klik ide konten untuk langsung masuk ke Caption Generator
- [ ] History riset tersimpan (bisa scroll ke research sebelumnya)
- [ ] Jika tidak ada client dipilih, AI tetap bisa melakukan riset tanpa brand context

**Story Points:** 5  
**Priority:** P0

---

### US-031 — Trending Topics Widget 🔴

**Story:**  
Sebagai content creator, saya ingin melihat topik yang sedang tren sehingga bisa membuat konten yang timely.

**Acceptance Criteria:**
- [ ] Widget "Tren Saat Ini" di halaman Research menampilkan 6 kartu topik populer
- [ ] Data tren diambil berdasarkan industri client yang dipilih
- [ ] Klik kartu tren → topik otomatis ter-isi ke search bar dan langsung riset
- [ ] Data tren di-refresh setiap 6 jam via background job
- [ ] Sumber data: Google Trends API atau internal popularity scoring

**Story Points:** 5  
**Priority:** P2

---

## Epic 5 — Caption & Hashtag Generation

### US-040 — Generate Caption sesuai Brand Voice 🔴

**Story:**  
Sebagai content creator, saya ingin generate caption yang secara otomatis sesuai dengan brand voice client sehingga tidak perlu briefing ulang setiap generate.

**Acceptance Criteria:**
- [ ] Saat client dipilih, brand guidelines ter-inject ke context AI secara otomatis
- [ ] Input: topik/deskripsi post, tone (bisa override dari brand default), platform, bahasa
- [ ] Caption di-generate dengan streaming SSE (real-time)
- [ ] Caption body dan hashtag ditampilkan terpisah
- [ ] Caption otomatis mematuhi karakter limit platform yang dipilih
- [ ] Kata dalam blacklist brand tidak pernah muncul di output
- [ ] Character counter live yang menunjukkan sisa karakter

**Story Points:** 5  
**Priority:** P0

---

### US-041 — Regenerate Caption 🔴

**Story:**  
Sebagai content creator, saya ingin bisa generate ulang caption dengan variasi yang berbeda sehingga punya pilihan lebih sebelum dipublish.

**Acceptance Criteria:**
- [ ] Tombol "Regenerate" menghasilkan variasi berbeda tanpa input ulang
- [ ] Riwayat 3 versi terakhir tersimpan dalam sesi (bisa klik untuk switch)
- [ ] Bisa edit manual caption setelah generate
- [ ] Perubahan manual tidak hilang saat klik regenerate (confirm dialog)

**Story Points:** 3  
**Priority:** P0

---

### US-042 — Generate Hashtag Saja 🔴

**Story:**  
Sebagai content creator, saya ingin generate hashtag untuk caption yang sudah saya tulis manual sehingga tidak harus generate caption dari awal.

**Acceptance Criteria:**
- [ ] Tab khusus "Hashtag" di Content Studio tanpa perlu isi caption
- [ ] Input: topik, platform, jumlah hashtag (5/10/15/20/30)
- [ ] Output: mix hashtag populer (volume tinggi) dan niche (spesifik)
- [ ] Bisa klik hashtag untuk uncheck/exclude dari output
- [ ] Copy semua hashtag dengan satu klik

**Story Points:** 2  
**Priority:** P0

---

### US-043 — Simpan Caption sebagai Template 🔴

**Story:**  
Sebagai content creator, saya ingin menyimpan caption yang bagus sebagai template sehingga bisa digunakan kembali atau dijadikan referensi.

**Acceptance Criteria:**
- [ ] Tombol "Simpan sebagai Template" setelah generate
- [ ] Beri nama dan tag template
- [ ] Template bisa di-scope ke: client tertentu atau seluruh org
- [ ] Library template bisa diakses dari Content Studio
- [ ] Template bisa diedit dan dihapus
- [ ] Bisa load template dan edit sebelum publish

**Story Points:** 3  
**Priority:** P2

---

## Epic 6 — Media Management

### US-050 — Upload Gambar & Video 🔴

**Story:**  
Sebagai content creator, saya ingin upload gambar atau video dari device saya sehingga bisa digunakan dalam post.

**Acceptance Criteria:**
- [ ] Drag & drop area atau klik untuk browse file
- [ ] Format yang didukung: JPEG, PNG, WEBP, GIF (gambar); MP4, MOV, WebM (video)
- [ ] Batas ukuran: 20MB untuk gambar, 500MB untuk video
- [ ] Progress upload ditampilkan (loading bar + persentase)
- [ ] Setelah upload, thumbnail ditampilkan di media library
- [ ] Server-side validation: MIME type diperiksa di backend, bukan hanya extension
- [ ] File otomatis dikonversi ke WebP (untuk gambar) untuk efisiensi storage

**Story Points:** 3  
**Priority:** P0

---

### US-051 — Media Library per Client 🔴

**Story:**  
Sebagai content creator, saya ingin melihat semua media yang sudah diupload untuk client tertentu sehingga bisa reuse asset tanpa upload ulang.

**Acceptance Criteria:**
- [ ] Library menampilkan grid thumbnail (sortable: terbaru, terlama, ukuran)
- [ ] Filter by: type (image/video), source (upload/AI generated/editor export)
- [ ] Klik media → preview + info (ukuran, dimensi, tanggal upload, sumber)
- [ ] Bisa pilih media dari library untuk digunakan di post baru
- [ ] Hapus media: konfirmasi dialog, cek apakah media dipakai di post lain
- [ ] Storage usage ditampilkan (used / quota)

**Story Points:** 3  
**Priority:** P1

---

## Epic 7 — Image Editor

### US-060 — Tambah Teks / Headline ke Gambar 🔴

**Story:**  
Sebagai content creator, saya ingin menambahkan teks headline ke gambar sehingga tidak perlu pindah ke Canva untuk hal sederhana.

**Acceptance Criteria:**
- [ ] Input teks → tombol "Tambah" menaruh layer teks di atas gambar
- [ ] Drag & drop untuk posisikan teks
- [ ] Edit per layer: font (5 pilihan), ukuran (slider 10–72px), warna (6 swatches + custom hex), bold/italic
- [ ] Text shadow toggle (untuk readability di atas foto)
- [ ] Multiple text layers bisa ditambahkan
- [ ] Klik layer untuk select → edit atau hapus
- [ ] Undo/redo (20 langkah)

**Story Points:** 5  
**Priority:** P1

---

### US-061 — Apply Filter & Efek 🔴

**Story:**  
Sebagai content creator, saya ingin bisa mengubah tampilan gambar dengan filter sehingga gambar lebih menarik tanpa aplikasi external.

**Acceptance Criteria:**
- [ ] Filter tersedia: Brightness, Contrast, Saturation, Grayscale, Sepia, Vignette
- [ ] Setiap filter punya slider untuk intensitas
- [ ] Preview real-time saat menggeser slider
- [ ] Tombol "Reset" untuk mengembalikan semua filter ke default
- [ ] Bisa kombinasi multiple filter

**Story Points:** 3  
**Priority:** P1

---

### US-062 — Export Gambar dari Editor 🔴

**Story:**  
Sebagai content creator, saya ingin export hasil edit sebagai file gambar sehingga bisa disimpan atau langsung digunakan di post.

**Acceptance Criteria:**
- [ ] Export ke PNG (lossless) atau JPEG (quality slider 60–100%)
- [ ] Export ke ukuran platform preset: 1:1, 9:16, 16:9, 4:5
- [ ] File langsung tersimpan ke Media Library client
- [ ] Opsional: download ke device
- [ ] Opsional: langsung set sebagai media aktif di post yang sedang dibuat

**Story Points:** 2  
**Priority:** P1

---

## Epic 8 — Image-to-Video

### US-070 — Convert Gambar ke Video Pendek 🔴

**Story:**  
Sebagai content creator, saya ingin mengkonversi gambar diam menjadi video pendek dengan efek motion sehingga konten lebih engaging di TikTok dan Reels.

**Acceptance Criteria:**
- [ ] Upload atau pilih gambar dari media library
- [ ] Pilih efek motion: Zoom In, Zoom Out, Ken Burns, Pan, Fade, Parallax
- [ ] Pilih durasi: 3, 5, 7, 10, 15 detik
- [ ] Pilih resolusi: sesuai platform preset
- [ ] Klik "Generate Video" → job di-queue di BullMQ
- [ ] Loading state dengan progress estimasi ditampilkan
- [ ] Setelah selesai, in-app notifikasi + preview video
- [ ] Video tersimpan otomatis ke Media Library

**Story Points:** 8  
**Priority:** P2

---

### US-071 — Polling Status Video Generation 🔴

**Story:**  
Sebagai user, saya ingin tahu kapan video selesai di-generate sehingga tidak perlu terus refresh halaman.

**Acceptance Criteria:**
- [ ] Halaman Image-to-Video menampilkan status job: Queue / Processing / Done / Failed
- [ ] Progress bar dengan estimasi waktu (jika API provider menyediakan)
- [ ] Notifikasi in-app dan email saat video selesai atau gagal
- [ ] Bisa lihat semua video generation jobs (history 30 hari terakhir)
- [ ] Jika gagal, ada pesan error yang dapat dimengerti + tombol Retry

**Story Points:** 3  
**Priority:** P2

---

## Epic 9 — Post Management

### US-080 — Buat Post Baru (Draft) 🔴

**Story:**  
Sebagai content creator, saya ingin membuat post baru dan menyimpannya sebagai draft sehingga bisa dilanjutkan nanti atau dikirim untuk approval.

**Acceptance Criteria:**
- [ ] Form post: caption (dengan character counter per platform), hashtags, pilih media, tipe post (feed/story/reel)
- [ ] Preview post yang realistis sesuai tampilan platform yang dipilih
- [ ] Simpan Draft menyimpan tanpa validasi ketat
- [ ] Autosave setiap 60 detik (badge "Tersimpan otomatis" dengan timestamp)
- [ ] Post draft muncul di kalender dan list post dengan status "Draft"
- [ ] Bisa duplicate post yang sudah ada

**Story Points:** 5  
**Priority:** P0

---

### US-081 — Edit & Hapus Post 🔴

**Story:**  
Sebagai content creator, saya ingin bisa edit atau hapus post yang belum dipublish sehingga konten selalu sesuai.

**Acceptance Criteria:**
- [ ] Post berstatus Draft dan Scheduled bisa diedit
- [ ] Post berstatus Published TIDAK bisa diedit (hanya view)
- [ ] Hapus post: konfirmasi dialog, beri opsi "Batalkan Scheduling" atau "Hapus Permanen"
- [ ] Batalkan Scheduling mengubah status ke Draft (tidak menghapus konten)
- [ ] Perubahan pada Scheduled post otomatis mengupdate job di queue

**Story Points:** 3  
**Priority:** P0

---

## Epic 10 — Scheduling & Publishing

### US-090 — Jadwalkan Post 🔴

**Story:**  
Sebagai social media manager, saya ingin menjadwalkan post untuk diterbitkan di waktu tertentu sehingga konten live saat audience paling aktif tanpa harus standby manual.

**Acceptance Criteria:**
- [ ] Datetime picker dengan timezone selector (WIB/WITA/WIT)
- [ ] Minimum schedule: 5 menit dari sekarang
- [ ] Validasi: tidak bisa jadwalkan di masa lalu
- [ ] Platform selector: checkbox untuk pilih 1 atau lebih platform yang connected untuk client tersebut
- [ ] Preview karakter limit per platform sebelum jadwalkan
- [ ] Konfirmasi summary sebelum final: "Post akan diterbitkan ke Instagram & TikTok pada Senin 21 April 2026 pukul 07:00 WIB"
- [ ] Setelah jadwalkan, post muncul di kalender dengan warna per platform

**Story Points:** 5  
**Priority:** P1

---

### US-091 — Publish Sekarang ke Multiple Platform 🔴

**Story:**  
Sebagai social media manager, saya ingin publish konten ke beberapa platform sekaligus sehingga bisa menghemat waktu.

**Acceptance Criteria:**
- [ ] Pilih platform (checkbox) lalu klik "Publish Sekarang"
- [ ] Progress publish ditampilkan per platform secara real-time
- [ ] Jika 1 platform gagal, platform lain tetap diproses
- [ ] Summary hasil: "Berhasil: Instagram, Facebook | Gagal: TikTok (error: MEDIA_FORMAT_UNSUPPORTED)"
- [ ] Platform yang gagal bisa di-retry individual
- [ ] Post berstatus "Published" jika minimal 1 platform berhasil
- [ ] Link ke post live di setiap platform yang berhasil

**Story Points:** 5  
**Priority:** P1

---

### US-092 — Retry Post yang Gagal 🔴

**Story:**  
Sebagai user, saya ingin bisa retry posting yang gagal sehingga tidak perlu setup ulang dari awal.

**Acceptance Criteria:**
- [ ] Otomatis retry 3× dengan backoff: 1 menit, 5 menit, 15 menit
- [ ] Setelah 3× gagal → status "Failed", notifikasi ke user
- [ ] Manual retry tersedia dari halaman post detail
- [ ] Error message yang actionable: "Token expired — reconnect Instagram dulu"
- [ ] Retry tidak menggandakan post (idempotency check via external_id)

**Story Points:** 3  
**Priority:** P1

---

### US-093 — Kalender Jadwal Visual 🔴

**Story:**  
Sebagai social media manager, saya ingin melihat semua post terjadwal dalam tampilan kalender sehingga mudah melihat distribusi konten dan mendeteksi gap.

**Acceptance Criteria:**
- [ ] Tampilan kalender bulan (default) dengan navigasi prev/next
- [ ] Setiap post ditampilkan sebagai event berwarna sesuai platform
- [ ] Hover event → tooltip: judul post, platform, waktu, status
- [ ] Klik event → buka detail/edit post
- [ ] Filter by: client, platform, status
- [ ] View alternatif: mingguan (nice-to-have Phase 2)
- [ ] Hari ini di-highlight

**Story Points:** 5  
**Priority:** P1

---

## Epic 11 — Analytics

### US-100 — Dashboard Analytics Client 🔴

**Story:**  
Sebagai account manager, saya ingin melihat performa sosmed client dalam satu dashboard sehingga bisa laporan ke client tanpa pull data manual.

**Acceptance Criteria:**
- [ ] Stats utama: total reach, engagement rate, followers gained, link clicks (periode: 7/30/90 hari)
- [ ] Grafik pertumbuhan followers per platform (line chart)
- [ ] Top 5 post berdasarkan reach atau engagement rate
- [ ] Platform breakdown: kontribusi setiap platform ke total performa
- [ ] Data di-fetch dari platform API setiap 24 jam via background job
- [ ] Timestamp "terakhir diperbarui" ditampilkan
- [ ] Loading skeleton saat data sedang di-fetch

**Story Points:** 8  
**Priority:** P1

---

### US-101 — Agency Overview Dashboard 🔴

**Story:**  
Sebagai pimpinan agensi, saya ingin melihat overview performa semua client sekaligus sehingga bisa tahu client mana yang butuh perhatian.

**Acceptance Criteria:**
- [ ] Tabel semua client dengan: nama, platform aktif, posts bulan ini, reach, engagement rate, status akun
- [ ] Sortable dan filterable
- [ ] Badge peringatan: client dengan token expired, client yang belum posting 7+ hari, client yang performa engagement turun > 20%
- [ ] Klik client → langsung ke analytics client tersebut

**Story Points:** 5  
**Priority:** P2

---

## Epic 12 — Team Management

### US-110 — Undang Anggota Tim 🔴

**Story:**  
Sebagai owner/admin, saya ingin mengundang anggota tim ke organisasi sehingga bisa berkolaborasi dalam mengelola client.

**Acceptance Criteria:**
- [ ] Input email + pilih role (admin/editor/viewer)
- [ ] Email undangan dikirim dengan link yang expire dalam 48 jam
- [ ] Pending invitations ditampilkan dengan status dan opsi resend/cancel
- [ ] Setelah accept, user langsung masuk ke org dengan role yang ditetapkan
- [ ] Limit member sesuai plan billing

**Story Points:** 3  
**Priority:** P1

---

### US-111 — Kelola Role Anggota Tim 🔴

**Story:**  
Sebagai owner/admin, saya ingin mengubah role anggota tim sehingga bisa mengatur siapa yang bisa melakukan apa.

**Acceptance Criteria:**
- [ ] Tabel anggota: nama, email, role, joined date, last active
- [ ] Dropdown role per anggota (admin bisa ubah semua kecuali owner)
- [ ] Owner tidak bisa di-downgrade oleh siapapun kecuali dirinya sendiri (transfer ownership)
- [ ] Konfirmasi dialog saat mengubah role ke yang lebih rendah
- [ ] Remove member: data yang dibuat tetap ada tapi creator_id menunjuk ke deleted user

**Story Points:** 3  
**Priority:** P1

---

## Epic 13 — Billing & Plan

### US-120 — Subscribe ke Plan Berbayar 🔴

**Story:**  
Sebagai owner org, saya ingin upgrade ke plan Pro atau Agency sehingga bisa mengelola lebih banyak client dan fitur.

**Acceptance Criteria:**
- [ ] Halaman pricing menampilkan perbandingan plan dengan fitur dan harga (IDR)
- [ ] Pilih plan → redirect ke checkout (Stripe untuk kartu internasional, Midtrans untuk transfer bank/e-wallet IDR)
- [ ] Setelah bayar, plan langsung aktif dan limits diperbarui
- [ ] Invoice dikirim ke email
- [ ] Manage subscription: lihat tanggal perpanjangan, ganti plan, cancel

**Story Points:** 8  
**Priority:** P2

---

### US-121 — Usage Monitoring & Limit Warning 🔴

**Story:**  
Sebagai owner org, saya ingin tahu berapa penggunaan AI dan storage sehingga tidak kaget saat kena limit.

**Acceptance Criteria:**
- [ ] Dashboard usage di Settings: AI generates used/limit, storage used/quota, posts published/limit bulan ini
- [ ] Warning banner saat usage mencapai 80% dari limit
- [ ] Email notifikasi saat mencapai 90% dan 100%
- [ ] Saat mencapai limit, fitur yang terkait di-disable dengan pesan jelas + link upgrade
- [ ] Admin bisa lihat breakdown usage per user

**Story Points:** 3  
**Priority:** P2

---

## Story Point Summary

| Epic | Total SP | Phase |
|---|---|---|
| Auth & Organization | 7 | Phase 1 |
| Client Onboarding | 21 | Phase 1 |
| Social Account Connection | 13 | Phase 1–2 |
| Content Research | 10 | Phase 1 |
| Caption & Hashtag | 13 | Phase 1 |
| Media Management | 6 | Phase 1 |
| Image Editor | 10 | Phase 2 |
| Image-to-Video | 11 | Phase 2–3 |
| Post Management | 8 | Phase 1 |
| Scheduling & Publishing | 18 | Phase 1–2 |
| Analytics | 13 | Phase 2 |
| Team Management | 6 | Phase 2 |
| Billing & Plan | 11 | Phase 3 |
| **Total** | **147 SP** | — |

**Velocity estimasi:** 25–30 SP per sprint (2 minggu), tim 3 engineer
