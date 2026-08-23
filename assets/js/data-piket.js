// ======================
// JADWAL PIKET XI RPL-B
// ======================
// Disimpan sebagai username (kunci di users.js), bukan nama
// mentah — supaya kalau ada ejaan nama yang berbeda, daftarnya
// tetap nyambung ke orang yang benar.
// ======================

const piketRegu = {

    senin: [
        "achmad",     // 1
        "andina",     // 4
        "anis",       // 5
        "aniva",      // 6
        "annisa",     // 7
        "bela",       // 8
        "diniyyatul", // 9
        "enania",     // 10
        "finda"       // 11
    ],

    selasa: [
        "adi",        // 2
        "gea",        // 12
        "gina",       // 13
        "jessica",    // 14
        "juwita",     // 15
        "kamelia",    // 16
        "larisa",     // 17
        "laura",      // 18
        "lusiana"     // 19
    ],

    rabu: [
        "ahmad",      // 3
        "natasya",    // 20
        "novi",       // 21
        "rachel",     // 22
        "rani",       // 23
        "reggina",    // 24
        "ria",        // 25
        "rika",       // 26
        "setia"       // 27
    ],

    kamis: [
        "thibyanul",  // 31
        "sinta",      // 28
        "dinda",      // 29
        "thalita",    // 30
        "titik",      // 32
        "wafaul",     // 33
        "wafi",       // 34
        "wafrotul",   // 35
        "wiqurrothul" // 36
    ],

    // Jumat: seluruh kelas. Diisi otomatis dari users.js
    // supaya tidak perlu diperbarui dua kali kalau ada
    // siswa yang masuk atau pindah.
    jumat: null
};

const piketHari = ["senin", "selasa", "rabu", "kamis", "jumat"];

// Ambil daftar username yang piket pada satu hari
function ambilPiket(hari) {

    if (hari === "jumat") {
        return Object.keys(users).sort(function (a, b) {
            return users[a].absen - users[b].absen;
        });
    }

    return piketRegu[hari] || [];
}
