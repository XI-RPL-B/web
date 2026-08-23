// =========================================================
// LOGIN
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    // Kalau sudah login, langsung ke dashboard
    if (Auth.user()) {
        window.location.replace("dashboard.html");
        return;
    }

    // Tombol mata: tampilkan / sembunyikan password
    const kolomSandi = document.getElementById("password");
    const tombolMata = document.getElementById("lihatSandi");

    tombolMata.addEventListener("click", function () {

        const terlihat = kolomSandi.type === "text";

        kolomSandi.type = terlihat ? "password" : "text";
        this.classList.toggle("aktif", !terlihat);

        this.setAttribute(
            "aria-label",
            terlihat ? "Tampilkan password" : "Sembunyikan password"
        );

        // Kursor tetap di ujung teks, tidak lompat ke awal
        kolomSandi.focus();
        const n = kolomSandi.value.length;
        kolomSandi.setSelectionRange(n, n);
    });

    document.getElementById("loginForm")
        .addEventListener("submit", function (e) {

            e.preventDefault();

            const username = document.getElementById("username")
                .value.trim().toLowerCase();

            const password = document.getElementById("password")
                .value.trim();

            const akun = users[username];

            if (!akun) {
                alert("Username tidak ditemukan!");
                return;
            }

            if (akun.password !== password) {
                alert("Password salah!");
                return;
            }

            Auth.simpan({
                username: username,
                nama: akun.nama,
                role: akun.role,
                absen: akun.absen
            });

            window.location.replace("dashboard.html");
        });
});