// =========================================================
// TEMA TERANG / GELAP
// =========================================================
// Pilihan tersimpan di perangkat masing-masing.
// Kalau belum pernah memilih, ikut pengaturan sistem (HP/laptop).
// =========================================================

const Tema = (function () {

    const KUNCI = "temaWeb";

    function sistemGelap() {
        return window.matchMedia &&
               window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function sekarang() {
        return document.documentElement.getAttribute("data-theme") || "light";
    }

    function pasang(nama) {
        document.documentElement.setAttribute("data-theme", nama);

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = nama === "dark" ? "#080B14" : "#EEF1F7";

        window.dispatchEvent(new CustomEvent("temaBerubah", { detail: nama }));
    }

    // Dijalankan sedini mungkin supaya tidak ada kedipan putih
    function awal() {
        let simpanan = null;
        try { simpanan = localStorage.getItem(KUNCI); } catch (e) {}
        pasang(simpanan || (sistemGelap() ? "dark" : "light"));
    }

    function ganti() {
        const baru = sekarang() === "dark" ? "light" : "dark";
        try { localStorage.setItem(KUNCI, baru); } catch (e) {}
        pasang(baru);
        perbaruiTombol();
    }

    // Wadah bersama untuk tombol tema + lencana sinkronisasi
    function bilahAlat() {
        let bar = document.getElementById("appTools");

        if (!bar) {
            bar = document.createElement("div");
            bar.id = "appTools";
            bar.className = "app-tools";
            document.body.appendChild(bar);
        }

        return bar;
    }

    let tombol = null;

    function perbaruiTombol() {
        if (!tombol) return;

        const gelap = sekarang() === "dark";

        tombol.textContent = gelap ? "☀️" : "🌙";
        tombol.setAttribute(
            "aria-label",
            gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"
        );
        tombol.title = tombol.getAttribute("aria-label");
    }

    function pasangTombol() {
        tombol = document.createElement("button");
        tombol.type = "button";
        tombol.className = "theme-toggle";
        tombol.addEventListener("click", ganti);

        bilahAlat().appendChild(tombol);
        perbaruiTombol();
    }

    awal();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", pasangTombol);
    } else {
        pasangTombol();
    }

    return {
        ganti: ganti,
        sekarang: sekarang,
        bilahAlat: bilahAlat
    };

})();
