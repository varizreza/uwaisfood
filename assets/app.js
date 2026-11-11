(() => {
  'use strict';
  const cfg = window.UWAIS_CONFIG || {};
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const fmt = n => Number(n||0) > 0 ? new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)) : 'Hubungi kami';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let products = [];
  let settings = {};
  let filter = 'all';
  const fallbackProducts = async () => {
    const r = await fetch('data/products.json',{cache:'no-cache'});
    if(!r.ok) throw new Error('Katalog lokal tidak tersedia');
    const j = await r.json(); return j.products || [];
  };
  function jsonp(url) {
    return new Promise((resolve,reject)=>{
      const callback='uwaisCatalog_'+Date.now()+'_'+Math.floor(Math.random()*10000);
      const script=document.createElement('script'); let done=false;
      const timer=setTimeout(()=>finish(new Error('Koneksi katalog melewati batas waktu')),14000);
      function finish(err,data){if(done)return;done=true;clearTimeout(timer);delete window[callback];script.remove();err?reject(err):resolve(data)}
      window[callback]=data=>finish(null,data);
      script.onerror=()=>finish(new Error('Endpoint katalog belum dapat diakses'));
      script.src=url+(url.includes('?')?'&':'?')+'publicCatalog=1&callback='+encodeURIComponent(callback)+'&v='+Date.now();
      document.head.appendChild(script);
    });
  }
  function waNumber(){return String(settings.whatsappNumber || cfg.whatsappNumber || '').replace(/\D/g,'')}
  function orderUrl(product){
    const pwa=settings.customerPwaUrl || cfg.customerPwaUrl || '';
    if(pwa) return pwa;
    const n=waNumber();
    if(n) return 'https://wa.me/'+n+'?text='+encodeURIComponent('Halo Uwais Food, saya ingin bertanya tentang '+product.name+'.');
    return settings.instagramUrl || cfg.instagramUrl || 'https://www.instagram.com/uwaisfood_id/';
  }
  function productCard(p){
    const img=p.image || p.gambar || '';
    const name=p.name || p.nama || '';
    const category=p.category || categoryFromName(name);
    const price=Number(p.price ?? p.harga ?? 0);
    const unit=p.unit || p.satuan || '';
    const desc=p.description || p.isi || 'Dibuat dengan perhatian pada rasa dan kualitas.';
    const tag=p.tag || (p.featured?'PILIHAN FAVORIT':'');
    const photo=img ? `<img src="${esc(img)}" alt="${esc(name)}" loading="lazy" onerror="this.parentElement.classList.add('placeholder');this.remove()">` : '';
    return `<article class="product-card"><div class="product-image ${img?'':'placeholder'}">${photo}${!img?'<span>🥐</span>':''}${tag?`<span class="product-tag">${esc(tag)}</span>`:''}</div><div class="product-info"><span class="product-category">${esc(categoryLabel(category).toUpperCase())}</span><h3>${esc(name)}</h3><p>${esc(desc)}</p><div class="product-bottom"><strong>${esc(p.priceLabel || fmt(price))} <small>${unit?'/ '+esc(unit):''}</small></strong><a class="product-action" href="${esc(orderUrl({name}))}" target="_blank" rel="noopener" aria-label="Tanya ${esc(name)}">↗</a></div></div></article>`;
  }
  function categoryFromName(name){const s=String(name).toLowerCase(); if(/cake|cheese cake|dessert/.test(s))return 'cake';if(/hampers|parcel|gift/.test(s))return 'hampers';return 'pastry'}
  function categoryLabel(c){return ({pastry:'Pastry','cake':'Cake & Dessert',hampers:'Hampers'})[c]||'Produk'}
  function renderProducts(){
    const visible=products.filter(p=>p.active!==false && (filter==='all'||(p.category||categoryFromName(p.name||p.nama))===filter));
    $('#productGrid').innerHTML=visible.length?visible.map(productCard).join(''):'<div class="loading-card">Belum ada produk pada kategori ini.</div>';
    $('#productCount').textContent=visible.length+' produk tersedia';
  }
  function setText(id,value){if(value!==undefined && value!==null && String(value).trim()!=='')$(id).textContent=value}
  function setLink(id,url){const el=$(id);if(el&&url){el.href=url;el.target='_blank';el.rel='noopener'}}
  function applySettings(s={}){
    settings=s;
    setText('#announcementText',s.announcement);
    setText('#heroEyebrow',s.heroEyebrow);
    setText('#heroTitle',s.heroTitle);
    setText('#heroAccent',s.heroAccent);
    setText('#heroDescription',s.heroDescription);
    setText('#aboutTitle',s.aboutTitle);
    setText('#aboutText',s.aboutText);
    setText('#storeAddress',s.address || cfg.locationLabel || 'Tanjungpinang, Kepulauan Riau');
    setText('#storeHours',s.businessHours || 'Hubungi kami untuk informasi jam pelayanan.');
    setText('#locationIntro',s.locationIntro);
    if(s.heroImage) $('#heroImage').src=s.heroImage;
    const instagram=s.instagramUrl || cfg.instagramUrl;
    setLink('#instagramLink',instagram);
    const n=waNumber();
    const wa=$('#whatsappLink');
    if(wa){ if(n){wa.href='https://wa.me/'+n+'?text='+encodeURIComponent(s.whatsappMessage||cfg.whatsappMessage||'Halo Uwais Food, saya ingin bertanya.');wa.textContent='Chat via WhatsApp ↗';}else if(instagram){wa.href=instagram;wa.textContent='Hubungi via Instagram ↗';}}
    const pwa=s.customerPwaUrl || cfg.customerPwaUrl;
    if(pwa){setLink('#customerLink',pwa);$('#customerLink').textContent='Pesan melalui Customer PWA ↗';setLink('#headerOrder',pwa);setLink('#heroOrder',pwa);setLink('#floatingOrder',pwa);}
    else {$('#headerOrder').href='#produk';$('#heroOrder').href='#produk';$('#floatingOrder').href='#kontak';}
    const title=s.seoTitle || cfg.defaultSeoTitle;
    if(title){document.title=title;const og=$('meta[property="og:title"]');if(og)og.content=title;}
    const desc=s.seoDescription || cfg.defaultSeoDescription;
    if(desc){const m=$('meta[name="description"]');if(m)m.content=desc;const og=$('meta[property="og:description"]');if(og)og.content=desc;}
    renderMap(s);
    renderGallery(s.gallery || []);
    if(s.visibleProducts && Array.isArray(s.visibleProducts)){
      const allow=new Set(s.visibleProducts.map(x=>String(x).toLowerCase()));
      products=products.filter(p=>allow.has(String(p.name||p.nama).toLowerCase()));
    }
    const featured=new Set((s.featuredProducts||[]).map(x=>String(x).toLowerCase()));
    products=products.map(p=>({...p,featured:featured.has(String(p.name||p.nama).toLowerCase()),tag:featured.has(String(p.name||p.nama).toLowerCase())?'PILIHAN FAVORIT':p.tag}));
    renderProducts();
  }
  function renderMap(s){
    const address=s.address || '';
    const displayAddress=s.address || cfg.locationLabel || 'Tanjungpinang, Kepulauan Riau';
    $('#storeAddress').textContent=displayAddress;
    let lat=Number(s.latitude),lng=Number(s.longitude);
    let validCoords=Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180&&(s.latitude!==''&&s.longitude!=='');
    if(!validCoords && s.mapsUrl){
      const raw=String(s.mapsUrl);
      const match=raw.match(/@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/) || raw.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/);
      if(match){lat=Number(match[1]);lng=Number(match[2]);validCoords=Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;}
    }
    const query=validCoords?`${lat},${lng}`:address;
    const mapsUrl=s.mapsUrl || (query?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query):'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Uwais Food Tanjungpinang'));
    $('#mapsDirection').href=mapsUrl;
    $('#mapsDirection').target='_blank';$('#mapsDirection').rel='noopener';
    const note=$('#mapNote');
    const embed=$('#mapFrame');
    if(query){
      const src='https://www.google.com/maps?q='+encodeURIComponent(query)+'&z=16&output=embed';
      embed.innerHTML=`<iframe title="Peta lokasi Uwais Food" src="${esc(src)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
      if(validCoords) note.textContent='Peta menggunakan titik koordinat yang disimpan pada CMS.';
      else note.textContent='Peta menampilkan pencarian alamat. Tambahkan koordinat pin untuk penunjuk lokasi yang lebih akurat.';
    } else {
      embed.innerHTML='<div class="map-empty"><span class="map-pin-large">⌖</span><strong>Lokasi Uwais Food</strong><p>Alamat/pin Google Maps akan ditampilkan di sini setelah diatur melalui CMS.</p><a href="'+esc(mapsUrl)+'" target="_blank" rel="noopener">Cari di Google Maps ↗</a></div>';
      note.textContent='Pin lokasi yang tepat dapat diatur melalui CMS.';
    }
  }
  function renderGallery(gallery){
    if(!Array.isArray(gallery)||!gallery.length)return;
    const grid=$('#galleryGrid');
    const urls=gallery.filter(Boolean).slice(0,6);
    if(!urls.length)return;
    grid.innerHTML=urls.map((url,i)=>`<figure class="gallery-tile ${i===0?'gallery-tall':''}"><img src="${esc(url)}" alt="Galeri Uwais Food ${i+1}" loading="lazy"></figure>`).join('');
  }
  $('#productFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;$$('.filter-chip').forEach(x=>x.classList.toggle('selected',x===b));renderProducts()});
  $('#themeToggle').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('uwais-theme',dark?'dark':'light');$('#themeToggle .theme-icon').textContent=dark?'☾':'☼'});
  const savedTheme=localStorage.getItem('uwais-theme');if(savedTheme==='dark'){document.documentElement.dataset.theme='dark';$('#themeToggle .theme-icon').textContent='☾'}
  $('#menuToggle').addEventListener('click',()=>{document.body.classList.toggle('menu-open');$('#menuToggle').setAttribute('aria-expanded',document.body.classList.contains('menu-open')?'true':'false')});
  $$('.nav-link').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');$$('.nav-link').forEach(x=>x.classList.toggle('active',x===a))}));
  $('#copyAddress').addEventListener('click',async()=>{const value=settings.address || cfg.locationLabel || 'Tanjungpinang, Kepulauan Riau';try{await navigator.clipboard.writeText(value);toast('Alamat berhasil disalin')}catch(_){toast(value)}});
  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}
  $('#year').textContent=new Date().getFullYear();
  async function init(){
    try{
      const data=cfg.appsScriptUrl?await jsonp(cfg.appsScriptUrl):null;
      if(data&&data.success){products=Array.isArray(data.products)?data.products:[];applySettings(data.settings||{});return;}
      products=await fallbackProducts();applySettings({});
    }catch(err){console.warn('Katalog publik belum tersedia, memakai fallback.',err);try{products=await fallbackProducts()}catch(_){products=[]}applySettings({});}
  }
  init();
})();
