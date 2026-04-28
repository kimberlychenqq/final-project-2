'use strict';

// ── Product Data ─────────────────────────────────────────────────
// Each product object stores the name and price shown in the cart.
let products = [
  { name: 'Dreamy Decaf',   price: 15.00 },
  { name: 'Sunny Bean',     price: 18.50 },
  { name: 'Morning Blend',  price: 16.50 },
  { name: 'Dark Reserve',   price: 17.00 },
  { name: 'Corner Classic', price: 14.50 },
  { name: 'Cozy Corner',    price: 19.00 },
];

// ── Cart State ───────────────────────────────────────────────────
// cart uses product name as key so duplicate adds increment qty instead of creating a new entry.
let cart = {};

// ── Add to Cart ──────────────────────────────────────────────────
// Each Add button matches its index to the products array.
let addBtns = document.querySelectorAll('.add-btn');

addBtns.forEach(function (btn, index) {
  btn.addEventListener('click', function () {
    let product = products[index];
    // If the product is already in the cart, increase the quantity.
    if (cart[product.name]) {
      cart[product.name].qty += 1;
    } else {
      // Otherwise add it as a new entry with qty 1.
      cart[product.name] = { name: product.name, price: product.price, qty: 1 };
    }
    renderCart();
  });
});

// ── Render Cart ──────────────────────────────────────────────────
// Rebuilds the cart section HTML every time the cart state changes.
function renderCart() {
  let cartInner = document.querySelector('.cart-section-inner');
  let items = Object.values(cart);

  // Show empty state when cart has no items.
  if (items.length === 0) {
    cartInner.innerHTML = `
      <h2>Cart</h2>
      <div class="cart-empty">
        <img src="Img/Corner_Bean_Icon.png" alt="Corner Bean Icon" class="cart-empty-icon" />
        Your cart is empty, add some roasts above!
      </div>
    `;
    return;
  }

  // Build HTML string for each cart item.
  let itemsHTML = items.map(function (item) {
    return `
      <div class="cart-item">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">x${item.qty}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="remove-btn" data-name="${item.name}">Remove</button>
      </div>
    `;
  }).join('');

  // Calculate subtotal, tax (8%), shipping ($5 flat), and total.
  let subtotal = items.reduce(function (sum, item) {
    return sum + item.price * item.qty;
  }, 0);
  let tax      = subtotal * 0.08;
  let shipping = 5.00;
  let total    = subtotal + tax + shipping;

  cartInner.innerHTML = `
    <h2>Cart</h2>
    ${itemsHTML}
    <div class="cart-total">Subtotal: $${subtotal.toFixed(2)} USD</div>
    <div class="cart-total">Tax (8%): $${tax.toFixed(2)} USD</div>
    <div class="cart-total">Shipping: $${shipping.toFixed(2)} USD</div>
    <div class="cart-total cart-total-bold">Total: $${total.toFixed(2)} USD</div>
    <button class="checkout-btn">Checkout</button>
  `;

  // Re-attach remove button listeners after innerHTML is rebuilt.
  cartInner.querySelectorAll('.remove-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      delete cart[btn.dataset.name];
      renderCart();
    });
  });

  // Checkout: show order summary alert then clear the cart.
  cartInner.querySelector('.checkout-btn').addEventListener('click', function () {
    let itemLines = items.map(function (item) {
      return item.name + ' x' + item.qty + '  $' + (item.price * item.qty).toFixed(2);
    }).join('\n');
    alert('Order received! ☕ Thanks for shopping with Corner Bean!\n\nHere\'s what you ordered:\n' + itemLines + '\n\nTotal: $' + total.toFixed(2) + ' USD\n\nWe\'ll get your roasts ready, hope to see you soon! 🌱');
    cart = {};
    renderCart();
  });
}

// ── Subscribe Form ───────────────────────────────────────────────
let subscribeForm = document.getElementById('subscribe-form');

// showError: adds red border to input and inserts an error message below it.
function showError(input, message) {
  let field = input.closest('.form-field');
  input.classList.add('input-error');
  let existing = field.querySelector('.error-msg');
  if (!existing) {
    let msg = document.createElement('span');
    msg.classList.add('error-msg');
    msg.textContent = message;
    field.appendChild(msg);
  }
}

// clearError: removes red border and error message from a field.
function clearError(input) {
  let field = input.closest('.form-field');
  input.classList.remove('input-error', 'checkbox-error');
  let msg = field.querySelector('.error-msg');
  if (msg) msg.remove();
}

// Form submit: validate all required fields before allowing submission.
subscribeForm.addEventListener('submit', function (e) {
  e.preventDefault();

  let firstNameInput     = subscribeForm.querySelector('[name="firstName"]');
  let lastNameInput      = subscribeForm.querySelector('[name="lastName"]');
  let areaCodeInput      = subscribeForm.querySelector('[name="area-code"]');
  let firstThreeInput    = subscribeForm.querySelector('[name="first-three"]');
  let lastFourInput      = subscribeForm.querySelector('[name="last-four"]');
  let emailInput         = subscribeForm.querySelector('[name="email"]');
  let messageInput       = subscribeForm.querySelector('[name="message"]');
  let agreedInput        = subscribeForm.querySelector('[name="agreed"]');
  let contactMethodInput = subscribeForm.querySelector('[name="contactMethod"]:checked');

  let isValid = true;

  if (!firstNameInput.value.trim()) {
    showError(firstNameInput, 'Please enter a valid first name.');
    isValid = false;
  }
  if (!lastNameInput.value.trim()) {
    showError(lastNameInput, 'Please enter a valid last name.');
    isValid = false;
  }

  // A preferred contact method must be selected.
  if (!contactMethodInput) {
    let radioField = subscribeForm.querySelector('[name="contactMethod"]').closest('.form-field');
    let existing = radioField.querySelector('.error-msg');
    if (!existing) {
      let msg = document.createElement('span');
      msg.classList.add('error-msg');
      msg.textContent = 'Please select a preferred contact method.';
      radioField.appendChild(msg);
    }
    isValid = false;
  } else {
    // Only require email if email radio is selected.
    if (contactMethodInput.value === 'email' && !emailInput.value.trim()) {
      showError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    }
    // Only require phone if phone radio is selected.
    if (contactMethodInput.value === 'phone') {
      let phoneField = document.getElementById('phone-field');
      let phoneFull  = areaCodeInput.value.length === 3 &&
                       firstThreeInput.value.length === 3 &&
                       lastFourInput.value.length === 4;
      if (!phoneFull) {
        let existing = phoneField.querySelector('.error-msg');
        if (!existing) {
          let msg = document.createElement('span');
          msg.classList.add('error-msg');
          msg.textContent = 'Please enter a valid 10-digit phone number.';
          phoneField.appendChild(msg);
        }
        isValid = false;
      }
    }
  }

  // Checkbox must be checked to confirm agreement before submitting.
  if (!agreedInput.checked) {
    agreedInput.classList.add('checkbox-error');
    let field = agreedInput.closest('.form-field');
    let existing = field.querySelector('.error-msg');
    if (!existing) {
      let msg = document.createElement('span');
      msg.classList.add('error-msg');
      msg.textContent = 'You must agree to the terms and conditions before submit.';
      field.appendChild(msg);
    }
    isValid = false;
  }

  // Message is always required.
  if (!messageInput.value.trim()) {
    showError(messageInput, 'Please enter a message.');
    isValid = false;
  }

  if (!isValid) return;

  // Store submitted form data in an object and display it to the user.
  let formData = {
    firstName:     firstNameInput.value.trim(),
    lastName:      lastNameInput.value.trim(),
    contactMethod: contactMethodInput.value,
    email:         emailInput.value.trim(),
    phone:         areaCodeInput.value + '-' + firstThreeInput.value + '-' + lastFourInput.value,
    message:       messageInput.value.trim(),
  };

  alert(
    'Hi ' + formData.firstName + '! 🎉 You\'re officially subscribed to Corner Bean!\n\n' +
    'Here\'s what we got from you:\n' +
    '👤 ' + formData.firstName + ' ' + formData.lastName + '\n' +
    '📬 We\'ll reach out via ' + formData.contactMethod + ': ' +
    (formData.contactMethod === 'email' ? formData.email : formData.phone) + '\n' +
    '💬 "' + formData.message + '"\n\n' +
    'Stay tuned for the latest from Corner Bean ☕'
  );

  // Clear the form after successful submission.
  subscribeForm.reset();
});

// Clear error styling as soon as the user starts correcting a field.
subscribeForm.querySelectorAll('[name="firstName"], [name="lastName"], [name="phone"], [name="email"], [name="message"]').forEach(function (input) {
  input.addEventListener('input', function () { clearError(input); });
});

// Clear radio error message when a contact method is selected.
subscribeForm.querySelectorAll('[name="contactMethod"]').forEach(function (radio) {
  radio.addEventListener('change', function () {
    let radioField = subscribeForm.querySelector('[name="contactMethod"]').closest('.form-field');
    let msg = radioField.querySelector('.error-msg');
    if (msg) msg.remove();
    // Also clear the email/phone error that may no longer apply.
    clearError(subscribeForm.querySelector('[name="email"]'));
    clearError(subscribeForm.querySelector('[name="phone"]'));
  });
});

subscribeForm.querySelector('[name="agreed"]').addEventListener('change', function () {
  clearError(this);
});

// ── Phone Auto-focus ─────────────────────────────────────────────
// Strip non-numeric input and auto-advance focus when each segment is full.
let phoneInputs = subscribeForm.querySelectorAll('.phone-input');

phoneInputs.forEach(function (currentInput) {
  currentInput.addEventListener('input', function () {
    // Only allow numbers.
    currentInput.value = currentInput.value.replace(/[^0-9]/g, '');

    // Move focus to the next input when the current one is full.
    if (currentInput.value.length === currentInput.maxLength) {
      if (currentInput === phoneInputs[0]) {
        phoneInputs[1].focus();
      }
      if (currentInput === phoneInputs[1]) {
        phoneInputs[2].focus();
      }
      if (currentInput === phoneInputs[2]) {
        phoneInputs[2].blur();
      }
    }
  });
});
