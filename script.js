(function () {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref) {
    document.cookie =
      `sour_ref=${encodeURIComponent(ref)}; ` +
      `path=/; ` +
      `max-age=${60 * 60 * 24 * 30}; ` +
      `SameSite=Lax`;
    console.log("Referral saved:", ref);
  }
})();

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
}

const STRIPE_PRICE_MAP = {
  "Pink Mix|800g": "price_1SqSvRPYgud7fn0GaeDp2c7O",

  "Love Mix|800g": "price_1SsQyGPYgud7fn0Gx80IV0pR",

  "Vegan Mix|400g": "price_1SqSv9PYgud7fn0G64yfkQPw",
  "Vegan Mix|800g": "price_1SqSuwPYgud7fn0GMThsWjDR",

  "Gluten Free Sweets|400g": "price_1SqSujPYgud7fn0GxGj3Bn70",
  "Gluten Free Sweets|800g": "price_1SqSuQPYgud7fn0Gqa1j3dNB",

  "Fizzy Mix|400g": "price_1SqSu6PYgud7fn0GOkMKEkIu",
  "Fizzy Mix|800g": "price_1SqStmPYgud7fn0Gi1xaAQxI",

  "Non Fizzy Mix|400g": "price_1SqGqlPYgud7fn0GM2myUlnl",
  "Non Fizzy Mix|800g": "price_1SqGqTPYgud7fn0GswtP9D2x",

  "Mixed Bags|400g": "price_1SqGq4PYgud7fn0GtKTCAacE",
  "Mixed Bags|800g": "price_1SqGpnPYgud7fn0GThTDgHlh",

  "Lollipops 10pk|Cherry": "price_1SqZ6ZPYgud7fn0GR76L2AXH",
  "Lollipops 10pk|Blue Cherry": "price_1SqZ76PYgud7fn0GnWyyg8b0",
  "Lollipops 10pk|Red Cherry": "price_1SqZ7VPYgud7fn0Ga2WO8cXx",
  "Lollipops 10pk|Green Cherry": "price_1SqZ9bPYgud7fn0GT0m5arbp",

  "Lollipops 25pk|Sour Cola & Lemon": "price_1SqZA8PYgud7fn0GBcn5NZKJ",
  "Lollipops 25pk|Watermelon": "price_1SqZAlPYgud7fn0GvKekrx6G",
  "Lollipops 25pk|Strawberry": "price_1SqZB9PYgud7fn0Gck0r1WJX",
  "Lollipops 25pk|Super Sour": "price_1SqZBcPYgud7fn0GCJD07KLT",

  "Chocolate Mix|750g": "price_1SrCUbPYgud7fn0GzdaMP30h"
};

const adminIPs = ['86.148.221.133','31.94.56.26'];

async function checkAdmin() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log('Your IP:', data.ip);
        if (adminIPs.includes(data.ip)) {
            document.getElementById('admin-icon').style.display = 'flex';
        } else {
            console.log('IP not in admin list:', adminIPs);
        }
    } catch (error) {
        console.error('Failed to fetch IP:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const basketBtn = document.getElementById('basket-btn');
    const basketModal = document.getElementById('basket-modal');
    const productModal = document.getElementById('product-modal');
    const adminModal = document.getElementById('admin-modal');
    const basketCloseBtn = document.querySelector('.close');
    const productCloseBtn = document.querySelector('.product-close');
    const adminCloseBtn = document.querySelector('.admin-close');
    const basketItems = document.getElementById('basket-items');
    const productDetails = document.getElementById('product-details');
    const basketCount = document.getElementById('basket-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToBasketBtns = document.querySelectorAll('.add-to-basket');
    const productCards = document.querySelectorAll('.product-card');
    const adminIcon = document.getElementById('admin-icon');

    let basket = JSON.parse(localStorage.getItem('basket')) || [];

    updateBasketCount();

    window.addEventListener('load', function() {
        setTimeout(function() {
            const loading = document.getElementById('loading');
            loading.classList.add('fade-out');
            loading.addEventListener('transitionend', function() {
                loading.style.display = 'none';
            });
        }, 1000); // 1 second delay for demo
    });

    addToBasketBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.dataset.product;
            const productCard = this.closest('.product-card');
            const selectedOption = productCard.querySelector('input[type="radio"]:checked');
            const size = selectedOption.value;
            const label = selectedOption.parentElement;

            // Get the discounted price from the discounted-price span
            const discountedPriceSpan = label.querySelector('.discounted-price');
            const price = parseFloat(discountedPriceSpan.textContent.replace('£', ''));

            addToBasket(productName, size, price);
            updateBasketCount();
            animateAddToBasket(this);
        });
    });

    basketBtn.addEventListener('click', function() {
        displayBasket();
        basketModal.style.display = 'block';
    });

    const basketBtnMobile = document.getElementById('basket-btn-mobile');
    if (basketBtnMobile) {
        basketBtnMobile.addEventListener('click', function() {
            displayBasket();
            basketModal.style.display = 'block';
        });
    }

    basketCloseBtn.addEventListener('click', function() {
        basketModal.style.display = 'none';
    });

    productCloseBtn.addEventListener('click', function() {
        productModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === basketModal) {
            basketModal.style.display = 'none';
        }
        if (event.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    productCards.forEach(card => {
        const img = card.querySelector('img');
        img.addEventListener('click', function(event) {
            const fullDescription = card.dataset.fullDescription;
            const title = card.querySelector('h3').textContent;
            displayProductDetails(title, fullDescription);
            productModal.style.display = 'block';
        });
    });

    checkoutBtn.addEventListener('click', async function () {
    if (basket.length === 0) {
        alert('Your basket is empty!');
        return;
    }

    const lineItems = basket.map(item => {
        const key = `${item.product}|${item.size}`;
        const priceId = STRIPE_PRICE_MAP[key];
        return {
            price: priceId,
            quantity: item.quantity
        };
    });

    try {
        const res = await fetch("https://sourorsweet-checkout.7mexpert.workers.dev", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: lineItems })
        });

        const data = await res.json();
        window.location.href = data.url;
    } catch (err) {
        console.error(err);
        alert("Checkout failed. Please try again.");
    }
    });



    function addToBasket(product, size, price) {
        const existingItem = basket.find(item => item.product === product && item.size === size);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            basket.push({ product, size, price, quantity: 1 });
        }
        localStorage.setItem('basket', JSON.stringify(basket));
    }

    function updateBasketCount() {
        const totalItems = basket.reduce((sum, item) => sum + item.quantity, 0);
        basketCount.textContent = totalItems;
        const basketCountMobile = document.getElementById('basket-count-mobile');
        if (basketCountMobile) basketCountMobile.textContent = totalItems;
    }

    function displayBasket() {
        basketItems.innerHTML = '';
        if (basket.length === 0) {
            basketItems.innerHTML = '<p>Your basket is empty.</p>';
            return;
        }

        basket.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'basket-item';
            itemDiv.innerHTML = `
                <div>
                    <strong>${item.product} (${item.size})</strong><br>
                    Quantity: ${item.quantity} - £${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            basketItems.appendChild(itemDiv);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeFromBasket(index);
                displayBasket();
                updateBasketCount();
            });
        });

        const total = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiv = document.createElement('div');
        totalDiv.id = 'basket-total';
        totalDiv.textContent = `Total: £${total.toFixed(2)}`;
        basketItems.appendChild(totalDiv);

        const deliveryNotice = document.createElement('div');
        deliveryNotice.style.fontSize = '12px';
        deliveryNotice.style.color = '#666';
        deliveryNotice.style.textAlign = 'center';
        deliveryNotice.style.marginTop = '5px';
        deliveryNotice.textContent = 'excl. delivery fees';
        basketItems.appendChild(deliveryNotice);
    }

    function removeFromBasket(index) {
        basket.splice(index, 1);
        localStorage.setItem('basket', JSON.stringify(basket));
    }

    function animateAddToBasket(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    function displayProductDetails(title, description) {
        productDetails.innerHTML = `<h2>${title}</h2><div>${description}</div>`;
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Admin panel event listeners
    adminIcon.addEventListener('click', function() {
        adminModal.style.display = 'block';
    });

    adminCloseBtn.addEventListener('click', function() {
        adminModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    document.getElementById('view-stats').addEventListener('click', function() {
        const totalItems = basket.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Basket Stats:\nTotal Items: ${totalItems}\nTotal Revenue: £${totalRevenue.toFixed(2)}`);
    });

    document.getElementById('view-page-info').addEventListener('click', function() {
        const info = {
            'User Agent': navigator.userAgent,
            'Language': navigator.language,
            'Platform': navigator.platform,
            'Cookie Enabled': navigator.cookieEnabled,
            'Online': navigator.onLine,
            'Screen Size': `${screen.width}x${screen.height}`,
            'Viewport': `${window.innerWidth}x${window.innerHeight}`,
            'Page Load Time': performance.timing.loadEventEnd - performance.timing.navigationStart + 'ms'
        };
        let message = 'Page Info:\n';
        for (const [key, value] of Object.entries(info)) {
            message += `${key}: ${value}\n`;
        }
        alert(message);
    });

    document.getElementById('view-basket-data').addEventListener('click', function() {
        const basketData = localStorage.getItem('basket');
        if (basketData) {
            alert(`Basket Data (JSON):\n${basketData}`);
        } else {
            alert('No basket data found.');
        }
    });

    document.getElementById('clear-baskets').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the basket?')) {
            localStorage.removeItem('basket');
            basket = [];
            updateBasketCount();
            alert('Basket cleared.');
        }
    });

    document.getElementById('clear-all-data').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear ALL local data? This includes basket, referrals, etc.')) {
            localStorage.clear();
            sessionStorage.clear();
            basket = [];
            updateBasketCount();
            alert('All local data cleared.');
        }
    });

    document.getElementById('view-cookies').addEventListener('click', function() {
        const cookies = document.cookie;
        if (cookies) {
            alert(`Cookies:\n${cookies}`);
        } else {
            alert('No cookies found.');
        }
    });

    document.getElementById('export-data').addEventListener('click', function() {
        const data = {
            basket: localStorage.getItem('basket'),
            cookies: document.cookie,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admin-export.json';
        a.click();
        URL.revokeObjectURL(url);
        alert('Data exported as admin-export.json');
    });

    document.getElementById('hide-admin-icon').addEventListener('click', function() {
        document.getElementById('admin-icon').style.display = 'none';
        alert('Admin icon hidden. Refresh the page to show it again.');
    });
});

checkAdmin();

