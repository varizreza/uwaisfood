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
  function setHeroHeading(s){
    const el=$('#heroTitle');
    if(!el)return;
    const lead=String(s.heroTitle || 'Bahagia dimulai dari').trim();
    const accent=String(s.heroAccent || 'gigitan pertama.').trim();
    el.replaceChildren(document.createTextNode(lead+(accent?' ':'')));
    if(accent){const em=document.createElement('em');em.id='heroAccent';em.textContent=accent;el.append(em);}
  }
  function setLink(id,url){const el=$(id);if(el&&url){el.href=url;el.target='_blank';el.rel='noopener'}}
  function applySettings(s={}){
    settings=s;
    setText('#announcementText',s.announcement);
    setText('#heroEyebrow',s.heroEyebrow);
    setHeroHeading(s);
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
  function renderMap(s={}){
    const address=String(s.address || '').trim();
    const rawMapUrl=String(s.mapsUrl || s.mapUrl || cfg.mapsUrl || '').trim();
    const validHttps=value=>{try{return new URL(value).protocol==='https:'}catch(_){return false}};
    const readCoord=value=>{
      if(value===undefined||value===null||String(value).trim()==='')return null;
      const n=Number(String(value).trim().replace(',','.'));
      return Number.isFinite(n)?n:null;
    };
    let lat=readCoord(s.latitude ?? s.lat);
    let lng=readCoord(s.longitude ?? s.lng);
    let validCoords=lat!==null&&lng!==null&&Math.abs(lat)<=90&&Math.abs(lng)<=180;

    // Tautan Google Maps panjang kadang sudah memuat koordinat pin.
    if(!validCoords&&rawMapUrl){
      try{
        const decoded=decodeURIComponent(rawMapUrl);
        const match=decoded.match(/@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/)
          || decoded.match(/!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/)
          || decoded.match(/[?&](?:q|query|ll|center)=(-?\d{1,2}(?:\.\d+)?)[, ]+(-?\d{1,3}(?:\.\d+)?)/i);
        if(match){
          const candidateLat=Number(match[1]),candidateLng=Number(match[2]);
          if(Number.isFinite(candidateLat)&&Number.isFinite(candidateLng)&&Math.abs(candidateLat)<=90&&Math.abs(candidateLng)<=180){
            lat=candidateLat;lng=candidateLng;validCoords=true;
          }
        }
      }catch(_){}
    }

    const query=validCoords?lat+','+lng:address;
    const fallbackSearch='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address||'Uwais Food Tanjungpinang');
    const directionUrl=validHttps(rawMapUrl)?rawMapUrl:(query?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query):fallbackSearch);
    const displayAddress=address||(validCoords?'Lokasi Uwais Food · titik peta tersimpan':rawMapUrl?'Lihat lokasi melalui Google Maps':(cfg.locationLabel||'Tanjungpinang, Kepulauan Riau'));
    $('#storeAddress').textContent=displayAddress;
    const direction=$('#mapsDirection');
    direction.href=directionUrl;direction.target='_blank';direction.rel='noopener noreferrer';

    const note=$('#mapNote');
    const frame=$('#mapFrame');
    if(query){
      const src='https://www.google.com/maps?q='+encodeURIComponent(query)+'&z=17&output=embed';
      frame.innerHTML='<iframe title="Peta lokasi Uwais Food" src="'+esc(src)+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
      note.textContent=validCoords?'Peta menampilkan titik koordinat yang tersimpan di CMS.':'Peta menampilkan area berdasarkan alamat CMS. Tambahkan koordinat untuk pin yang lebih presisi.';
    }else if(validHttps(rawMapUrl)){
      // Link singkat maps.app.goo.gl tidak mengandung koordinat yang dapat dibaca browser.
      // Tetap tampilkan status lokasi dan tautan aslinya, bukan membiarkan panel peta kosong.
      frame.innerHTML='<div class="map-link-state"><span class="map-link-pin">⌖</span><strong>Lokasi Uwais Food sudah ditautkan</strong><p>CMS menyimpan tautan berbagi Google Maps. Buka tautan ini untuk melihat pin lokasi yang tepat.</p><a href="'+esc(directionUrl)+'" target="_blank" rel="noopener noreferrer">Buka lokasi di Google Maps <span>↗</span></a></div>';
      note.textContent='Tautan lokasi berasal dari CMS. Untuk menampilkan peta langsung di halaman, isi alamat atau koordinat Latitude dan Longitude.';
    }else{
      frame.innerHTML='<div class="map-empty"><span class="map-pin-large">⌖</span><strong>Lokasi Uwais Food</strong><p>Atur alamat atau koordinat pin melalui CMS untuk menampilkan peta di sini.</p><a href="'+esc(fallbackSearch)+'" target="_blank" rel="noopener noreferrer">Cari di Google Maps ↗</a></div>';
      note.textContent='Alamat dan pin lokasi dapat diatur melalui CMS.';
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
  $('#copyAddress').addEventListener('click',async()=>{
    const value=String(settings.address || settings.mapsUrl || cfg.locationLabel || '').trim();
    if(!value){toast('Alamat toko belum diatur di CMS.','info');return;}
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard tidak tersedia');
      await navigator.clipboard.writeText(value);
      toast('Alamat berhasil disalin.','success');
    }catch(_){toast('Tidak dapat menyalin otomatis. Silakan salin alamat dari bagian lokasi.','error');}
  });
  function toast(message,type='success',options={}){
    const stack=$('#toastStack');
    if(!stack)return;
    const allowed=['success','info','error','warning'];
    const variant=allowed.includes(type)?type:'info';
    const duration=Math.max(1800,Number(options.duration)||3400);
    const icons={success:'✓',info:'i',error:'!',warning:'!'};
    const el=document.createElement('div');
    el.className='toast toast-'+variant;
    el.style.setProperty('--toast-duration',duration+'ms');
    el.setAttribute('role',variant==='error'?'alert':'status');
    const icon=document.createElement('span');
    icon.className='toast-icon';icon.setAttribute('aria-hidden','true');icon.textContent=icons[variant];
    const text=document.createElement('span');
    text.className='toast-message';text.textContent=String(message||'');
    const close=document.createElement('button');
    close.className='toast-close';close.type='button';close.setAttribute('aria-label','Tutup notifikasi');close.textContent='×';
    const progress=document.createElement('span');progress.className='toast-progress';progress.setAttribute('aria-hidden','true');
    el.append(icon,text,close,progress);stack.append(el);
    let timer;
    const dismiss=()=>{
      if(el.dataset.closing)return;
      el.dataset.closing='1';el.classList.add('toast-leave');
      clearTimeout(timer);setTimeout(()=>el.remove(),220);
    };
    close.addEventListener('click',dismiss);
    el.addEventListener('mouseenter',()=>clearTimeout(timer));
    el.addEventListener('mouseleave',()=>{if(!el.dataset.closing)timer=setTimeout(dismiss,duration);});
    timer=setTimeout(dismiss,duration);
    while(stack.children.length>4)stack.firstElementChild.remove();
    return el;
  }
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
