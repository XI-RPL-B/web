// ======================
// HALAMAN JADWAL
// Data jadwalnya ada di assets/js/data-jadwal.js
// (dipakai bersama oleh halaman beranda)
// ======================


// ======================
// JAM BERJALAN
// ======================

function updateJam() {

    const sekarang = new Date();

    const jam =
        String(sekarang.getHours()).padStart(2, "0");

    const menit =
        String(sekarang.getMinutes()).padStart(2, "0");

    const detik =
        String(sekarang.getSeconds()).padStart(2, "0");

    document.getElementById("jam").textContent =
        `${jam}:${menit}:${detik} WIB`;

    const hari = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];

    const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    document.getElementById("tanggal").textContent =
        `${hari[sekarang.getDay()]}, ${sekarang.getDate()} ${bulan[sekarang.getMonth()]} ${sekarang.getFullYear()}`;

}

updateJam();

setInterval(updateJam, 1000);

// ======================
// TAMPILKAN JADWAL
// ======================

function tampilkanJadwal(hari) {

    const container =
        document.getElementById("jadwalList");

    container.innerHTML = "";

    // Tandai tombol hari yang sedang dipilih
    document.querySelectorAll(".hari-container button")
        .forEach(function (b) {
            b.classList.toggle(
                "active",
                (b.getAttribute("onclick") || "").indexOf("'" + hari + "'") !== -1
            );
        });

    jadwal[hari].forEach(item => {

        container.innerHTML += `

            <div class="card-jadwal">

                <div class="jam">${item.jam.replace(" - ", "<br>")}</div>

                <div class="isi">
                    <div class="mapel">${item.mapel}</div>
                    <div class="guru">${item.guru}</div>
                </div>

                ${item.ruang ? `<span class="tag">${item.ruang}</span>` : ""}

            </div>

        `;

    });

}

// ======================
// CEK PELAJARAN SEKARANG
// ======================

function cekPelajaran() {

    const sekarang = new Date();

    const namaHari = [
        "minggu",
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu"
    ][sekarang.getDay()];

    if (!jadwal[namaHari]) return;

    const jamSekarang =
        String(sekarang.getHours()).padStart(2, "0")
        + ":"
        +
        String(sekarang.getMinutes()).padStart(2, "0");

    let ditemukan = false;

    for (let i = 0; i < jadwal[namaHari].length; i++) {

        const pelajaran =
            jadwal[namaHari][i];

        if (

            jamSekarang >= pelajaran.mulai &&

            jamSekarang < pelajaran.selesai

        ) {

            document.getElementById(
                "mapelSekarang"
            ).textContent =
                pelajaran.mapel;

            document.getElementById(
                "jamSekarang"
            ).textContent =
                pelajaran.jam;

            if (

                i + 1 < jadwal[namaHari].length

            ) {

                document.getElementById(
                    "mapelBerikut"
                ).textContent =
                    jadwal[namaHari][i + 1].mapel;

                document.getElementById(
                    "jamBerikut"
                ).textContent =
                    jadwal[namaHari][i + 1].jam;

            }

            ditemukan = true;

            break;

        }

    }

    if (!ditemukan) {

        document.getElementById(
            "mapelSekarang"
        ).textContent =
            "Tidak ada pelajaran";

        document.getElementById(
            "jamSekarang"
        ).textContent =
            "-";

    }

}

cekPelajaran();

setInterval(cekPelajaran, 60000);

// ======================
// TAMPILKAN HARI INI
// ======================

window.onload = function () {

    const hari = [
        "minggu",
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu"
    ];

    const hariIni =
        hari[new Date().getDay()];

    if (jadwal[hariIni]) {

        tampilkanJadwal(hariIni);

    }

    else {

        tampilkanJadwal("senin");

    }

};