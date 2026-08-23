// =========================================================
// STORE — lapisan penyimpanan data bersama
// =========================================================
//
// Store.watch(key, callback)  -> dipanggil sekarang + setiap
//                                kali data berubah (dari siapa pun)
// Store.set(key, value)       -> simpan & sebarkan ke semua orang
//
// Kalau Firebase sudah dikonfigurasi  -> data nyambung antar perangkat
// Kalau belum                         -> otomatis pakai localStorage
//                                        (tetap jalan, tapi lokal saja)
// =========================================================

const Store = (function () {

    let mode = "lokal";          // "cloud" atau "lokal"
    let db = null;
    const localListeners = {};   // key -> [callback]

    // -----------------------------------------------------
    // Cek apakah config Firebase sudah diisi
    // -----------------------------------------------------
    function konfigurasiSiap() {

        if (typeof FIREBASE_CONFIG === "undefined") return false;
        if (typeof firebase === "undefined") return false;

        const url = FIREBASE_CONFIG.databaseURL || "";

        return url.indexOf("GANTI_DENGAN") === -1 && url.length > 10;
    }

    // -----------------------------------------------------
    // Inisialisasi
    // -----------------------------------------------------
    function init() {

        if (konfigurasiSiap()) {

            try {

                if (!firebase.apps.length) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }

                db = firebase.database();
                mode = "cloud";

            } catch (err) {

                console.warn("Firebase gagal dimuat, pakai mode lokal:", err);
                mode = "lokal";
            }
        }

        // Perubahan dari tab lain di perangkat yang sama
        window.addEventListener("storage", function (e) {

            if (mode === "lokal" && e.key && localListeners[e.key]) {

                localListeners[e.key].forEach(function (cb) {
                    cb(bacaLokal(e.key));
                });
            }
        });

        tampilkanStatus();
    }

    // -----------------------------------------------------
    // Helper localStorage
    // -----------------------------------------------------
    function bacaLokal(key) {

        try {
            const isi = localStorage.getItem(key);
            return isi ? JSON.parse(isi) : null;
        } catch (err) {
            return null;
        }
    }

    function tulisLokal(key, value) {

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn("Gagal menyimpan lokal:", err);
        }
    }

    // -----------------------------------------------------
    // Pantau data (realtime)
    // -----------------------------------------------------
    function watch(key, callback) {

        if (mode === "cloud") {

            db.ref(DB_ROOT + "/" + key).on("value", function (snap) {

                const nilai = snap.val();

                // simpan salinan offline supaya tetap tampil saat sinyal jelek
                if (nilai !== null) tulisLokal(key, nilai);

                callback(nilai);
            });

        } else {

            if (!localListeners[key]) localListeners[key] = [];
            localListeners[key].push(callback);

            callback(bacaLokal(key));
        }
    }

    // -----------------------------------------------------
    // Baca sekali saja (untuk data yang tidak berubah,
    // misalnya berkas foto galeri)
    // -----------------------------------------------------
    function once(key, callback) {

        if (mode === "cloud") {

            db.ref(DB_ROOT + "/" + key).once("value")
                .then(function (snap) { callback(snap.val()); })
                .catch(function () { callback(bacaLokal(key)); });

        } else {

            callback(bacaLokal(key));
        }
    }

    // -----------------------------------------------------
    // Simpan data
    // -----------------------------------------------------
    function set(key, value) {

        if (value === null) {
            try { localStorage.removeItem(key); } catch (e) {}
        } else {
            tulisLokal(key, value);
        }

        if (mode === "cloud") {

            db.ref(DB_ROOT + "/" + key).set(value)
                .catch(function (err) {
                    console.warn("Gagal menyimpan ke server:", err);
                    alert(
                        "Data tersimpan di perangkat ini, tapi gagal dikirim ke server.\n" +
                        "Cek koneksi internet atau aturan (Rules) database."
                    );
                });

        } else {

            // beritahu listener di tab yang sama
            (localListeners[key] || []).forEach(function (cb) {
                cb(value);
            });
        }
    }

    // -----------------------------------------------------
    // Badge status kecil di pojok layar
    // -----------------------------------------------------
    function tampilkanStatus() {

        function pasang() {

            const badge = document.createElement("div");

            badge.className =
                "sync-badge" + (mode === "cloud" ? " is-online" : "");

            badge.textContent =
                mode === "cloud" ? "Tersinkron" : "Mode lokal";

            badge.title =
                mode === "cloud"
                    ? "Perubahan admin langsung terlihat oleh semua orang."
                    : "Firebase belum dikonfigurasi. Data hanya tersimpan di perangkat ini.";

            // Menumpang di bilah alat milik theme.js kalau tersedia
            const wadah =
                (typeof Tema !== "undefined" && Tema.bilahAlat)
                    ? Tema.bilahAlat()
                    : document.body;

            wadah.insertBefore(badge, wadah.firstChild);
        }

        if (document.readyState === "loading") {
            window.addEventListener("DOMContentLoaded", pasang);
        } else {
            pasang();
        }
    }

    init();

    return {
        watch: watch,
        once: once,
        set: set,
        get mode() { return mode; }
    };

})();
