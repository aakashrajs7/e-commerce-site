// ---- Sample Data ----
const sampleProducts = [
    {id:1,title:'Wireless Headphones',price:1299,desc:'Comfortable over-ear with long battery',img:'',tags:['electronics']},
    {id:2,title:'Running Shoes',price:2399,desc:'Lightweight sports shoes',img:'',tags:['fashion']},
    {id:3,title:'Coffee Maker',price:3499,desc:'Brew café-style coffee at home',img:'',tags:['home']},
    {id:4,title:'Smart Watch',price:5999,desc:'Fitness tracking and notifications',img:'',tags:['electronics']}
];

// ---- Simple Storage helpers ----
const db = {
    get(k){try{return JSON.parse(localStorage.getItem(k))||null}catch(e){return null}},
    set(k,v){localStorage.setItem(k,JSON.stringify(v))},
    clear(){localStorage.clear()}
}

// init defaults
if(!db.get('products')) db.set('products',sampleProducts);
if(!db.get('users')) db.set('users',[]);
if(!db.get('wishlist')) db.set('wishlist',[]);
if(!db.get('orders')) db.set('orders',[]);
if(!db.get('reviews')) db.set('reviews',[]);
if(!db.get('care')) db.set('care',[]);
if(!db.get('reports')) db.set('reports',[]);

// ---- Navigation ----
function showView(id){
    document.querySelectorAll('.view').forEach(v=>v.style.display='none');
    const el=document.getElementById(id);
    if(el) el.style.display='block';
    document.querySelectorAll('#menu a').forEach(a=>a.classList.remove('active'));
    const menuItem=document.querySelector('#menu a[data-route="'+id+'"]');
    if(menuItem) menuItem.classList.add('active');
}

function navigate(route){
    showView(route);
    location.hash = route;
    if(route==='products') renderProducts();
    if(route==='home') renderFeatured();
    if(route==='orders') renderOrders();
    if(route==='wishlist') renderWishlist();
    if(route==='customerCare') renderCare();
    if(route==='account') renderAccount();
    if(route==='report') renderReports();
}

window.addEventListener('hashchange',()=>{
    const r=location.hash.replace('#','')||'home';
    showView(r);
});

// default route
navigate(location.hash.replace('#','')||'home');

// ---- Products rendering ----
function cardHTML(p){
    return `<div class="product"><strong>${p.title}</strong><div class="small">₹${p.price}</div><div class="small">${p.desc}</div><div style="margin-top:8px"><button onclick=addToWishlist(${p.id})>Add to wishlist</button> <button onclick=placeOrder(${p.id}) style="background:#28a745">Buy</button> <button onclick=viewProduct(${p.id}) style="background:#6f42c1">Details</button></div></div>`
}

function renderProducts(){
    const list = db.get('products')||[];
    document.getElementById('productsList').innerHTML = list.map(cardHTML).join('');
}

function renderFeatured(){
    const list = (db.get('products')||[]).slice(0,3);
    document.getElementById('featured').innerHTML = list.map(cardHTML).join('');
}

// ---- Wishlist / Orders ----
function addToWishlist(id){
    const all = db.get('wishlist')||[];
    if(!all.find(x=>x.id===id)){
    const p=(db.get('products')||[]).find(x=>x.id===id);
    all.push({id:p.id,title:p.title,price:p.price,date:new Date().toISOString()});
    db.set('wishlist',all);
    alert('Added to wishlist');
    renderWishlist();
    } else alert('Already in wishlist');
}

function renderWishlist(){
    const list = db.get('wishlist')||[];
    const el = document.getElementById('wishlistList');
    el.innerHTML = list.length ? list.map(i=>`<li>${i.title} — ₹${i.price} <button onclick="removeWishlist(${i.id})">Remove</button></li>`).join('') : '<li class="small">No items in wishlist</li>';
}

function removeWishlist(id){
    let list = db.get('wishlist')||[];
    list = list.filter(i=>i.id!==id);
    db.set('wishlist',list);renderWishlist();
}

function placeOrder(id){
    const orders = db.get('orders')||[];
    const p=(db.get('products')||[]).find(x=>x.id===id);
    orders.push({id:Date.now(),productId:p.id,title:p.title,price:p.price,date:new Date().toISOString(),status:'Processing'});
    db.set('orders',orders);
    alert('Order placed!');
    renderOrders();
}

function renderOrders(){
    const list = db.get('orders')||[];
    const el = document.getElementById('ordersList');
    el.innerHTML = list.length ? list.map(o=>`<li>${o.title} — ₹${o.price} <div class="small">Ordered: ${new Date(o.date).toLocaleString()} • Status: ${o.status}</div></li>`).join('') : '<li class="small">No orders yet</li>';
}

// ---- Product details + reviews ----
function viewProduct(id){
    const p=(db.get('products')||[]).find(x=>x.id===id);
    document.getElementById('pdTitle').innerText = p.title;
    document.getElementById('pdDesc').innerText = p.desc + ' • Price: ₹'+p.price;
    document.getElementById('pdBuy').onclick = ()=>placeOrder(p.id);
    document.getElementById('pdWishlist').onclick = ()=>addToWishlist(p.id);
    // render reviews
    const reviews = (db.get('reviews')||[]).filter(r=>r.productId===p.id);
    document.getElementById('reviewsList').innerHTML = reviews.length ? reviews.map(r=>`<li><strong>${r.name}</strong> (${r.rating})<div class="small">${r.text}</div></li>`).join('') : '<li class="small">No reviews yet</li>';
    // attach review submit
    const rf = document.getElementById('reviewForm');
    rf.onsubmit = (e)=>{
    e.preventDefault();
    const name=document.getElementById('rname').value.trim();
    const rating=document.getElementById('rrating').value;
    const text=document.getElementById('rtext').value.trim();
    const arr = db.get('reviews')||[];
    arr.push({productId:p.id,name,rating,text,date:new Date().toISOString()});
    db.set('reviews',arr);
    document.getElementById('rname').value='';document.getElementById('rtext').value='';
    viewProduct(p.id);
    renderLatestReviews();
    }

    showView('productDetail');
}

function renderLatestReviews(){
    const all = (db.get('reviews')||[]).slice(-5).reverse();
    document.getElementById('latestReviews').innerHTML = all.length ? all.map(r=>`<li><strong>${r.name}</strong> reviewed <em>${(db.get('products')||[]).find(p=>p.id===r.productId).title}</em>: <span class="small">${r.text}</span></li>`).join('') : '<li class="small">No reviews yet</li>';
}

// ---- Customer care ----
function renderCare(){
    const all = db.get('care')||[];
    document.getElementById('careList').innerHTML = all.length ? all.map(c=>`<li><strong>${c.name}</strong> (${c.topic}) — ${c.message} <div class="small">${new Date(c.date).toLocaleString()}</div></li>`).join('') : '<li class="small">No tickets</li>';
}

document.getElementById('careForm').onsubmit = function(e){
    e.preventDefault();
    const name=document.getElementById('careName').value.trim();
    const email=document.getElementById('careEmail').value.trim();
    const topic=document.getElementById('careTopic').value;
    const message=document.getElementById('careMsg').value.trim();
    const all = db.get('care')||[];
    all.push({name,email,topic,message,date:new Date().toISOString()});
    db.set('care',all);
    alert('Ticket submitted');
    document.getElementById('careForm').reset();
    renderCare();
}

// ---- Reporting ----
function renderReports(){
    const all = db.get('reports')||[];
    document.getElementById('reportList').innerHTML = all.length ? all.map(r=>`<li><strong>${r.type}</strong> — ${r.desc} <div class="small">${new Date(r.date).toLocaleString()}</div></li>`).join('') : '<li class="small">No reports</li>';
}

document.getElementById('reportForm').onsubmit = function(e){
    e.preventDefault();
    const type=document.getElementById('rType').value; const desc=document.getElementById('rDesc').value.trim();
    const all = db.get('reports')||[]; all.push({type,desc,date:new Date().toISOString()}); db.set('reports',all);
    alert('Report submitted'); document.getElementById('reportForm').reset(); renderReports();
}

// ---- Contact form ----
document.getElementById('contactForm').onsubmit = e=>{e.preventDefault();alert('Message sent — we will contact you soon');document.getElementById('contactForm').reset()}

// ---- Auth: registration + login validation ----
function validatePhone(p){return /^\d{10}$/.test(p)}
function validatePassword(p){return p.length>=6}

document.getElementById('formRegister').onsubmit = function(e){
    e.preventDefault();
    const name=document.getElementById('regName').value.trim();
    const phone=document.getElementById('regPhone').value.trim();
    const email=document.getElementById('regEmail').value.trim().toLowerCase();
    const pass=document.getElementById('regPass').value;
    const pass2=document.getElementById('regPass2').value;
    const users = db.get('users')||[];
    const msgEl=document.getElementById('regMsg'); msgEl.innerText='';
    if(!name||!email||!pass){msgEl.innerText='Please fill required fields'; return}
    if(!validatePhone(phone)){msgEl.innerText='Phone must be exactly 10 digits'; return}
    if(!validatePassword(pass)){msgEl.innerText='Password must be at least 6 characters'; return}
    if(pass!==pass2){msgEl.innerText='Passwords do not match'; return}
    if(users.find(u=>u.email===email)){msgEl.innerText='Email already registered'; return}
    users.push({id:Date.now(),name,phone,email,pass});
    db.set('users',users);
    msgEl.innerText='Registered successfully — you can now login';
    document.getElementById('formRegister').reset();
}

document.getElementById('formLogin').onsubmit = function(e){
    e.preventDefault();
    const email=document.getElementById('loginEmail').value.trim().toLowerCase();
    const password=document.getElementById('loginPassword').value;
    const users = db.get('users')||[];
    const u = users.find(x=>x.email===email && x.pass===password);
    const msgEl=document.getElementById('loginMsg'); msgEl.innerText='';
    if(!u){msgEl.innerText='Invalid email or password'; return}
    sessionStorage.setItem('auth', JSON.stringify({id:u.id,email:u.email,name:u.name}));
    msgEl.innerText='Login successful'; renderAccount();
}

function renderAccount(){
    const auth = JSON.parse(sessionStorage.getItem('auth')||null);
    const el = document.getElementById('accountInfo');
    if(auth){
    el.innerHTML = `<div><strong>${auth.name}</strong> — ${auth.email} <div class="small">Session active</div></div>`;
    } else el.innerText = 'Not logged in';
}

function logout(){sessionStorage.removeItem('auth');renderAccount();alert('Logged out')}

// quick helpers
document.getElementById('tab-login').onclick = ()=>{document.getElementById('loginForm').style.display='block';document.getElementById('registerForm').style.display='none'}
document.getElementById('tab-register').onclick = ()=>{document.getElementById('loginForm').style.display='none';document.getElementById('registerForm').style.display='block'}
function fillTestUser(){document.getElementById('regName').value='Test User';document.getElementById('regPhone').value='9876543210';document.getElementById('regEmail').value='test@example.com';document.getElementById('regPass').value='password';document.getElementById('regPass2').value='password'}

// init renders
renderProducts(); renderFeatured(); renderLatestReviews(); renderOrders(); renderWishlist(); renderReports(); renderCare(); renderAccount();