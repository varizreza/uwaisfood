(() => {
  const config = window.UWAIS_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const grid = $("#productGrid");
  const filters = $("#productFilters");
  let products = [];
  let activeFilter = "all";

  const formatPrice = (p) => p.priceLabel || (p.price ? new Intl.NumberFormat("id-ID", {style:"currency",currency:"IDR",maximumFractionDigits:0}).format(p.price) : "Hubungi kami");
  const escapeHtml = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const productCard = (p) => `
    <article class="product-card">
      <div class="product-image">
        <img src="${escapeHtml(p.image || "")}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.opacity='.15'">
        ${p.tag ? `<span class="product-tag">${escapeHtml(p.tag)}</span>` : ""}
      </div>
      <div class="product-info">
        <span class="product-category">${escapeHtml((p.categoryLabel || p.category || "PRODUK").toUpperCase())}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || "")}</p>
        <div class="product-bottom"><strong>${escapeHtml(formatPrice(p))} <small>${p.unit ? "/ " + escapeHtml(p.unit) : ""}</small></strong><a href="${contactHref(p)}" ${contactTarget()} aria-label="Tanya ${escapeHtml(p.name)}">↗</a></div>
      </div>
    </article>`;
  function contactHref(p) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    if (number) return `https://wa.me/${number}?text=${encodeURIComponent(`Halo Uwais Food, saya ingin bertanya tentang ${p.name}.`)}`;
    return config.instagramUrl || "https://www.instagram.com/uwaisfood_id/";
  }
  function contactTarget() { return 'target="_blank" rel="noopener"'; }
  function render() {
    const visible = products.filter(p => p.active !== false && (activeFilter === "all" || p.category === activeFilter));
    grid.innerHTML = visible.length ? visible.map(productCard).join("") : '<div class="empty-state">Belum ada produk pada kategori ini.</div>';
    $("#productCount").textContent = `${visible.length} produk`;
  }
  function loadPublicCatalogJsonp(url) {
    return new Promise((resolve, reject) => {
      const callbackName = "__uwaisCatalog_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Waktu tunggu katalog habis"));
      }, 12000);
      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      }
      window[callbackName] = data => { cleanup(); resolve(data); };
      script.onerror = () => { cleanup(); reject(new Error("Endpoint katalog tidak dapat diakses")); };
      const separator = url.includes("?") ? "&" : "?";
      script.src = url + separator + "publicCatalog=1&callback=" + encodeURIComponent(callbackName) + "&v=" + Date.now();
      document.head.appendChild(script);
    });
  }

  async function loadProducts() {
    if (!config.catalogUrl) return; // Data lokal adalah fallback awal.
    try {
      const data = await loadPublicCatalogJsonp(config.catalogUrl);
      const list = Array.isArray(data) ? data : data && data.products;
      if (data && data.ok === false) throw new Error(data.error || "Endpoint katalog melaporkan error");
      if (Array.isArray(list)) {
        products = list;
        render();
      } else {
        throw new Error("Format JSON katalog tidak sesuai");
      }
    } catch (error) {
      console.warn("Katalog online gagal dimuat; menggunakan katalog lokal.", error);
      // Katalog lokal tetap tampil jika Apps Script belum dideploy atau sedang offline.
    }
  }

  filters?.addEventListener("click", e => {
    const button = e.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    filters.querySelectorAll(".filter-chip").forEach(el => el.classList.toggle("selected", el === button));
    render();
  });

  const themeButton = $("#themeToggle");
  const savedTheme = localStorage.getItem("uwais-theme");
  if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";
  themeButton?.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("uwais-theme", dark ? "dark" : "light");
    showToast(dark ? "Tema gelap diaktifkan" : "Tema terang diaktifkan");
  });

  const menuToggle = $("#menuToggle");
  menuToggle?.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", document.body.classList.contains("menu-open"));
  });
  document.querySelectorAll(".desktop-nav a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  const number = (config.whatsappNumber || "").replace(/\D/g, "");
  const wa = $("#whatsappLink");
  if (wa) {
    if (number) wa.href = `https://wa.me/${number}?text=${encodeURIComponent(config.whatsappMessage || "Halo Uwais Food, saya ingin bertanya.")}`;
    else {
      wa.href = config.instagramUrl || "https://www.instagram.com/uwaisfood_id/";
      wa.innerHTML = 'Hubungi via Instagram <span>↗</span>';
    }
  }
  const ig = $("#instagramLink");
  if (ig && config.instagramUrl) ig.href = config.instagramUrl;
  $("#year").textContent = new Date().getFullYear();

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }
  loadProducts();
})();