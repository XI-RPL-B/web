// =========================================================
// KAS XI RPL-B — realtime
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    const bolehEdit = Auth.bolehEditKas(user);

    const formKas  = document.getElementById("formKas");
    const listKas  = document.getElementById("listKas");
    const totalEl  = document.getElementById("totalKas");

    let dataKas = [];

    // Sembunyikan form untuk yang bukan ketua / bendahara
    if (!bolehEdit) formKas.style.display = "none";

    // -----------------------------------------------------
    // Realtime
    // -----------------------------------------------------
    Store.watch("dataKas", function (nilai) {

        dataKas = Array.isArray(nilai) ? nilai : [];
        tampilkanKas();
    });

    // -----------------------------------------------------
    // Tambah pembayaran
    // -----------------------------------------------------
    if (bolehEdit) {

        document.getElementById("tambahKas")
            .addEventListener("click", function () {

                const namaEl   = document.getElementById("namaSiswa");
                const jumlahEl = document.getElementById("jumlahKas");

                const nama   = namaEl.value.trim();
                const jumlah = parseInt(jumlahEl.value, 10);

                if (!nama || !jumlah || jumlah <= 0) {
                    alert("Isi nama dan jumlah dengan benar!");
                    return;
                }

                dataKas.push({
                    id: Date.now(),
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
    // Tampilkan daftar
    // -----------------------------------------------------
    function tampilkanKas() {

        let total = 0;
        let html = "";

        dataKas.forEach(function (item, i) {

            total += Number(item.jumlah) || 0;

            html +=
                "<li>" +
                    "<span>" +
                        escapeHtml(item.nama) + " — Rp " +
                        Number(item.jumlah).toLocaleString("id-ID") +
                        (item.tanggal
                            ? ' <small style="opacity:.6">(' + item.tanggal + ")</small>"
                            : "") +
                    "</span>" +
                    (bolehEdit
                        ? ' <button class="hapusKas" data-index="' + i + '" ' +
                          'style="margin-left:8px;border:0;border-radius:6px;' +
                          'padding:2px 8px;cursor:pointer;background:#dc3545;' +
                          'color:#fff">Hapus</button>'
                        : "") +
                "</li>";
        });

        listKas.innerHTML = html ||
            '<li style="opacity:.6">Belum ada pembayaran.</li>';

        totalEl.textContent = "Rp " + total.toLocaleString("id-ID");

        if (bolehEdit) {

            listKas.querySelectorAll(".hapusKas").forEach(function (btn) {

                btn.addEventListener("click", function () {

                    if (!confirm("Hapus catatan ini?")) return;

                    dataKas.splice(Number(this.dataset.index), 1);
                    Store.set("dataKas", dataKas);
                });
            });
        }
    }

    function escapeHtml(teks) {
        return String(teks)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
});
