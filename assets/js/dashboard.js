// =========================================================
// BERANDA XI RPL-B
// =========================================================
// Yang paling sering dibutuhkan ditaruh paling atas dan
// dibuat besar: pelajaran yang sedang berjalan, lalu absensi.
// Sisanya mengecil.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    const el = function (id) { return document.getElementById(id); };

    // -----------------------------------------------------
    // Sapaan
    // -----------------------------------------------------
    el("namaSiswa").textContent = String(user.nama).split(" ")[0];

    // Jabatan lengkap (mis. "Sekretaris 2") diambil dari data siswa;
    // sesi login hanya menyimpan role untuk hak akses.
    const dataDiri = users[user.username] || {};

    const roleEl = el("roleSiswa");
    roleEl.textContent = String(dataDiri.jabatan || user.role).toUpperCase();
    roleEl.className = "role " + String(user.role).toLowerCase().replace(/\s+/g, "-");

    const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const kini = new Date();
    const tanggalKini = kini.toLocaleDateString("sv-SE");

    el("tanggalHariIni").textContent =
        namaHari[kini.getDay()] + " · " + kini.getDate() + " " + namaBulan[kini.getMonth()];

    // -----------------------------------------------------
    // Jumlah anggota
    // -----------------------------------------------------
    const semuaSiswa = Object.values(users);

    el("jumlahSiswa").textContent = semuaSiswa.length;

    el("jumlahPengurus").textContent = semuaSiswa.filter(function (s) {
        return s.role !== "siswa";
    }).length;

    // -----------------------------------------------------
    // Pelajaran sekarang & sisa jadwal
    // -----------------------------------------------------
    function menit(jam) {
        const p = String(jam).split(":");
        return Number(p[0]) * 60 + Number(p[1]);
    }

    function perbaruiJadwal() {

        const sekarang = new Date();
        const hariKunci = namaHari[sekarang.getDay()].toLowerCase();
        const daftar = (typeof jadwal !== "undefined" && jadwal[hariKunci]) || [];

        const menitKini = sekarang.getHours() * 60 + sekarang.getMinutes();

        let berjalan = null;
        let indeks = -1;

        for (let i = 0; i < daftar.length; i++) {

            const m = menit(daftar[i].mulai);
            const s = menit(daftar[i].selesai);

            if (menitKini >= m && menitKini < s) {
                berjalan = daftar[i];
                indeks = i;
                break;
            }
        }

        const kartu = el("kartuSekarang");

        if (berjalan) {

            const mulai = menit(berjalan.mulai);
            const selesai = menit(berjalan.selesai);
            const persen = ((menitKini - mulai) / (selesai - mulai)) * 100;

            el("labelSekarang").innerHTML = "&#9673; Sedang berlangsung";
            el("mapelSekarang").textContent = berjalan.mapel;
            el("guruSekarang").textContent =
                berjalan.guru + (berjalan.ruang ? " · " + berjalan.ruang : "");

            el("progresPelajaran").style.width = Math.min(persen, 100) + "%";
            el("sisaMenit").textContent = (selesai - menitKini) + " mnt";
            kartu.classList.remove("santai");

        } else {

            // Belum mulai, sudah pulang, atau libur
            const berikut = daftar.find(function (x) {
                return menit(x.mulai) > menitKini;
            });

            el("labelSekarang").textContent = "Tidak ada pelajaran";

            el("mapelSekarang").textContent = berikut
                ? "Nanti " + berikut.jam.split(" - ")[0] + " · " + berikut.mapel
                : (daftar.length ? "Pelajaran hari ini sudah selesai" : "Hari ini libur");

            el("guruSekarang").textContent = berikut ? berikut.guru : "";
            el("progresPelajaran").style.width = "0%";
            el("sisaMenit").textContent = "";
            kartu.classList.add("santai");
        }

        // Sisa pelajaran setelah yang sedang berjalan
        const sisa = daftar.filter(function (x, i) {
            return i > indeks && menit(x.mulai) >= menitKini;
        });

        const wadah = el("sisaJadwal");

        if (!daftar.length) {
            wadah.innerHTML = kosongKecil("Libur — tidak ada pelajaran.");
            return;
        }

        if (!sisa.length) {
            wadah.innerHTML = kosongKecil("Semua pelajaran hari ini sudah lewat.");
            return;
        }

        wadah.innerHTML = sisa.map(function (x) {

            return '<div class="item">' +
                       '<span class="tm">' + x.jam.split(" - ")[0] + "</span>" +
                       "<div><strong>" + aman(x.mapel) + "</strong>" +
                       "<small>" + aman(x.guru) + "</small></div>" +
                       (x.ruang ? '<span class="tag">' + aman(x.ruang) + "</span>" : "") +
                   "</div>";

        }).join("");
    }

    perbaruiJadwal();
    setInterval(perbaruiJadwal, 30000);

    // -----------------------------------------------------
    // Piket hari ini — realtime centangnya
    // -----------------------------------------------------
    const hariKunciIni = namaHari[kini.getDay()].toLowerCase();
    const adaPiket = typeof piketHari !== "undefined" &&
                     piketHari.indexOf(hariKunciIni) !== -1;

    const reguIni = adaPiket ? ambilPiket(hariKunciIni) : [];

    el("jumlahPiket").textContent = reguIni.length;

    Store.watch("piket", function (nilai) {

        const wadah = el("piketRingkas");
        if (!wadah) return;

        if (!adaPiket) {
            wadah.innerHTML = kosongKecil("Akhir pekan — tidak ada piket.");
            return;
        }

        const selesai = (nilai && nilai.tanggal === tanggalKini && nilai.selesai)
            ? nilai.selesai
            : {};

        const sudah = reguIni.filter(function (u) { return selesai[u]; }).length;

        const nama = reguIni.slice(0, 4).map(function (u) {
            return users[u] ? users[u].nama.split(" ")[0] : u;
        }).join(", ");

        const sisa = reguIni.length - 4;

        wadah.innerHTML =
            '<div class="piket-baris">' +
                "<strong>" + (hariKunciIni === "jumat"
                    ? "Jumat Bersih — seluruh kelas"
                    : "Regu " + hariKunciIni.charAt(0).toUpperCase() + hariKunciIni.slice(1)) +
                "</strong>" +
                "<small>" + aman(nama) + (sisa > 0 ? ", +" + sisa + " lagi" : "") + "</small>" +
            "</div>" +
            '<div class="piket-progres">' +
                '<div class="track kecil"><i style="width:' +
                    (reguIni.length ? (sudah / reguIni.length) * 100 : 0) + '%"></i></div>' +
                "<span>" + sudah + "/" + reguIni.length + " selesai</span>" +
            "</div>";
    });

    // -----------------------------------------------------
    // Kas — realtime
    // -----------------------------------------------------
    Store.watch("dataKas", function (nilai) {

        const daftar = Array.isArray(nilai) ? nilai : [];

        const total = daftar.reduce(function (t, x) {
            return t + (Number(x.jumlah) || 0);
        }, 0);

        el("totalKasDashboard").textContent = "Rp " + total.toLocaleString("id-ID");

        const pembayar = new Set(daftar.map(function (x) { return x.nama; })).size;

        el("subKas").textContent = daftar.length
            ? pembayar + " dari " + semuaSiswa.length + " siswa sudah bayar"
            : "Belum ada pembayaran";
    });

    // -----------------------------------------------------
    // Absensi — realtime
    // -----------------------------------------------------
    Store.watch("dataAbsen", function (nilai) {

        let status = {};

        if (nilai && nilai.status) {
            if (nilai.tanggal === tanggalKini) status = nilai.status;
        } else if (nilai) {
            status = nilai;
        }

        const jumlah = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };

        Object.values(status).forEach(function (s) {
            if (jumlah[s] !== undefined) jumlah[s]++;
        });

        // Yang belum diabsen dihitung hadir
        const belum = semuaSiswa.length -
            (jumlah.Hadir + jumlah.Izin + jumlah.Sakit + jumlah.Alpha);

        if (belum > 0) jumlah.Hadir += belum;

        el("jumlahHadir").textContent = jumlah.Hadir;
        el("jumlahIzin").textContent  = jumlah.Izin;
        el("jumlahSakit").textContent = jumlah.Sakit;
        el("jumlahAlpha").textContent = jumlah.Alpha;

        setSeg("segHadir", jumlah.Hadir);
        setSeg("segIzin",  jumlah.Izin);
        setSeg("segSakit", jumlah.Sakit);
        setSeg("segAlpha", jumlah.Alpha);
    });

    function setSeg(id, nilai) {
        const e = el(id);
        if (e) e.style.flex = nilai > 0 ? Math.max(nilai, 0.35) : 0;
    }

    // -----------------------------------------------------
    // Pengumuman — realtime, dua terbaru
    // -----------------------------------------------------
    Store.watch("pengumuman", function (nilai) {

        const daftar = Array.isArray(nilai) ? nilai : [];
        const wadah = el("umumRingkas");

        el("jumlahPengumuman").textContent = daftar.length;

        if (!daftar.length) {
            wadah.innerHTML = kosongKecil("Belum ada pengumuman.");
            return;
        }

        wadah.innerHTML = daftar.slice(0, 2).map(function (u) {

            return '<div class="item">' +
                       "<div><strong>" + aman(u.judul) + "</strong>" +
                       (u.isi ? "<small>" + potong(aman(u.isi), 80) + "</small>" : "") +
                       "</div>" +
                   "</div>";

        }).join("");
    });

    // -----------------------------------------------------
    // Bantuan
    // -----------------------------------------------------
    function aman(t) {
        return String(t == null ? "" : t)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function potong(t, n) {
        return t.length > n ? t.slice(0, n) + "…" : t;
    }

    function kosongKecil(pesan) {
        return '<p class="kosong-kecil">' + pesan + "</p>";
    }
});
