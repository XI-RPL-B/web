// =========================================================
// PIKET XI RPL-B
// =========================================================
// Semua orang bisa melihat jadwalnya.
// Ketua, wakil ketua, dan sekretaris bisa mencentang siapa
// yang sudah piket. Centangnya otomatis bersih tiap hari baru.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    const bolehCentang = Auth.bolehEditAbsensi(user);   // aturan sama dengan absensi

    const el = function (id) { return document.getElementById(id); };

    const tabWrap  = el("tabHari");
    const daftar   = el("daftarPiket");
    const judul    = el("judulRegu");
    const jumlahEl = el("jumlahPetugas");
    const catatan  = el("catatanAkses");
    const kartuKini = el("kartuHariIni");
    const progresEl = el("progresPiket");
    const teksProgres = el("teksProgres");

    const namaHari = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    const labelHari = {
        senin: "Senin", selasa: "Selasa", rabu: "Rabu",
        kamis: "Kamis", jumat: "Jumat"
    };

    const hariIni = namaHari[new Date().getDay()];
    const tanggalIni = new Date().toLocaleDateString("sv-SE");

    // Kalau hari ini Sabtu/Minggu, buka tab Senin
    let hariDipilih = piketHari.indexOf(hariIni) !== -1 ? hariIni : "senin";

    let selesai = {};   // { username: true }

    catatan.textContent = bolehCentang
        ? "Centang petugas yang sudah menjalankan piket hari ini."
        : "Hanya ketua, wakil ketua, dan sekretaris yang bisa mencentang.";

    // -----------------------------------------------------
    // Kartu hari ini
    // -----------------------------------------------------
    if (piketHari.indexOf(hariIni) === -1) {

        kartuKini.querySelector(".lbl").textContent = "Akhir pekan";
        el("reguHariIni").textContent = "Tidak ada piket";
        el("anggotaHariIni").textContent = "Sampai jumpa Senin.";
        kartuKini.classList.add("santai");

    } else {

        kartuKini.querySelector(".lbl").textContent = "Piket hari ini";
        el("reguHariIni").textContent =
            hariIni === "jumat"
                ? "Jumat Bersih — seluruh kelas"
                : "Regu " + labelHari[hariIni];
    }

    // -----------------------------------------------------
    // Tab hari
    // -----------------------------------------------------
    tabWrap.innerHTML = piketHari.map(function (h) {

        return '<button data-hari="' + h + '">' +
                   labelHari[h] +
                   (h === hariIni ? " &bull;" : "") +
               "</button>";

    }).join("");

    tabWrap.querySelectorAll("button").forEach(function (b) {

        b.addEventListener("click", function () {
            hariDipilih = this.dataset.hari;
            render();
        });
    });

    // -----------------------------------------------------
    // Realtime centang
    // -----------------------------------------------------
    Store.watch("piket", function (nilai) {

        // Data dari hari kemarin diabaikan — mulai bersih lagi
        selesai = (nilai && nilai.tanggal === tanggalIni && nilai.selesai)
            ? nilai.selesai
            : {};

        render();
    });

    function simpan() {

        Store.set("piket", {
            tanggal: tanggalIni,
            selesai: selesai,
            diubahOleh: user.nama,
            waktu: new Date().toISOString()
        });
    }

    // -----------------------------------------------------
    // Gambar daftar
    // -----------------------------------------------------
    function render() {

        tabWrap.querySelectorAll("button").forEach(function (b) {
            b.classList.toggle("active", b.dataset.hari === hariDipilih);
        });

        const regu = ambilPiket(hariDipilih);
        const hariAktif = hariDipilih === hariIni;

        judul.textContent = hariDipilih === "jumat"
            ? "Jumat Bersih"
            : "Regu " + labelHari[hariDipilih];

        jumlahEl.textContent = regu.length;

        daftar.innerHTML = regu.map(function (u, i) {

            const s = users[u];
            if (!s) return "";

            const sudah = hariAktif && selesai[u] === true;

            return (
                '<div class="petugas' + (sudah ? " sudah" : "") + '">' +

                    '<span class="urut">' + (i + 1) + "</span>" +

                    "<div>" +
                        '<div class="nama">' + s.nama + "</div>" +
                        '<div class="ket">Absen ' + s.absen +
                        (s.jabatan ? " &middot; " + s.jabatan : "") + "</div>" +
                    "</div>" +

                    (hariAktif
                        ? '<button class="centang" data-u="' + u + '"' +
                          (bolehCentang ? "" : " disabled") + ">" +
                          (sudah ? "&#10003;" : "") + "</button>"
                        : "") +

                "</div>"
            );

        }).join("");

        // Kemajuan hanya berarti untuk hari yang sedang berjalan
        if (hariAktif) {

            const jumlahSudah = regu.filter(function (u) {
                return selesai[u] === true;
            }).length;

            progresEl.parentElement.style.display = "";
            progresEl.style.width =
                regu.length ? (jumlahSudah / regu.length) * 100 + "%" : "0%";
            teksProgres.textContent = jumlahSudah + "/" + regu.length;

        } else {

            progresEl.parentElement.style.display = "none";
            teksProgres.textContent = "";
        }

        el("anggotaHariIni").textContent =
            piketHari.indexOf(hariIni) === -1
                ? "Sampai jumpa Senin."
                : ambilPiket(hariIni).length + " petugas terjadwal";

        if (!bolehCentang || !hariAktif) return;

        daftar.querySelectorAll(".centang").forEach(function (b) {

            b.addEventListener("click", function () {

                const u = this.dataset.u;

                if (selesai[u]) {
                    delete selesai[u];
                } else {
                    selesai[u] = true;
                }

                simpan();
                render();
            });
        });
    }

    render();
});
