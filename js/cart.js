// =======================
// DỮ LIỆU SẢN PHẨM
// =======================
const PRODUCTS = [
  {id:1,name:'iPhone 14 Pro',brand:'Apple',price:25000000,img:'images/phone1.jpg',desc:'Màn 6.1", A16 Bionic, 128GB'},
  {id:2,name:'Samsung Galaxy S23',brand:'Samsung',price:20000000,img:'images/phone2.jpg',desc:'Màn 6.2", Snapdragon, 128GB'},
  {id:3,name:'Xiaomi 13',brand:'Xiaomi',price:15000000,img:'images/phone3.jpg',desc:'Màn 6.36", Snapdragon 8, 256GB'},
  {id:4,name:'OPPO Reno9',brand:'OPPO',price:9000000,img:'images/phone4.jpg',desc:'Màn 6.4", Helio, 128GB'}
];

// =======================
// FLASH SALE PRODUCTS
// =======================
const FLASH_SALE_PRODUCTS = [
  {id:101,name:'Samsung Galaxy S24 Ultra',price:29000000,discount:30,img:'https://cdn2.cellphones.com.vn/ss-s24-ultra-xam.png'},
  {id:102,name:'iPhone 17 Pro Max',price:35000000,discount:25,img:'https://cdn.hoanghamobile.com/i/productlist/ds/Uploads/2023/09/13/iphone-15-pro-max.png'},
  {id:103,name:'Xiaomi 14 Pro',price:18000000,discount:20,img:'https://cdn2.cellphones.com.vn/xiaomi-14.png'}
];

const CART_KEY = 'techstore_cart_v1';

// =======================
// CART HELPERS
// =======================
function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateNavCartCount();
}

function updateNavCartCount(){
  const cart = getCart();
  const qty = cart.reduce((s,it)=>s+it.qty,0);
  $('#navCartCount, #navCartCount2, #navCartCount3').text(qty);
}

// =======================
// PRODUCTS PAGE
// =======================
function renderProducts(){
  const row = $('#productRow');
  if(!row.length) return;
  row.empty();

  const q = $('#searchInput').val()?$('#searchInput').val().toLowerCase():'';
  const brandFilter = $('#filterBrand').val() || '';

  const list = PRODUCTS.filter(p=>{
    if(brandFilter && p.brand !== brandFilter) return false;
    if(q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    return true;
  });

  if(list.length===0){
    row.append('<div class="col-12">Không tìm thấy sản phẩm.</div>');
    return;
  }

  list.forEach(p=>{
    const card = `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="card product-card h-100 shadow-sm">
        <img src="${p.img}" onerror="this.src='https://via.placeholder.com/400x300'" class="card-img-top" style="height:180px;object-fit:cover">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${p.name}</h6>
          <p class="mb-1 small text-muted">${p.brand}</p>
          <p class="price mb-3 text-danger fw-bold">${p.price.toLocaleString()} VND</p>
          <div class="mt-auto">
            <button class="btn btn-outline-primary btn-sm btn-detail" data-id="${p.id}">Xem chi tiết</button>
            <button class="btn btn-success btn-sm ms-2 btn-add" data-id="${p.id}">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>`;
    row.append(card);
  });
}

// =======================
// FILTER BRAND
// =======================
function populateBrands(){
  const sel = $('#filterBrand');
  if(!sel.length) return;
  const brands = [...new Set(PRODUCTS.map(p=>p.brand))];
  brands.forEach(b=> sel.append(`<option value="${b}">${b}</option>`));
}

// =======================
// ADD TO CART
// =======================
function addToCart(productId, qty=1){
  const cart = getCart();
  let prod = PRODUCTS.find(p=>p.id==productId);

  // Kiểm tra flash sale
  if(!prod){
    prod = FLASH_SALE_PRODUCTS.find(f=>f.id==productId);
    if(prod){
      prod = {...prod}; // clone object để không thay đổi gốc
      prod.price = Math.round(prod.price * (1 - prod.discount/100));
    }
  }

  if(!prod) return;

  const existing = cart.find(it=>it.id==productId);
  if(existing){
    existing.qty += qty;
  }else{
    cart.push({id:prod.id,name:prod.name,price:prod.price,img:prod.img,qty:qty});
  }
  saveCart(cart);
  alert('✅ Đã thêm vào giỏ hàng');
}

// =======================
// MODAL SẢN PHẨM
// =======================
function showProductModal(id){
  const p = PRODUCTS.find(x=>x.id==id);
  if(!p) return;

  $('#modalTitle').text(p.name);
  $('#modalImage').attr('src', p.img);
  $('#modalDesc').text(p.desc);
  $('#modalPrice').text(p.price.toLocaleString() + ' VND');
  $('#addToCartModal').data('id', p.id);

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

// =======================
// CART PAGE
// =======================
function renderCartPage(){
  const area = $('#cartArea');
  if(!area.length) return;

  const cart = getCart();
  if(cart.length===0){
    area.html('<p class="alert alert-warning">Giỏ hàng trống.</p>');
    $('#cartTotal').text('0');
    return;
  }

  let html = '<table class="table align-middle"><thead><tr><th>SP</th><th>Giá</th><th>SL</th><th>Tổng</th><th></th></tr></thead><tbody>';
  cart.forEach(it=>{
    html += `
      <tr data-id="${it.id}">
        <td><img src="${it.img}" style="width:60px"> ${it.name}</td>
        <td>${it.price.toLocaleString()}</td>
        <td><input type="number" value="${it.qty}" min="1" class="form-control qty-input" style="width:80px"></td>
        <td class="row-total">${(it.price*it.qty).toLocaleString()}</td>
        <td><button class="btn btn-danger btn-sm btn-remove">Xóa</button></td>
      </tr>
    `;
  });
  html += '</tbody></table>';
  area.html(html);
  updateCartTotalDisplay();
}

function updateCartTotalDisplay(){
  const cart = getCart();
  const total = cart.reduce((s,it)=>s + it.price * it.qty, 0);
  $('#cartTotal').text(total.toLocaleString());
}

// =======================
// FLASH SALE GIẢM GIÁ
// =======================
$(document).on('click','.add-to-cart-sale',function(){
    const productId = $(this).data('id');
    addToCart(productId, 1);
    const flashProduct = FLASH_SALE_PRODUCTS.find(f=>f.id==productId);
    if(flashProduct){
        const discountedPrice = Math.round(flashProduct.price * (1 - flashProduct.discount/100));
        alert(`🔥 Flash Sale: ${flashProduct.name}\nGiảm ${flashProduct.discount}%\nGiá còn: ${discountedPrice.toLocaleString()}đ`);
    }
});

// =======================
// BLOG MODAL
// =======================
$(document).on('click','.view-blog',function(){
  const card = $(this).closest('.blog-card');
  alert(card.data('content'));
});

// =======================
// EVENTS
// =======================
$(function(){
  updateNavCartCount();
  populateBrands();
  renderProducts();
  renderCartPage();

  $('#searchInput').on('input', renderProducts);
  $('#filterBrand').on('change', renderProducts);

  $(document).on('click','.btn-add',function(){
    addToCart($(this).data('id'));
  });

  $(document).on('click','.btn-detail',function(){
    showProductModal($(this).data('id'));
  });

  $('#addToCartModal').click(function(){
    addToCart($(this).data('id'), parseInt($('#modalQty').val())||1);
  });

  $(document).on('change','.qty-input',function(){
    const row = $(this).closest('tr');
    const id = row.data('id');
    const cart = getCart();
    const it = cart.find(x=>x.id==id);
    it.qty = parseInt($(this).val())||1;
    saveCart(cart);
    renderCartPage();
  });

  $(document).on('click','.btn-remove',function(){
    let cart = getCart().filter(x=>x.id != $(this).closest('tr').data('id'));
    saveCart(cart);
    renderCartPage();
  });

  $('#checkoutBtn').click(function(){
    localStorage.removeItem(CART_KEY);
    renderCartPage();
    updateNavCartCount();
    alert('✅ Thanh toán giả lập thành công!');
  });
});
