# AR Corp Channel — Aplikasi Android (untuk Play Store / instal manual)

Aplikasi Android ini adalah **Trusted Web Activity (TWA)** — pembungkus native
Android resmi dari Google untuk aplikasi web yang sudah ada. Semua fitur
(login Client/Channel, lihat data VCR/Fee, admin ledger) langsung terpakai
dari web app yang sudah live di Railway; tidak ada kode yang ditulis ulang.

Proyek build-nya (`twa-manifest.json` + workflow GitHub Actions) sudah
disiapkan di repo ini. Build sesungguhnya (kompilasi ke `.aab`/`.apk`) berjalan
otomatis di GitHub Actions setiap kali folder `android/` di-push — karena
proses build butuh Android SDK + koneksi internet penuh yang tidak tersedia
di lingkungan kerja saya.

Ini adalah aplikasi Android yang **terpisah sepenuhnya** dari aplikasi
Android AR Corp (HR) — package name, keystore penandatanganan, dan domain
yang dibungkus semuanya berbeda, sehingga tidak akan pernah saling bentrok
di HP yang sama (keduanya bisa terinstal bersamaan).

## 1. Tambahkan 2 secret di GitHub (sekali saja)

Buka repo `ar-client-portal-channel` di GitHub → **Settings → Secrets and
variables → Actions → New repository secret**, lalu tambahkan:

| Nama secret | Isi |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Isi file `client-portal-keystore-base64.txt` yang saya kirimkan terpisah (bukan lewat git, karena ini rahasia) |
| `ANDROID_KEYSTORE_PASSWORD` | Password dari file `client-portal-keystore-credentials.txt` yang saya kirimkan terpisah |

**PENTING:** simpan file `android.keystore` dan
`client-portal-keystore-credentials.txt` yang saya kirimkan ke Anda di
tempat yang sangat aman (misalnya Google Drive pribadi + salinan offline).
File ini adalah identitas penanda tangan aplikasi Channel Anda — kalau
hilang, Anda **tidak akan pernah bisa merilis update aplikasi ini lagi** di
Play Store (harus buat aplikasi baru dari nol dengan semua rating/review/
install count hilang). Keystore ini khusus untuk AR Corp Channel — jangan
dicampur dengan keystore aplikasi AR Corp (HR) yang lain.

## 2. Jalankan build

Build otomatis jalan setiap push ke folder `android/`. Untuk build manual:
GitHub repo → tab **Actions** → pilih workflow **Build Android App (TWA)** →
**Run workflow**.

## 3. Ambil hasilnya

Setelah build selesai (±5-10 menit), buka run tersebut di tab **Actions**,
scroll ke bagian **Artifacts**, unduh `client-portal-android-<nomor>.zip`.
Isinya:
- `app-release-bundle.aab` — **file yang diupload ke Play Console**
- `app-release-signed.apk` — untuk uji coba instal manual di HP Android

APK terbaru juga otomatis dipublikasikan ke `public/downloads/client-portal.apk`
di web app, jadi bisa langsung diunduh dari halaman login tanpa buka GitHub.

## 4. Buat akun Google Play Developer (dilakukan sendiri, opsional)

1. Buka https://play.google.com/console/signup
2. Login pakai akun Google (sebaiknya akun khusus bisnis, bukan pribadi)
3. Bayar biaya pendaftaran satu kali **USD 25**
4. Lengkapi identitas developer (perorangan atau organisasi/bisnis)

Kalau hanya untuk dipakai internal (Channel/Owner/Admin menginstal APK
langsung dari link unduhan di halaman login), langkah Play Store ini bisa
dilewati sepenuhnya — APK hasil build sudah bisa langsung diinstal manual.

## Update aplikasi di kemudian hari

Setiap kali web app berubah, aplikasi Android **tidak perlu di-build ulang**
kecuali Anda mengubah: nama aplikasi, ikon, warna, atau versi minimum
Android — karena TWA hanya membuka web app yang sama secara live. Kalau
salah satu dari itu berubah, naikkan `appVersionCode` dan `appVersion` di
`android/twa-manifest.json`, lalu push ulang.

## File `assetlinks.json`

`public/.well-known/assetlinks.json` di web app menghubungkan domain web
dengan aplikasi Android ini (supaya aplikasi tampil tanpa address bar
browser, benar-benar terasa seperti aplikasi native). Sudah otomatis
disiapkan dan cocok dengan sertifikat di `android.keystore` yang sama.

<!-- secrets configured, triggering build -->
