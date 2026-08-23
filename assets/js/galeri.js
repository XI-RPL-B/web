// =========================================================
// GALERI XI RPL-B
// =========================================================
// Ketua, wakil ketua, dan sekretaris bisa menambah/menghapus.
// Bendahara dan siswa hanya melihat.
//
// Foto dipilih langsung dari HP/laptop, lalu DIKECILKAN dulu
// di browser sebelum dikirim. Tanpa itu, satu foto HP 4 MB
// akan menghabiskan jatah database gratis dalam hitungan hari.
//
// Cara simpan: daftar keterangan ada di "galeri",
// gambarnya sendiri terpisah di "galeri_foto_<id>" supaya
// membuka halaman tidak perlu mengunduh semua foto sekaligus.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    const bolehKelola = Auth.bolehKelolaGaleri(user);

    const LEBAR_MAKS = 1280;      // piksel sisi terpanjang
    const MUTU       = 0.72;      // kualitas JPEG
    const BATAS_KB   = 900;       // tolak kalau masih terlalu besar

    const formWrap  = document.getElementById("formGaleri");
    const inputFile = document.getElementById("berkasFoto");
    const areaPilih = document.getElementById("areaPilih");
    const antrian   = document.getElementById("antrian");
    const inputJudul = document.getElementById("judulFoto");
    const tombolUnggah = document.getElementById("tambahFoto");
    const daftar    = document.getElementById("daftarFoto");
    const catatan   = document.getElementById("catatanAkses");
    const jumlahEl  = document.getElementById("jumlahFoto");

    let data = [];
    let siap = [];   // foto yang sudah dikecilkan, menunggu disimpan

    if (!bolehKelola) {
        formWrap.style.display = "none";
        catatan.textContent =
            "Hanya ketua, wakil ketua, dan sekretaris yang bisa menambah foto.";
    } else {
        catatan.textContent = "Pilih foto dari galeri HP atau folder di laptop.";
    }

    // -----------------------------------------------------
    // Realtime: daftar keterangan
    // -----------------------------------------------------
    Store.watch("galeri", function (nilai) {

        data = Array.isArray(nilai) ? nilai : [];
        tampilkan();
    });

    // -----------------------------------------------------
    // Pilih berkas
    // -----------------------------------------------------
    if (bolehKelola) {

        areaPilih.addEventListener("click", function () { inputFile.click(); });

        areaPilih.addEventListener("dragover", function (e) {
            e.preventDefault();
            areaPilih.classList.add("aktif");
        });

        areaPilih.addEventListener("dragleave", function () {
            areaPilih.classList.remove("aktif");
        });

        areaPilih.addEventListener("drop", function (e) {
            e.preventDefault();
            areaPilih.classList.remove("aktif");
            terimaBerkas(e.dataTransfer.files);
        });

        inputFile.addEventListener("change", function () {
            terimaBerkas(this.files);
            this.value = "";
        });

        tombolUnggah.addEventListener("click", simpanSemua);
    }

    function terimaBerkas(berkasList) {

        const berkas = Array.from(berkasList || []).filter(function (f) {
            return f.type.indexOf("image/") === 0;
        });

        if (!berkas.length) {
            alert("Pilih berkas gambar (JPG, PNG, atau WEBP).");
            return;
        }

        areaPilih.classList.add("memuat");
        areaPilih.querySelector("span").textContent = "Mengecilkan foto...";

        Promise.all(berkas.map(kecilkan)).then(function (hasil) {

            hasil.forEach(function (h) { if (h) siap.push(h); });

            areaPilih.classList.remove("memuat");
            areaPilih.querySelector("span").textContent = "Ketuk untuk memilih foto";

            gambarAntrian();
        });
    }

    // -----------------------------------------------------
    // Kecilkan foto memakai canvas
    // -----------------------------------------------------
    function kecilkan(berkas) {

        return new Promise(function (selesai) {

            const pembaca = new FileReader();

            pembaca.onerror = function () { selesai(null); };

            pembaca.onload = function () {

                const gambar = new Image();

                gambar.onerror = function () { selesai(null); };

                gambar.onload = function () {

                    let l = gambar.width;
                    let t = gambar.height;

                    if (l > LEBAR_MAKS || t > LEBAR_MAKS) {
                        const rasio = LEBAR_MAKS / Math.max(l, t);
                        l = Math.round(l * rasio);
                        t = Math.round(t * rasio);
                    }

                    const kanvas = document.createElement("canvas");
                    kanvas.width = l;
                    kanvas.height = t;

                    const ctx = kanvas.getContext("2d");
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, l, t);
                    ctx.drawImage(gambar, 0, 0, l, t);

                    const hasil = kanvas.toDataURL("image/jpeg", MUTU);
                    const kb = Math.round((hasil.length * 3 / 4) / 1024);

                    if (kb > BATAS_KB) {
                        alert(
                            'Foto "' + berkas.name + '" masih terlalu besar (' + kb +
                            " KB) setelah dikecilkan. Coba potong dulu fotonya."
                        );
                        selesai(null);
                        return;
                    }

                    selesai({ dataUrl: hasil, kb: kb, nama: berkas.name });
                };

                gambar.src = pembaca.result;
            };

            pembaca.readAsDataURL(berkas);
        });
    }

    // -----------------------------------------------------
    // Antrian sebelum disimpan
    // -----------------------------------------------------
    function gambarAntrian() {

        if (!siap.length) {
            antrian.innerHTML = "";
            antrian.style.display = "none";
            tombolUnggah.disabled = true;
            tombolUnggah.textContent = "Tambahkan";
            return;
        }

        antrian.style.display = "grid";
        tombolUnggah.disabled = false;
        tombolUnggah.textContent =
            siap.length === 1 ? "Tambahkan foto" : "Tambahkan " + siap.length + " foto";

        antrian.innerHTML = siap.map(function (f, i) {

            return '<div class="antri">' +
                       '<img src="' + f.dataUrl + '" alt="">' +
                       '<button class="danger buangAntri" data-i="' + i + '">&times;</button>' +
                       "<small>" + f.kb + " KB</small>" +
                   "</div>";

        }).join("");

        antrian.querySelectorAll(".buangAntri").forEach(function (b) {

            b.addEventListener("click", function () {
                siap.splice(Number(this.dataset.i), 1);
                gambarAntrian();
            });
        });
    }

    // -----------------------------------------------------
    // Simpan ke database
    // -----------------------------------------------------
    function simpanSemua() {

        if (!siap.length) return;

        const judul = inputJudul.value.trim();

        tombolUnggah.disabled = true;
        tombolUnggah.textContent = "Menyimpan...";

        siap.forEach(function (f, urutan) {

            const id = Date.now() + urutan;

            // Gambar disimpan terpisah dari daftarnya
            Store.set("galeri_foto_" + id, f.dataUrl);

            data.unshift({
                id: id,
                judul: judul || bersihkanNama(f.nama),
                pengunggah: user.nama,
                kb: f.kb,
                dibuat: new Date().toISOString()
            });
        });

        Store.set("galeri", data);

        siap = [];
        inputJudul.value = "";
        gambarAntrian();
    }

    function bersihkanNama(nama) {
        return String(nama || "Foto")
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ")
            .slice(0, 60);
    }

    // -----------------------------------------------------
    // Tampilkan galeri
    // -----------------------------------------------------
    function tampilkan() {

        jumlahEl.textContent = data.length;

        if (!data.length) {

            daftar.innerHTML =
                '<div class="card kosong">' +
                    "<b>Galeri masih kosong</b>" +
                    (bolehKelola
                        ? "Tambahkan foto kegiatan lewat kotak di atas."
                        : "Belum ada foto yang diunggah pengurus.") +
                "</div>";

            return;
        }

        daftar.innerHTML = data.map(function (item) {

            return (
                '<figure class="foto-card" data-id="' + item.id + '">' +

                    '<div class="foto-bingkai"><span class="memuat-foto"></span></div>' +

                    "<figcaption>" +
                        "<strong>" + aman(item.judul) + "</strong>" +
                        "<small>" + aman(item.pengunggah || "") + "</small>" +
                    "</figcaption>" +

                    (bolehKelola
                        ? '<button class="danger hapusFoto" data-id="' + item.id + '">Hapus</button>'
                        : "") +

                "</figure>"
            );

        }).join("");

        // Ambil gambarnya satu per satu (dibaca sekali, tidak dipantau terus)
        data.forEach(function (item) {

            Store.once("galeri_foto_" + item.id, function (dataUrl) {

                const kartu = daftar.querySelector('[data-id="' + item.id + '"]');
                if (!kartu) return;

                const bingkai = kartu.querySelector(".foto-bingkai");

                // item.url = foto lama yang dulu ditambahkan lewat tautan
                const sumber = dataUrl || item.url;

                if (!sumber) {
                    bingkai.classList.add("gagal");
                    bingkai.innerHTML = "<span>Gambar tidak ditemukan.</span>";
                    return;
                }

                bingkai.innerHTML =
                    '<img src="' + sumber + '" alt="' + aman(item.judul) + '" loading="lazy">';
            });
        });

        if (!bolehKelola) return;

        daftar.querySelectorAll(".hapusFoto").forEach(function (b) {

            b.addEventListener("click", function () {

                if (!confirm("Hapus foto ini dari galeri?")) return;

                const id = Number(this.dataset.id);

                Store.set("galeri_foto_" + id, null);

                data = data.filter(function (x) { return x.id !== id; });
                Store.set("galeri", data);
            });
        });
    }

    function aman(t) {
        return String(t == null ? "" : t)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    gambarAntrian();
});
