// window.onload diganti DOMContentLoaded: onload gampang
// tertimpa skrip lain dan baru jalan setelah semua gambar selesai.
window.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("daftarSiswa");

    // Urutkan berdasarkan nomor absen
    const semua = Object.values(users).sort(function (a, b) {
        return a.absen - b.absen;
    });

    document.getElementById("jumlahSiswa").textContent = semua.length;

    document.getElementById("jumlahPengurus").textContent =
        semua.filter(function (s) { return s.role !== "siswa"; }).length;

    tampilkanSiswa(semua);

    // Fitur pencarian
    document.getElementById("search").addEventListener(
        "input",
        function () {

            const keyword = this.value.toLowerCase();

            const hasil = semua.filter(function (siswa) {
                return siswa.nama.toLowerCase().includes(keyword) ||
                       String(siswa.absen) === keyword ||
                       String(siswa.jabatan || "").toLowerCase().includes(keyword);
            });

            tampilkanSiswa(hasil);
        }
    );

    // Fungsi menampilkan siswa
    function tampilkanSiswa(data) {

        container.innerHTML = "";

        data.forEach(siswa => {

            let icon = "\u{1F393}";
            let roleClass = "siswa";

            if (siswa.role === "ketua") {
                icon = "\u{1F451}";
                roleClass = "ketua";
            }

            else if (siswa.role === "wakil ketua") {
                icon = "\u{1F396}";
                roleClass = "wakil-ketua";
            }

            else if (siswa.role === "bendahara") {
                icon = "\u{1F4B0}";
                roleClass = "bendahara";
            }

            else if (siswa.role === "sekretaris") {
                icon = "\u{1F4DD}";
                roleClass = "sekretaris";
            }

            // Jabatan lengkap (mis. "Sekretaris 1") kalau ada,
            // kalau tidak ya pakai role-nya saja.
            const label = siswa.jabatan || siswa.role;

            container.innerHTML += `

                <div class="card-siswa">

                    <div>
                        <div class="nama">${icon} ${siswa.nama}</div>
                        <div class="absen">Absen ${siswa.absen}</div>
                    </div>

                    ${siswa.role !== "siswa"
                        ? `<div class="role ${roleClass}">${label}</div>`
                        : ""}

                </div>

            `;
        });

    }

});
