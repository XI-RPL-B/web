// =========================================================
// KAS XI RPL-B — pemasukan & pengeluaran
// =========================================================
// Tiap catatan punya "tipe": "masuk" atau "keluar".
// Catatan lama yang belum punya tipe dianggap pemasukan,
// supaya data yang sudah tersimpan tidak berubah artinya.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    const bolehEdit = Auth.bolehEditKas(user);

    const formKas   = document.getElementById("formKas");
    const listKas   = document.getElementById("listKas");
    const totalEl   = document.getElementById("totalKas");
    const masukEl   = document.getElementById("totalMasuk");
    const keluarEl  = document.getElementById("totalKeluar");
    const pilihTipe = document.getElementById("pilihTipe");
    const namaEl    = document.getElementById("namaSiswa");
    const jumlahEl  = document.getElementById("jumlahKas");

    let dataKas = [];
    let tipeAktif = "masuk";

    if (!bolehEdit) formKas.style.display = "none";

    // -----------------------------------------------------
    // Realtime
    // -----------------------------------------------------
    Store.watch("dataKas", function (nilai) {

        dataKas = Array.isArray(nilai) ? nilai : [];
        tampilkanKas();
    });

    // -----------------------------------------------------
    // Pemasukan / Pengeluaran
    // -----------------------------------------------------
    if (bolehEdit) {

        pilihTipe.querySelectorAll("button").forEach(function (b) {

            b.addEventListener("click", function () {

                tipeAktif = this.dataset.tipe;

                pilihTipe.querySelectorAll("button").forEach(function (x) {
                    x.classList.toggle("aktif", x === b);
                });

                formKas.classList.toggle("mode-keluar", tipeAktif === "keluar");

                namaEl.placeholder = tipeAktif === "masuk"
                    ? "Nama siswa"
                    : "Keperluan, misal: beli sapu";
            });
        });

        document.getElementById("tambahKas")
            .addEventListener("click", function () {

                const nama = namaEl.value.trim();
                const jumlah = parseInt(jumlahEl.value, 10);

                if (!nama || !jumlah || jumlah <= 0) {
                    alert("Isi keterangan dan jumlah dengan benar!");
                    return;
                }

                // Cegah saldo jadi minus — kas kelas tidak bisa berutang
                if (tipeAktif === "keluar" && jumlah > hitung().saldo) {
                    alert(
                        "Pengeluaran melebihi saldo kas.\nSaldo sekarang: Rp " +
                        hitung().saldo.toLocaleString("id-ID")
                    );
                    return;
                }

                dataKas.push({
                    id: Date.now(),
                    tipe: tipeAktif,
                    nama: nama,
                    jumlah: jumlah,
                    tanggal: new Date().toLocaleDateString("id-ID"),
                    dicatatOleh: user.nama
                });

                Store.set("dataKas", dataKas);

                namaEl.value = "";
                jumlahEl.value = "";
            });
    }

    // -----------------------------------------------------
    // Hitung saldo
    // -----------------------------------------------------
    function hitung() {

        let masuk = 0;
        let keluar = 0;

        dataKas.forEach(function (item) {

            const n = Number(item.jumlah) || 0;

            if (item.tipe === "keluar") {
                keluar += n;
            } else {
                masuk += n;   // termasuk catatan lama tanpa tipe
            }
        });

        return { masuk: masuk, keluar: keluar, saldo: masuk - keluar };
    }

    // -----------------------------------------------------
    // Tampilkan
    // -----------------------------------------------------
    function tampilkanKas() {

        const t = hitung();

        totalEl.textContent  = "Rp " + t.saldo.toLocaleString("id-ID");
        masukEl.textContent  = "Rp " + t.masuk.toLocaleString("id-ID");
        keluarEl.textContent = "Rp " + t.keluar.toLocaleString("id-ID");

        if (!dataKas.length) {
            listKas.innerHTML =
                '<li class="kosong-kecil">Belum ada transaksi.</li>';
            return;
        }

        // Terbaru di atas, tanpa mengubah urutan data aslinya
        const urut = dataKas.map(function (item, i) {
            return { item: item, i: i };
        }).reverse();

        listKas.innerHTML = urut.map(function (x) {

            const item = x.item;
            const keluar = item.tipe === "keluar";

            return (
                '<li class="' + (keluar ? "keluar" : "masuk") + '">' +

                    "<div>" +
                        "<strong>" + escapeHtml(item.nama) + "</strong>" +
                        "<small>" + (item.tanggal || "") +
                        (item.dicatatOleh ? " &middot; " + escapeHtml(item.dicatatOleh) : "") +
                        "</small>" +
                    "</div>" +

                    '<span class="nominal">' +
                        (keluar ? "\u2212" : "+") + " Rp " +
                        Number(item.jumlah).toLocaleString("id-ID") +
                    "</span>" +

                    (bolehEdit
                        ? '<button class="danger hapusKas" data-index="' + x.i + '">Hapus</button>'
                        : "") +

                "</li>"
            );

        }).join("");

        if (!bolehEdit) return;

        listKas.querySelectorAll(".hapusKas").forEach(function (btn) {

            btn.addEventListener("click", function () {

                if (!confirm("Hapus catatan ini?")) return;

                dataKas.splice(Number(this.dataset.index), 1);
                Store.set("dataKas", dataKas);
            });
        });
    }

    function escapeHtml(teks) {
        return String(teks == null ? "" : teks)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
});
