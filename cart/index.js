import {
  loadCartFromLocalStorage,
  loadUserLoggedFromLocalStorage,
  saveCartToLocalStorage,
  saveUserLoggedToLocalStorage
} from '../function/localstorage.js';
import { sumMoneyOfCart, sumQuantityInCart } from '../function/cart-and-collection.js';
import { renderTheCorner } from '../reuse/script-reuse.js';

// Render khi giỏ hàng rỗng
function renderWhenCartIsEmpty() {
  const parent = document.getElementById('product-in-the-cart');
  const elements = `
        <div id="empty-cart">
            <img src="./assets/shopping-cart.png" alt="">
            <div>
                <a href="../cong-thuc/index.html">Đến trang công thức</a>
            </div>
        </div>
        `;
  parent.innerHTML = elements;
}

// Render một sản phẩm trong giỏ hàng
function renderProductInCart(product) {
  const formatPrice = product.price.toLocaleString('en-US');
  const moneyPerRow = (product.price * product.quantity).toLocaleString('en-US');

  return `
    <tr id="${product.id}">
        <td class="product">
            <div class="product-thumbnail">
                <img src="${product.image}" alt="">
            </div>
            <div class="product-details">
                <h3 class="product-details__name">${product.name}</h3>
            </div>
        </td>
        <td class="price">
            <p>${formatPrice} đ</p>
            <p>${product.unit}</p>
        </td>
        <td class="quantity">
            <div class="quantity-box">
                <button class="minus"><i class="fa-sharp fa-solid fa-minus"></i></button>
                <input type="text" id="quantity-input-${product.id}" value="${product.quantity}"></input>
                <button class="plus"><i class="fa-sharp fa-solid fa-plus"></i></button>
            </div>
        </td>
        <td>${moneyPerRow} đ</td>
        <td class="delete-btn"><button><i class="fa-solid fa-trash-can fa-lg"></i></button></td>
    </tr>
    `;
}

// Render danh sách sản phẩm trong giỏ hàng
function renderAllCart() {
  const parent = document.getElementById('product-in-the-cart');
  const cart = loadCartFromLocalStorage();
  let cartHTML = '';

  if (cart.length > 0) {
    for (const product of cart.reverse()) {
      const item = renderProductInCart(product);
      cartHTML += item;
    }
    parent.innerHTML = cartHTML;
    makeBtns();
  } else {
    renderWhenCartIsEmpty();
  }
}

// Render Bill Cart
function renderBillCart() {
  const sumType = document.getElementById('sumTypeInCart');
  sumType.innerHTML = loadCartFromLocalStorage().length;

  const sumQuantity = document.getElementById('sumQuantityInCart');
  sumQuantity.innerHTML = sumQuantityInCart();

  const sumMoney = document.getElementById('sumMoneyOfCart');
  sumMoney.innerHTML = `${sumMoneyOfCart().toLocaleString('en-US')} đ`;

  const saleOff = document.getElementById('saleOff');
  saleOff.innerHTML = 0 + ' đ';

  const totalPayment = document.getElementById('totalPayment');
  totalPayment.innerHTML = `${(sumMoneyOfCart() - 0).toLocaleString('en-US')} đ`;
}

// Nút tăng giảm số lượng sản phẩm trong giỏ hàng
function changeQuantityByButton(productId, n) {
  const cart = loadCartFromLocalStorage();
  const i = cart.findIndex(item => item.id === productId);

  if (!(cart[i].quantity === 1 && n === -1)) {
    cart[i].quantity += n;
  }

  const quantityElement = document.getElementById(`${productId}`).querySelector('input[type="text"]');
  quantityElement.value = cart[i].quantity;

  const moneyPerRowElement = document.querySelector(`#${productId} td:nth-child(4)`);
  const moneyPerRow = (cart[i].quantity * cart[i].price).toLocaleString('en-US');
  moneyPerRowElement.innerHTML = `${moneyPerRow} đ`;

  saveCartToLocalStorage(cart);

  renderBillCart();
}

// Ô nhập số lượng
function addEventForInput(inputQuantityElements) {
  inputQuantityElements.forEach(inputElement => {
    inputElement.addEventListener('input', event => {
      if (typeof parseInt(inputElement.value) === 'number' && inputElement.value > 0) {
        const cart = loadCartFromLocalStorage();
        const productId = event.target.id;
        const i = cart.findIndex(product => `quantity-input-${product.id}` === productId);
        cart[i].quantity = parseInt(inputElement.value);

        const moneyPerRowElement = document.querySelector(`#${cart[i].id} td:nth-child(4)`);
        const moneyPerRow = (cart[i].quantity * cart[i].price).toLocaleString('en-US');
        moneyPerRowElement.innerHTML = `${moneyPerRow} đ`;

        saveCartToLocalStorage(cart);

        renderBillCart();
      }
    });
  });
}

// Nút xóa sản phẩm khỏi giỏ hàng
function deleteProduct(productId) {
  const cart = loadCartFromLocalStorage();
  const i = cart.findIndex(item => item.id === productId);

  cart.splice(i, 1);

  saveCartToLocalStorage(cart);

  if (cart.length === 0) {
    renderWhenCartIsEmpty();
  } else {
    const productRow = document.getElementById(productId);
    const productTBody = productRow.parentNode;
    productTBody.removeChild(productRow);
  }

  renderBillCart();
  renderTheCorner();
}

// Nút xóa tất cả sản phẩm khỏi giỏ hàng
function deleteAllCart() {
  // const producTable = document.querySelector('.cart-space table');
  // const producTBody = document.querySelector('.cart-space table tbody');
  // producTable.removeChild(producTBody);

  saveCartToLocalStorage([]);
  renderWhenCartIsEmpty();
  renderBillCart();
  renderTheCorner();
}

// Gán nút cộng, trừ, xóa
function makeBtns() {
  const minusBtns = Array.from(document.getElementsByClassName('minus'));
  minusBtns.forEach(btn => {
    const productId = btn.parentNode.parentNode.parentNode.id;
    btn.addEventListener('click', () => {
      changeQuantityByButton(productId, -1);
    });
  });

  const plusBtns = Array.from(document.getElementsByClassName('plus'));
  plusBtns.forEach(btn => {
    const productId = btn.parentNode.parentNode.parentNode.id;
    btn.addEventListener('click', () => {
      changeQuantityByButton(productId, 1);
    });
  });

  const deleteBtns = Array.from(document.querySelectorAll('.delete-btn button'));
  deleteBtns.forEach(btn => {
    const productId = btn.parentNode.parentNode.id;
    btn.addEventListener('click', () => {
      deleteProduct(productId);
    });
  });
}

window.addEventListener('load', () => {
  renderAllCart();

  const inputQuantityElements = document.querySelectorAll('tr input[type="text"]');
  addEventForInput(inputQuantityElements);

  renderBillCart();

  const shipInfo = loadUserLoggedFromLocalStorage().shipInfo;
  if (shipInfo) {
    renderShipInfoBox(shipInfo);
  }
});

const deleteAllCartBtn = document.getElementById('delete-all-cart');
deleteAllCartBtn.addEventListener('click', deleteAllCart);

// Mở form thông tin nhận hàng

function makeOpenFormBtn() {
  const openFormBtn = document.getElementById('open-form-btn');
  openFormBtn.addEventListener('click', () => {
    const formWrap = document.querySelector('.form-to-ship__wrap');
    formWrap.style.display = 'block';
    formWrap.scrollIntoView({ behavior: 'smooth' });
  });
}
makeOpenFormBtn();

// Gán nút hủy form
function makeCancelFormBtn() {
  const cancelFormBtn = document.getElementById('form-cancel-btn');
  cancelFormBtn.addEventListener('click', () => {
    const formWrap = document.querySelector('.form-to-ship__wrap');
    formWrap.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
makeCancelFormBtn();

function makeSubmitFormBtn() {
  const submitFormBtn = document.getElementById('form-submit-btn');
  submitFormBtn.addEventListener('click', event => {
    event.preventDefault();
    const name = document.getElementById('form__name').value;
    const phone = document.getElementById('form__phone').value;
    const city = document.getElementById('form__city').value;
    const district = document.getElementById('form__district').value;
    const ward = document.getElementById('form__ward').value;
    const address = document.getElementById('form__address').value;
    const addressType = () => {
      const addressTypeInputs = Array.from(document.querySelectorAll('#form-to-ship .address-type input'));
      const selectedInput = addressTypeInputs.find(input => input.checked);
      if (selectedInput) {
        const selectedInputValue = selectedInput.getAttribute('value');
        if (selectedInputValue === 'home') {
          return 'Nhà';
        }
        if (selectedInputValue === 'company') {
          return 'Cơ quan';
        }
      } else {
        return 'Địa chỉ';
      }
    };

    const shipInfo = {
      name: name,
      phone: phone,
      city: city,
      district: district,
      ward: ward,
      address: address,
      addressType: addressType()
    };
    renderShipInfoBox(shipInfo);

    // Lưu vào localStorage
    let userLogged = loadUserLoggedFromLocalStorage();
    userLogged = { ...userLogged, shipInfo: shipInfo };
    saveUserLoggedToLocalStorage(userLogged);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function renderShipInfoBox(shipInfo) {
  const parent = document.querySelector('.order-space #ship .ship-body');
  const elements = `
        <div class="name-and-phone">
            <p>${shipInfo.name}</p>
            <span>|</span>
            <p>${shipInfo.phone}</p>
        </div>
        <div class="address">
            <p>
                <span>${shipInfo.addressType}</span>
                ${shipInfo.address},
            </p>
            <p>${shipInfo.ward}, ${shipInfo.district}, ${shipInfo.city}</p>
        </div>
    `;
  parent.innerHTML = elements;
}

makeSubmitFormBtn();

function makeOrderBtn() {
  const orderBtn = document.getElementById('order-btn');
  orderBtn.addEventListener('click', () => {
    const card = loadCartFromLocalStorage();
    const shipInfo = loadUserLoggedFromLocalStorage().shipInfo;

    if (card && shipInfo) {
      const parent = document.querySelector('.site-body .cart-space');
      const elements = `
            <div id="order-success">
                <i class="fa-solid fa-circle-check fa-2xl"></i>
                <h2>Cảm ơn bạn! </br>
                Đặt hàng thành công
                </h2>
            </div>
            `;
      parent.innerHTML = elements;
    }
  });
}
makeOrderBtn();
