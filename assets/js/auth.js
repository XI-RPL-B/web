// =========================================================
// AUTH — satu tempat untuk urusan login/logout
// =========================================================
//
// PENTING: sebelumnya login menyimpan kunci "userLogin"
// tapi tombol logout menghapus "currentUser", jadi logout
// tidak pernah benar-benar terjadi. Sekarang semua halaman
// memakai SATU kunci yang sama: SESSION_KEY.
// =========================================================

const SESSION_KEY = "userLogin";

// Role yang boleh mengedit data kelas
const ROLE_ADMIN = [
    "ketua",
    "wakil ketua",
    "sekretaris",
    "bendahara"
];

const Auth = {

    // Ambil user yang sedang login (null kalau belum login)
    user: function () {

        try {
            const isi = localStorage.getItem(SESSION_KEY);
            if (!isi) return null;

            const u = JSON.parse(isi);

            // sesi rusak / format lama
            if (!u || !u.nama || !u.role) return null;

            return u;

        } catch (err) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
    },

    // Dipanggil di awal setiap halaman yang butuh login.
    // Mengembalikan user, atau melempar ke login.html.
    require: function () {

        const u = Auth.user();

        if (!u) {
            window.location.replace("login.html");
            return null;
        }

        return u;
    },

    simpan: function (u) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    },

    // Apakah user ini pengurus/admin?
    isAdmin: function (u) {
        if (!u) return false;
        return ROLE_ADMIN.indexOf(String(u.role).toLowerCase()) !== -1;
    },

    // Boleh mengubah absensi
    bolehEditAbsensi: function (u) {
        if (!u) return false;
        const r = String(u.role).toLowerCase();
        return r === "ketua" || r === "wakil ketua" || r === "sekretaris";
    },

    // Boleh mengubah kas
    bolehEditKas: function (u) {
        if (!u) return false;
        const r = String(u.role).toLowerCase();
        return r === "ketua" || r === "bendahara";
    },

    // Boleh menulis pengumuman — sekretaris saja
    bolehEditPengumuman: function (u) {
        if (!u) return false;
        return String(u.role).toLowerCase() === "sekretaris";
    },

    // Boleh mengelola galeri — semua pengurus KECUALI bendahara
    bolehKelolaGaleri: function (u) {
        if (!u) return false;
        const r = String(u.role).toLowerCase();
        return r !== "bendahara" && ROLE_ADMIN.indexOf(r) !== -1;
    },

    logout: function () {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem("currentUser"); // sisa versi lama
        window.location.replace("login.html");
    }
};
