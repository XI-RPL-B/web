// =========================================================
// ABSENSI XI RPL-B
// =========================================================
//
// Versi lama file ini punya SyntaxError (ada "}" berlebih dan
// kode di luar window.onload). Akibatnya seluruh file gagal
// dijalankan browser -> halaman absensi kosong / tidak berfungsi.
// Versi ini sudah dirapikan dan datanya realtime.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = Auth.require();
    if (!currentUser) return;

    const bolehEdit = Auth.bolehEditAbsensi(currentUser);

    const container   = document.getElementById("daftarSiswa");
    const daftarSiswa = Object.values(users)
        .sort(function (a, b) { return a.absen - b.absen; });

    // Tanggal hari ini, format YYYY-MM-DD
    const hariIni = new Date().toLocaleDateString("sv-SE");

    let dataAbsen = {};   // { nama: "Hadir" | "Izin" | "Sakit" | "Alpha" }

    // -----------------------------------------------------
    // Info di atas daftar
    // -----------------------------------------------------
    const info = document.createElement("p");

    info.className = "catatan";

    info.textContent = bolehEdit
        ? "Kamu bisa mengubah absensi. Perubahan langsung terlihat semua orang."
        : "Hanya ketua / wakil ketua / sekretaris yang bisa mengubah absensi.";

    container.parentNode.insertBefore(info, container);

    // -----------------------------------------------------
    // Dengarkan perubahan data secara realtime
    // -----------------------------------------------------
    Store.watch("dataAbsen", function (nilai) {

        dataAbsen = normalkan(nilai);
        render();
        hitungRekap();
    });

    // Terima format lama (objek datar) maupun format baru
    // { tanggal: "...", status: {...} }
    function normalkan(nilai) {

        const kosong = {};

        daftarSiswa.forEach(function (s) {
            kosong[s.nama] = "Hadir";
        });

        if (!nilai) return kosong;

        // Format baru
        if (nilai.status) {

            // Kalau datanya dari hari sebelumnya, mulai bersih lagi
            if (nilai.tanggal !== hariIni) return kosong;

            const hasil = Object.assign({}, kosong);

            daftarSiswa.forEach(function (s) {
                if (nilai.status[s.nama]) hasil[s.nama] = nilai.status[s.nama];
            });

            return hasil;
        }

        // Format lama
        const hasil = Object.assign({}, kosong);

        daftarSiswa.forEach(function (s) {
            if (nilai[s.nama]) hasil[s.nama] = nilai[s.nama];
        });

        return hasil;
    }

    // -----------------------------------------------------
    // Gambar daftar siswa
    // -----------------------------------------------------
    function render() {

        // Jangan gambar ulang kalau admin sedang membuka dropdown,
        // supaya pilihannya tidak "loncat" sendiri.
        const aktif = document.activeElement;

        if (aktif && aktif.tagName === "SELECT" && container.contains(aktif)) {
            perbaruiNilaiSaja();
            return;
        }

        const pilihan = ["Hadir", "Izin", "Sakit", "Alpha"];
        let html = "";

        daftarSiswa.forEach(function (siswa) {

            const status = dataAbsen[siswa.nama] || "Hadir";

            const opsi = pilihan.map(function (p) {
                return '<option value="' + p + '"' +
                       (status === p ? " selected" : "") + ">" + p + "</option>";
            }).join("");

            html +=
                '<div class="siswa" data-status="' + status + '">' +
                    "<span>" + siswa.absen + ". " + siswa.nama + "</span>" +
                    '<select data-nama="' + siswa.nama + '"' +
                        (bolehEdit ? "" : " disabled") + ">" +
                        opsi +
                    "</select>" +
                "</div>";
        });

        container.innerHTML = html;

        // Pasang listener SETELAH elemen dibuat.
        // Inilah bug versi lama: listener dipasang sebelum daftar ada.
        if (bolehEdit) {

            container.querySelectorAll("select").forEach(function (select) {

                select.addEventListener("change", function () {

                    dataAbsen[this.dataset.nama] = this.value;
                    this.closest(".siswa").dataset.status = this.value;
                    simpan();
                    hitungRekap();
                });
            });
        }
    }

    function perbaruiNilaiSaja() {

        container.querySelectorAll("select").forEach(function (select) {

            const baru = dataAbsen[select.dataset.nama];

            if (baru && select.value !== baru) {
                select.value = baru;
                select.closest(".siswa").dataset.status = baru;
            }
        });
    }

    // -----------------------------------------------------
    // Simpan (otomatis tersebar ke semua perangkat)
    // -----------------------------------------------------
    function simpan() {

        Store.set("dataAbsen", {
            tanggal: hariIni,
            status: dataAbsen,
            diubahOleh: currentUser.nama,
            waktu: new Date().toISOString()
        });
    }

    // -----------------------------------------------------
    // Rekap jumlah
    // -----------------------------------------------------
    function hitungRekap() {

        const jumlah = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };

        Object.values(dataAbsen).forEach(function (status) {
            if (jumlah[status] !== undefined) jumlah[status]++;
        });

        document.getElementById("hadirCount").textContent = jumlah.Hadir;
        document.getElementById("izinCount").textContent  = jumlah.Izin;
        document.getElementById("sakitCount").textContent = jumlah.Sakit;
        document.getElementById("alphaCount").textContent = jumlah.Alpha;

        // Batang segmen: lebar tiap warna mengikuti jumlahnya.
        // Nilai minimum 0.35 supaya satu siswa tetap terlihat.
        setSeg("segHadir", jumlah.Hadir);
        setSeg("segIzin",  jumlah.Izin);
        setSeg("segSakit", jumlah.Sakit);
        setSeg("segAlpha", jumlah.Alpha);
    }

    function setSeg(id, nilai) {

        const el = document.getElementById(id);
        if (!el) return;

        el.style.flex = nilai > 0 ? Math.max(nilai, 0.35) : 0;
    }
});
