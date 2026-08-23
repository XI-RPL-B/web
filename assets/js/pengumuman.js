// =========================================================
// PENGUMUMAN XI RPL-B
// =========================================================
// Semua orang bisa membaca.
// Hanya SEKRETARIS yang bisa menulis, mengubah, dan menghapus.
// Perubahan langsung muncul di perangkat semua orang.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    const bolehEdit = Auth.bolehEditPengumuman(user);

    const formWrap  = document.getElementById("formPengumuman");
    const inputJudul = document.getElementById("judulUmum");
    const inputIsi   = document.getElementById("isiUmum");
    const tombolSimpan = document.getElementById("simpanUmum");
    const tombolBatal  = document.getElementById("batalUmum");
    const daftar    = document.getElementById("daftarUmum");
    const catatan   = document.getElementById("catatanAkses");

    let data = [];
    let sedangEdit = null;   // id pengumuman yang sedang diubah

    if (!bolehEdit) {
        formWrap.style.display = "none";
        catatan.textContent = "Hanya sekretaris yang bisa menulis pengumuman.";
    } else {
        catatan.textContent = "Pengumuman yang kamu tulis langsung terbaca satu kelas.";
    }

    // -----------------------------------------------------
    // Realtime
    // -----------------------------------------------------
    Store.watch("pengumuman", function (nilai) {

        data = Array.isArray(nilai) ? nilai : [];
        tampilkan();
    });

    // -----------------------------------------------------
    // Simpan (tambah baru atau perbarui yang sedang diubah)
    // -----------------------------------------------------
    if (bolehEdit) {

        tombolSimpan.addEventListener("click", function () {

            const judul = inputJudul.value.trim();
            const isi   = inputIsi.value.trim();

            if (!judul) {
                alert("Judul pengumuman belum diisi.");
                inputJudul.focus();
                return;
            }

            if (sedangEdit !== null) {

                const target = data.find(function (x) { return x.id === sedangEdit; });

                if (target) {
                    target.judul = judul;
                    target.isi = isi;
                    target.diubah = new Date().toISOString();
                }

            } else {

                data.unshift({
                    id: Date.now(),
                    judul: judul,
                    isi: isi,
                    penulis: user.nama,
                    dibuat: new Date().toISOString()
                });
            }

            Store.set("pengumuman", data);
            resetForm();
        });

        tombolBatal.addEventListener("click", resetForm);
    }

    function resetForm() {
        sedangEdit = null;
        inputJudul.value = "";
        inputIsi.value = "";
        tombolSimpan.textContent = "Terbitkan";
        tombolBatal.style.display = "none";
    }

    // -----------------------------------------------------
    // Tampilkan daftar
    // -----------------------------------------------------
    function tampilkan() {

        if (!data.length) {

            daftar.innerHTML =
                '<div class="card kosong">' +
                    "<b>Belum ada pengumuman</b>" +
                    (bolehEdit
                        ? "Tulis yang pertama lewat kotak di atas."
                        : "Sekretaris belum menulis apa pun.") +
                "</div>";

            return;
        }

        daftar.innerHTML = data.map(function (item) {

            return (
                '<article class="umum-card">' +

                    '<div class="umum-atas">' +
                        "<h3>" + aman(item.judul) + "</h3>" +
                        (bolehEdit
                            ? '<div class="umum-aksi">' +
                                  '<button class="ghost ubahUmum" data-id="' + item.id + '">Ubah</button>' +
                                  '<button class="danger hapusUmum" data-id="' + item.id + '">Hapus</button>' +
                              "</div>"
                            : "") +
                    "</div>" +

                    (item.isi ? "<p>" + aman(item.isi).replace(/\n/g, "<br>") + "</p>" : "") +

                    '<div class="umum-meta">' +
                        aman(item.penulis || "Sekretaris") + " &middot; " +
                        waktu(item.diubah || item.dibuat) +
                        (item.diubah ? " (diubah)" : "") +
                    "</div>" +

                "</article>"
            );

        }).join("");

        if (!bolehEdit) return;

        daftar.querySelectorAll(".hapusUmum").forEach(function (b) {

            b.addEventListener("click", function () {

                if (!confirm("Hapus pengumuman ini?")) return;

                const id = Number(this.dataset.id);
                data = data.filter(function (x) { return x.id !== id; });

                Store.set("pengumuman", data);
                if (sedangEdit === id) resetForm();
            });
        });

        daftar.querySelectorAll(".ubahUmum").forEach(function (b) {

            b.addEventListener("click", function () {

                const id = Number(this.dataset.id);
                const target = data.find(function (x) { return x.id === id; });
                if (!target) return;

                sedangEdit = id;
                inputJudul.value = target.judul || "";
                inputIsi.value = target.isi || "";
                tombolSimpan.textContent = "Simpan perubahan";
                tombolBatal.style.display = "block";

                formWrap.scrollIntoView({ behavior: "smooth", block: "center" });
                inputJudul.focus();
            });
        });
    }

    // -----------------------------------------------------
    // Bantuan
    // -----------------------------------------------------
    function aman(teks) {
        return String(teks == null ? "" : teks)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function waktu(iso) {

        if (!iso) return "";

        const d = new Date(iso);
        if (isNaN(d)) return "";

        const selisih = (Date.now() - d.getTime()) / 1000;

        if (selisih < 60)    return "baru saja";
        if (selisih < 3600)  return Math.floor(selisih / 60) + " menit lalu";
        if (selisih < 86400) return Math.floor(selisih / 3600) + " jam lalu";

        return d.toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric"
        });
    }
});
