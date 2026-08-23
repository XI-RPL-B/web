// ======================
// JADWAL PIKET XI RPL-B
// ======================
// Regu disimpan sebagai NOMOR ABSEN, bukan username.
//
// Alasannya: username boleh diganti kapan saja, sedangkan
// nomor absen tetap. Versi sebelumnya memakai username, dan
// begitu ada username yang diubah, orangnya hilang dari daftar
// piket tanpa pesan error apa pun.
// ======================

const piketRegu = {

    senin:  [1, 4, 5, 6, 7, 8, 9, 10, 11],
    selasa: [2, 12, 13, 14, 15, 16, 17, 18, 19],
    rabu:   [3, 20, 21, 22, 23, 24, 25, 26, 27],
    kamis:  [31, 28, 29, 30, 32, 33, 34, 35, 36],

    // Jumat: seluruh kelas, diisi otomatis dari users.js
    jumat: null
};

const piketHari = ["senin", "selasa", "rabu", "kamis", "jumat"];

// Cari username berdasarkan nomor absen
function cariAbsen(nomor) {

    const kunci = Object.keys(users);

    for (let i = 0; i < kunci.length; i++) {
        if (users[kunci[i]].absen === nomor) return kunci[i];
    }

    return null;
}

// Ambil daftar username yang piket pada satu hari
function ambilPiket(hari) {

    if (hari === "jumat") {
        return Object.keys(users).sort(function (a, b) {
            return users[a].absen - users[b].absen;
        });
    }

    const nomor = piketRegu[hari] || [];
    const hasil = [];

    nomor.forEach(function (n) {

        const u = cariAbsen(n);

        if (u) {
            hasil.push(u);
        } else {
            // Kalau sampai muncul, berarti nomor absennya tidak
            // ada di users.js — bukan diam-diam hilang lagi.
            console.warn("Piket " + hari + ": absen " + n + " tidak ditemukan di users.js");
        }
    });

    return hasil;
}
