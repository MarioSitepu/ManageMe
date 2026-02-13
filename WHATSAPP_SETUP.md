# WhatsApp Setup Guide - TrackMe App

## 📱 Quick Start Guide

### Step 1: Get FONNTE API Key
1. Buka [fonnte.com](https://fonnte.com)
2. Daftar akun baru atau login
3. Beli paket sesuai kebutuhan (mulai dari Rp 5.000)
4. Copy API key Anda dari dashboard

### Step 2: Configure API Key
1. Buka file `.env.local` di root project
2. Ganti `your_fonnte_api_key_here` dengan API key Anda:
   ```
   FONNTE_API_KEY=kF8hG9jK2lM3nP4qR5sT
   ```
3. Save file
4. Restart dev server (tutup terminal dan jalankan `npm run dev` lagi)

### Step 3: Setup Nomor WhatsApp
1. Buka aplikasi → Profile page
2. Scroll ke "📱 WhatsApp Notifications"
3. Masukkan nomor HP format 628xxxxx (contoh: 628123456789)
4. Klik "Test Message" untuk coba kirim pesan
5. Cek HP, harusnya dapat pesan test
6. Enable notifikasi yang diinginkan
7. Klik "Save Settings"

## ✅ Notification Types

### ⏰ Class Reminders
- Otomatis terkirim saat [Waktu Kelas] - [Prep Time]
- Contoh: Jika kelas jam 08:00 dengan prep 30 menit, reminder jam 07:30
- Format pesan berisi nama kelas, jam mulai, dan prep time

### 🎯 Streak Alerts
- Terkirim setiap pagi jam 09:00
- Mengingatkan untuk tetap check-in agar streak tidak putus
- Hanya terkirim jika sudah ada streak

### 💰 Budget Warnings
- Otomatis terkirim saat pengeluaran mencapai 80% budget harian
- Mengingatkan untuk kontrol pengeluaran

### 📊 Daily Summary (Optional)
- Ringkasan akhir hari (poin, pengeluaran, attendance)
- Bisa di-enable/disable sesuai kebutuhan

## 🔧 Troubleshooting

### Pesan tidak terkirim?
1. ✅ Pastikan FONNTE_API_KEY sudah benar di `.env.local`
2. ✅ Restart dev server setelah menambah API key
3. ✅ Cek nomor HP format: 628xxxxx (tanpa +, tanpa spasi)
4. ✅ Pastikan saldo FONNTE masih cukup
5. ✅ Cek console browser (F12) untuk error messages

### Test Message gagal?
- Lihat pesan error di bawah tombol
- Jika "WhatsApp service not configured" → API key belum diset
- Jika "Failed to send" → Periksa format nomor HP

## 💡 Tips
- Simpan nomor dengan format yang benar
- Test message dulu sebelum enable semua notifikasi
- Matikan notifikasi yang tidak perlu untuk hemat kuota FONNTE
- Class reminders otomatis jalan di background saat app dibuka

## 📞 Support
Jika ada kendala:
1. Cek dokumentasi FONNTE: [docs.fonnte.com](https://docs.fonnte.com)
2. Cek console error di browser (tekan F12)
3. Pastikan semua file sudah di-save dengan benar
