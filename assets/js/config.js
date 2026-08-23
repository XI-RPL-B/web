// =========================================================
// KONFIGURASI SINKRONISASI (Firebase Realtime Database)
// Project: XI RPL-B (xl-rpl-b)
// =========================================================
//
// File ini SUDAH TERISI. Kalau website-mu sekarang sudah
// menunjukkan badge hijau "Tersinkron", isinya sudah benar
// dan tidak perlu diapa-apakan lagi.
//
// Kalau setelah pembaruan badge berubah jadi kuning, berarti
// region database-mu bukan Singapore. Ganti baris databaseURL
// jadi:
//     databaseURL: "https://xl-rpl-b-default-rtdb.firebaseio.com",
// =========================================================

const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyDxAmuHtIwbuuecUvB9CWY5OjQ1ULLTmME",
    authDomain:        "xl-rpl-b.firebaseapp.com",
    databaseURL:       "https://xl-rpl-b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "xl-rpl-b",
    storageBucket:     "xl-rpl-b.firebasestorage.app",
    messagingSenderId: "1082908694751",
    appId:             "1:1082908694751:web:b6e0ebd9e205170f3b316a"
};

// Semua data kelas disimpan di bawah folder ini di database:
// dataAbsen, dataKas, pengumuman, galeri, piket
const DB_ROOT = "xirplb";
