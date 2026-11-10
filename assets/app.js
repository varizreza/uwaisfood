(() => {
  'use strict';
  const config = window.UWAIS_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const grid = $('#productGrid');
  const filters = $('#productFilters');
  let products = [];
  let activeFilter = 'all';
  let cmsContent = null;
  let cmsContact = null;

  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatPrice = p => p.priceLabel || (p.price ? new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(p.price) : 'Hubungi kami');
  function whatsappNumber(){return String((cmsContact&&cmsContact.whatsapp)||config.whatsappNumber||'').replace(/\D/g,'')}
  function whatsappBaseMessage(){return (cmsContact&&cmsContact.whatsappMessage)||config.whatsappMessage||'Halo Uwais Food, saya ingin bertanya.'}
  function contactHref(p){
    const n=whatsappNumber();
    if(n)return 'https://wa.me/'+n+'?text='+encodeURIComponent('Halo Uwais Food, saya ingin bertanya tentang '+p.name+'.');
    return (cmsContact&&cmsContact.instagram)||config.instagramUrl||'https://www.instagram.com/uwaisfood_id/';
  }
  function productCard(p){
    return '<article class="product-card"><div class="product-image">'+
      '<img src="'+escapeHtml(p.image||'')+'" alt="'+escapeHtml(p.name)+'" loading="lazy" onerror="this.style.opacity=\'.15\'">'+
      (p.tag?'<span class="product-tag">'+escapeHtml(p.tag)+'</span>':'')+
      '</div><div class="product-info"><span class="product-category">'+escapeHtml((p.categoryLabel||p.category||'PRODUK').toUpperCase())+'</span>'+
      '<h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(p.description||'')+'</p>'+
      '<div class="product-bottom"><strong>'+escapeHtml(formatPrice(p))+' <small>'+(p.unit?'/ '+escapeHtml(p.unit):'')+'</small></strong>'+
      '<a href="'+escapeHtml(contactHref(p))+'" target="_blank" rel="noopener" aria-label="Tanya '+escapeHtml(p.name)+'">↗</a></div></div></article>';
  }
  function render(){
    const visible=products.filter(p=>p.active!==false&&(activeFilter==='all'||p.category===activeFilter));
    grid.innerHTML=visible.length?visible.map(productCard).join(''):'<div class="empty-state">Belum ada produk pada kategori ini.</div>';
    $('#productCount').textContent=visible.length+' produk';
  }
  function safePublicUrl(value){
    const s=String(value||'').trim();
    if(/^https:\/\//i.test(s)||/^#[A-Za-z][A-Za-z0-9_-]{0,60}$/.test(s))return s;
    return '';
  }
  function setText(id,value){const el=$('#'+id);if(el&&value!=null)el.textContent=String(value)}
  function setLink(id,label,href){
    const el=$('#'+id);if(!el)return;
    if(label)setTextNodePreservingIcon(el,label);
    const url=safePublicUrl(href);if(url)el.href=url;
  }
  function setTextNodePreservingIcon(el,label){
    const child=el.querySelector('span');
    el.textContent=label+' ';
    if(child)el.appendChild(child);
    else {const arrow=document.createElement('span');arrow.textContent='↗';el.appendChild(arrow)}
  }
  function headlineMarkup(value){
    const lines=String(value||'').split(/\r?\n/).slice(0,5);
    return lines.map((line,i)=>i===1?'<span>'+escapeHtml(line)+'</span>':escapeHtml(line)).join('<br>');
  }
  function safeImage(id,url,alt){
    const el=$('#'+id);if(!el)return;
    if(/^https:\/\//i.test(String(url||''))){el.src=url;el.alt=alt||el.alt||'';}
  }
  function applySeo(seo){
    if(!seo)return;
    if(seo.title){document.title=seo.title;const el=$('#seoTitle');if(el)el.textContent=seo.title;const og=$('#seoOgTitle');if(og)og.content=seo.title;}
    if(seo.description){const d=$('#seoDescription'),og=$('#seoOgDescription');if(d)d.content=seo.description;if(og)og.content=seo.description;}
    if(seo.ogImage){const im=$('#seoOgImage');if(im&&/^https:\/\//i.test(seo.ogImage))im.content=seo.ogImage;}
  }
  function renderGallery(urls){
    const section=$('#gallerySection'),host=$('#galleryGrid');
    const list=Array.isArray(urls)?urls.filter(x=>/^https:\/\//i.test(String(x||''))):[];
    if(!section||!host)return;
    section.hidden=!list.length;
    host.innerHTML=list.map((url,i)=>'<figure class="gallery-item"><img loading="lazy" src="'+escapeHtml(url)+'" alt="Galeri Uwais Food '+(i+1)+'"></figure>').join('');
  }
  function applyCmsContent(data){
    if(!data||typeof data!=='object')return;
    cmsContent=data;
    const home=data.home||{},promo=data.promo||{},profile=data.profile||{},contact=data.contact||{};
    cmsContact=contact;
    setText('announcementText',home.announcement);
    setText('announcementLocation','Uwais Food · '+(profile.location||config.location||'Tanjungpinang'));
    const h=$('#heroHeadline');if(h&&home.headline)h.innerHTML=headlineMarkup(home.headline);
    setText('heroDescription',home.description);
    safeImage('heroImage',home.heroImage,'Aneka pastry Uwais Food');
    setLink('heroPrimaryButton',home.primaryButton,home.primaryLink);
    setLink('heroSecondaryButton',home.secondaryButton,home.secondaryLink);
    const ph=$('#promoTitle');if(ph&&promo.title)ph.innerHTML=headlineMarkup(promo.title);
    setText('promoDescription',promo.description);
    safeImage('promoImage',promo.image,'Promo Uwais Food');
    setText('catalogNoteText',data.products&&data.products.note);
    const ah=$('#profileTitle');if(ah&&profile.title)ah.innerHTML=headlineMarkup(profile.title);
    setText('profileDescription',profile.description);
    setText('profileLocation',profile.location);
    const hours=$('#profileOpeningHours');if(hours){hours.hidden=!profile.openingHours;hours.textContent=profile.openingHours?'Jam operasional: '+profile.openingHours:'';}
    setText('profileQuote',profile.quote);
    setText('profileQuoteAuthor','— '+(profile.quoteAuthor||'Uwais Food'));
    if(contact.whatsapp){const wa=$('#whatsappLink');if(wa)wa.href='https://wa.me/'+whatsappNumber()+'?text='+encodeURIComponent(whatsappBaseMessage());}
    if(contact.instagram){const ig=$('#instagramLink');if(ig)ig.href=safePublicUrl(contact.instagram)||ig.href;}
    if(contact.maps){
      const maps=safePublicUrl(contact.maps);
      const location=$('#profileLocation');
      if(location&&maps){const a=document.createElement('a');a.href=maps;a.target='_blank';a.rel='noopener';a.textContent=profile.location||'Tanjungpinang, Kepulauan Riau';location.textContent='';location.appendChild(a);}
    }
    renderGallery(promo.gallery);
    applySeo(data.seo);
  }
  function loadPublicCatalogJsonp(url){
    return new Promise((resolve,reject)=>{
      const callbackName='__uwaisCatalog_'+Date.now()+'_'+Math.floor(Math.random()*100000);
      const script=document.createElement('script');
      const timeout=setTimeout(()=>{cleanup();reject(new Error('Waktu tunggu katalog habis'))},12000);
      function cleanup(){clearTimeout(timeout);delete window[callbackName];script.remove()}
      window[callbackName]=data=>{cleanup();resolve(data)};
      script.onerror=()=>{cleanup();reject(new Error('Endpoint katalog tidak dapat diakses'))};
      const separator=url.includes('?')?'&':'?';
      script.src=url+separator+'publicCatalog=1&callback='+encodeURIComponent(callbackName)+'&v='+Date.now();
      document.head.appendChild(script);
    });
  }
  async function loadLocalProducts(){
    try{
      const res=await fetch('data/products.json',{cache:'no-cache'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const data=await res.json(),list=Array.isArray(data)?data:data&&data.products;
      if(Array.isArray(list)){products=list;render()}
    }catch(e){console.warn('Katalog lokal gagal dimuat.',e)}
  }
  async function loadProducts(){
    await loadLocalProducts();
    if(!config.catalogUrl)return;
    try{
      const data=await loadPublicCatalogJsonp(config.catalogUrl);
      if(data&&data.success===false)throw new Error(data.error||'Endpoint katalog melaporkan error');
      if(data&&data.content)applyCmsContent(data.content);
      const list=Array.isArray(data)?data:data&&data.products;
      if(Array.isArray(list)){products=list;render()}
      else throw new Error('Format JSON katalog tidak sesuai');
    }catch(e){console.warn('Katalog CMS gagal dimuat; memakai katalog lokal.',e)}
  }

  filters?.addEventListener('click',e=>{
    const button=e.target.closest('[data-filter]');if(!button)return;
    activeFilter=button.dataset.filter;
    filters.querySelectorAll('.filter-chip').forEach(el=>el.classList.toggle('selected',el===button));
    render();
  });

  const themeButton=$('#themeToggle');
  const savedTheme=localStorage.getItem('uwais-theme');
  if(savedTheme==='dark')document.documentElement.dataset.theme='dark';
  themeButton?.addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme!=='dark';
    document.documentElement.dataset.theme=dark?'dark':'light';
    localStorage.setItem('uwais-theme',dark?'dark':'light');
    showToast(dark?'Tema gelap diaktifkan':'Tema terang diaktifkan');
  });
  const menuToggle=$('#menuToggle');
  menuToggle?.addEventListener('click',()=>{
    document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded',document.body.classList.contains('menu-open'));
  });
  document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu-open')));
  const ig=$('#instagramLink');if(ig&&config.instagramUrl)ig.href=config.instagramUrl;
  $('#year').textContent=new Date().getFullYear();
  function showToast(message){
    const toast=$('#toast');toast.textContent=message;toast.classList.add('show');
    clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200);
  }
  loadProducts();
})();