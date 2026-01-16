document.addEventListener('DOMContentLoaded', function() {
    const basketBtn = document.getElementById('basket-btn');
    const basketModal = document.getElementById('basket-modal');
    const productModal = document.getElementById('product-modal');
    const basketCloseBtn = document.querySelector('.close');
    const productCloseBtn = document.querySelector('.product-close');
    const basketItems = document.getElementById('basket-items');
    const productDetails = document.getElementById('product-details');
    const basketCount = document.getElementById('basket-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToBasketBtns = document.querySelectorAll('.add-to-basket');
    const productCards = document.querySelectorAll('.product-card');
    const sweetInputs = document.querySelectorAll('input[type="number"][data-sweet]');
    const pouchRadios = document.querySelectorAll('input[name="pouch-size"]');

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

    // Update selection status on pouch change
    pouchRadios.forEach(radio => {
        radio.addEventListener('change', updateSelectionStatus);
    });

    // Update selection status on input change
    sweetInputs.forEach(input => {
        input.addEventListener('input', updateSelectionStatus);
    });

    // Handle quantity buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('qty-btn')) {
            const button = event.target;
            const sweet = button.dataset.sweet;
            const input = document.querySelector(`input[data-sweet="${sweet}"]`);
            let value = parseInt(input.value);

            if (button.classList.contains('plus') && value < 10) {
                value++;
            } else if (button.classList.contains('minus') && value > 0) {
                value--;
            }

            input.value = value;
            updateSelectionStatus();
        }
    });

    updateSelectionStatus();

    addToBasketBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.dataset.product;
            let size, price;

            if (productName === 'Custom Mix') {
                const checkedBoxes = document.querySelectorAll('input[type="checkbox"][data-sweet]:checked');
                const selectedPouch = document.querySelector('input[name="pouch-size"]:checked');
                const requiredScoops = getScoopsForSize(selectedPouch.value);

                const totalScoops = Array.from(sweetInputs).reduce((sum, input) => sum + parseInt(input.value || 0), 0);
                if (totalScoops !== requiredScoops) {
                    alert(`Please select exactly ${requiredScoops} scoops.`);
                    return;
                }

                size = selectedPouch.value;
                const label = selectedPouch.parentElement;
                const priceText = label.textContent.split(' - ')[1];
                price = parseFloat(priceText.replace('£', ''));
            } else {
                const productCard = this.closest('.product-card');
                const selectedOption = productCard.querySelector('input[type="radio"]:checked');
                size = selectedOption.value;
                const label = selectedOption.parentElement;
                const priceText = label.textContent.split(' - ')[1];
                price = parseFloat(priceText.replace('£', ''));
            }

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

    checkoutBtn.addEventListener('click', function() {
        if (basket.length > 0) {
            const productNames = basket.map(item => encodeURIComponent(item.product + ' ' + item.size)).join(',');
            const url = `https://billing.sourorsweet.com/${productNames}`;
            window.open(url, '_blank');
        } else {
            alert('Your basket is empty!');
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

    function updateSelectionStatus() {
        const totalScoops = Array.from(sweetInputs).reduce((sum, input) => sum + parseInt(input.value || 0), 0);
        const selectedPouch = document.querySelector('input[name="pouch-size"]:checked');
        const maxScoops = getScoopsForSize(selectedPouch.value);
        const statusDiv = document.getElementById('selection-status');
        statusDiv.textContent = `Selected: ${totalScoops} / ${maxScoops} scoops`;

        const customBtn = document.querySelector('button[data-product="Custom Mix"]');
        if (totalScoops !== maxScoops) {
            customBtn.disabled = true;
            customBtn.style.background = 'grey';
            customBtn.style.cursor = 'not-allowed';
        } else {
            customBtn.disabled = false;
            customBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
            customBtn.style.cursor = 'pointer';
        }
    }

    function getScoopsForSize(size) {
        switch (size) {
            case '400g': return 5;
            case '1kg': return 10;
            case '2kg': return 20;
            case '2.75kg': return 27;
            default: return 0;
        }
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
});
