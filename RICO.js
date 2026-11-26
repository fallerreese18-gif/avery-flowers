document.addEventListener("DOMContentLoaded", function () {
    const productCards = document.querySelectorAll(".flower-card");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const productBox = document.querySelector(".flowerbox");
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.getElementById("mainNav");
    const cartToggle = document.querySelector(".cart-toggle");
    const cartCount = document.querySelector(".cart-count");
    const cartItems = [];

    const noResults = document.createElement("p");
    noResults.textContent = "No products found. Please try another search.";
    noResults.className = "no-results";
    noResults.hidden = true;
    productBox.appendChild(noResults);

    function searchProducts() {
        const searchValue = searchInput.value.toLowerCase().trim();
        let foundProducts = 0;

        productCards.forEach(function (card) {
            const productName = card.querySelector("h3").textContent.toLowerCase();
            const productPrice = card.querySelector("strong").textContent.toLowerCase();
            const matches = productName.includes(searchValue) || productPrice.includes(searchValue);
            card.hidden = !matches;
            if (matches) foundProducts++;
        });
        noResults.hidden = foundProducts !== 0;
    }

    searchButton.addEventListener("click", searchProducts);
    searchInput.addEventListener("input", searchProducts);
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") searchProducts();
    });

    menuToggle.addEventListener("click", function () {
        const isOpen = mainNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    document.querySelectorAll("nav a").forEach(function (link) {
        link.addEventListener("click", function (event) {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            mainNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        });
    });

    const cart = document.createElement("div");
    cart.className = "cart-overlay";
    cart.hidden = true;
    cart.innerHTML = `
        <section class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
            <button class="cart-close" type="button" aria-label="Close shopping cart">&times;</button>
            <p class="label">YOUR FLOWER PICKS</p>
            <h2 id="cartTitle">Shopping Cart</h2>
            <div class="cart-list"></div>
            <p class="cart-empty">Your cart is empty. Add a bouquet to get started.</p>
            <p class="cart-total">Total: <strong>₱0</strong></p>
            <button class="cart-checkout" type="button">Proceed to Checkout</button>
        </section>`;
    document.body.appendChild(cart);

    const cartList = cart.querySelector(".cart-list");
    const cartEmpty = cart.querySelector(".cart-empty");
    const cartTotal = cart.querySelector(".cart-total strong");
    const cartCheckout = cart.querySelector(".cart-checkout");

    function formatPrice(price) {
        return "₱" + price.toLocaleString("en-PH");
    }

    function renderCart() {
        cartList.replaceChildren();
        let total = 0;
        let itemCount = 0;

        cartItems.forEach(function (item, index) {
            total += item.price * item.quantity;
            itemCount += item.quantity;
            const row = document.createElement("article");
            row.className = "cart-item";

            const details = document.createElement("div");
            details.className = "cart-item-details";
            const title = document.createElement("h3");
            title.textContent = item.name;
            const price = document.createElement("p");
            price.textContent = formatPrice(item.price) + " each";
            details.append(title, price);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";
            const quantityLabel = document.createElement("label");
            quantityLabel.textContent = "Quantity";
            const quantityControls = document.createElement("span");
            quantityControls.className = "quantity-controls";
            const quantityInput = document.createElement("input");
            quantityInput.type = "text";
            quantityInput.value = item.quantity;
            quantityInput.readOnly = true;
            quantityInput.inputMode = "none";
            quantityInput.setAttribute("aria-label", "Quantity for " + item.name);
            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.className = "quantity-step";
            increaseButton.textContent = "▲";
            increaseButton.setAttribute("aria-label", "Increase quantity of " + item.name);
            increaseButton.disabled = item.quantity >= 99;
            increaseButton.addEventListener("click", function () {
                item.quantity = Math.min(99, item.quantity + 1);
                renderCart();
            });
            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.className = "quantity-step";
            decreaseButton.textContent = "▼";
            decreaseButton.setAttribute("aria-label", "Decrease quantity of " + item.name);
            decreaseButton.disabled = item.quantity <= 1;
            decreaseButton.addEventListener("click", function () {
                item.quantity = Math.max(1, item.quantity - 1);
                renderCart();
            });
            quantityControls.append(increaseButton, quantityInput, decreaseButton);
            quantityLabel.appendChild(quantityControls);

            const ribbonLabel = document.createElement("label");
            ribbonLabel.textContent = "Ribbon color";
            const ribbonSelect = document.createElement("select");
            ribbonSelect.setAttribute("aria-label", "Ribbon color for " + item.name);
            ["Milky White", "White", "Light Blue", "Matcha", "Black", "Army Green", "Dusty Rose", "Brown", "Gold", "Peach Pink", "Light Pink", "Blue", "Dark Blue", "Purple", "Light Purple", "Royal Blue", "Barbie Pink", "Rose Red", "Wine Red", "Dark Magenta"].forEach(function (color) {
                const option = document.createElement("option");
                option.value = color;
                option.textContent = color;
                ribbonSelect.appendChild(option);
            });
            ribbonSelect.value = item.ribbon;
            ribbonSelect.addEventListener("change", function () {
                item.ribbon = ribbonSelect.value;
            });
            ribbonLabel.appendChild(ribbonSelect);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "cart-remove";
            removeButton.textContent = "Remove";
            removeButton.setAttribute("aria-label", "Remove " + item.name + " from cart");
            removeButton.addEventListener("click", function () {
                cartItems.splice(index, 1);
                renderCart();
            });

            controls.append(quantityLabel, ribbonLabel, removeButton);
            row.append(details, controls);
            cartList.appendChild(row);
        });

        cartCount.textContent = itemCount;
        cartCount.setAttribute("aria-label", itemCount + " items in cart");
        cartTotal.textContent = formatPrice(total);
        cartEmpty.hidden = cartItems.length > 0;
        cartCheckout.disabled = cartItems.length === 0;
    }

    function addToCart(button) {
        const card = button.closest(".flower-card");
        const name = card.querySelector("h3").textContent.trim();
        const price = Number(card.querySelector("strong").textContent.replace(/[^0-9.]/g, ""));
        const existingItem = cartItems.find(function (item) {
            return item.name === name;
        });

        if (existingItem) {
            existingItem.quantity = Math.min(99, existingItem.quantity + 1);
        } else {
            cartItems.push({ name: name, price: price, quantity: 1, ribbon: "Milky White" });
        }
        renderCart();
        button.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        window.setTimeout(function () {
            button.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
        }, 1000);
    }

    document.querySelectorAll(".add-to-cart").forEach(function (button) {
        button.addEventListener("click", function () {
            addToCart(button);
        });
    });

    function openCart() {
        renderCart();
        cart.hidden = false;
        cart.querySelector(".cart-close").focus();
    }

    function closeCart() {
        cart.hidden = true;
        cartToggle.focus();
    }

    cartToggle.addEventListener("click", openCart);
    cart.querySelector(".cart-close").addEventListener("click", closeCart);
    cart.addEventListener("click", function (event) {
        if (event.target === cart) closeCart();
    });

    const checkout = document.createElement("div");
    checkout.className = "checkout-overlay";
    checkout.hidden = true;
    checkout.innerHTML = `
        <section class="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle">
    <button class="checkout-close" type="button" aria-label="Close checkout">&times;</button>

    <p class="label">PLACE YOUR ORDER</p>
    <h2 id="checkoutTitle">Checkout</h2>

    <div class="checkout-products"></div>

    <form class="checkout-form">
        <label for="checkoutName">Your name</label>
        <input
            id="checkoutName"
            name="customerName"
            type="text"
            autocomplete="name"
            pattern="[A-Za-zÀ-ÿ' -]+"
            title="Use letters only (spaces, apostrophes, and hyphens are allowed)."
            maxlength="80"
            placeholder="Enter your full name"
            required
        >

        <label for="checkoutPhone">Phone number</label>
        <input
            id="checkoutPhone"
            name="customerPhone"
            type="tel"
            autocomplete="tel"
            inputmode="numeric"
            pattern="[0-9]{4}[0-9]{3}[0-9]{4}"
            maxlength="11"
            placeholder="09XXXXXXXXX"
            title="Enter exactly 11 digits in the format 00000000000."
            required
        >

        <label for="checkoutHouseNumber">House number</label>
        <input
            id="checkoutHouseNumber"
            name="houseNumber"
            type="text"
            placeholder="Ex. 1609"
            autocomplete="address-line1"
            required
        >

        <label for="checkoutInteriorNumber">Interior / unit number</label>
        <input
            id="checkoutInteriorNumber"
            name="interiorNumber"
            type="text"
            placeholder="Ex. Unit 2B or N/A"
            required
        >

        <label for="checkoutStreet">Street</label>
        <input
            id="checkoutStreet"
            name="street"
            type="text"
            placeholder="Enter your street name"
            required
        >

        <label for="checkoutDistrict">District</label>
        <input
            id="checkoutDistrict"
            name="district"
            type="text"
            placeholder="Enter your district or barangay"
            required
        >

        <label for="checkoutCity">City</label>
        <input
            id="checkoutCity"
            name="city"
            type="text"
            autocomplete="address-level2"
            placeholder="Enter your city or municipality"
            required
        >

        <p class="checkout-total">Total: <strong></strong></p>

        <button class="checkout-submit" type="submit">
            Prepare SMS order
        </button>
    </form>

    <p class="checkout-result" role="status" aria-live="polite"></p>

    <textarea
        class="checkout-message"
        rows="8"
        aria-label="Order details to copy"
        readonly
        hidden
    ></textarea>

    <a class="checkout-sms checkout-instagram" href="#" hidden>
        Open SMS app
    </a>

    <p class="checkout-note">
        Open your SMS app and send the prepared order to the owner.
        Your order is not placed until you send the message.
    </p>
</section>`;
    document.body.appendChild(checkout);

    const checkoutForm = checkout.querySelector(".checkout-form");
    const checkoutPhone = checkout.querySelector("#checkoutPhone");
    const checkoutProducts = checkout.querySelector(".checkout-products");
    const checkoutTotal = checkout.querySelector(".checkout-total strong");
    const resultLabel = checkout.querySelector(".checkout-result");
    const orderMessage = checkout.querySelector(".checkout-message");
    const smsLink = checkout.querySelector(".checkout-sms");
    let previousFocus = null;


    function clearOrderResult() {
        resultLabel.textContent = "";
        orderMessage.hidden = true;
        smsLink.hidden = true;
    }

    cartCheckout.addEventListener("click", function () {
        if (!cartItems.length) return;
        previousFocus = cartToggle;
        checkoutProducts.replaceChildren();
        let total = 0;
        cartItems.forEach(function (item) {
            total += item.price * item.quantity;
            const line = document.createElement("p");
            line.textContent = item.name + " × " + item.quantity + " — " + item.ribbon + " ribbon";
            checkoutProducts.appendChild(line);
        });
        checkoutTotal.textContent = formatPrice(total);
        checkoutForm.reset();
        clearOrderResult();
        cart.hidden = true;
        checkout.hidden = false;
        checkout.querySelector("#checkoutName").focus();
    });

    checkoutForm.addEventListener("input", clearOrderResult);
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!checkoutForm.reportValidity() || !cartItems.length) return;

        const formData = new FormData(checkoutForm);
        const total = cartItems.reduce(function (sum, item) {
            return sum + item.price * item.quantity;
        }, 0);
        const message = [
            "Hello! I'd like to place an order:",
            ...cartItems.map(function (item) {
                return item.name + " × " + item.quantity + " — " + item.ribbon + " ribbon — " + formatPrice(item.price * item.quantity);
            }),
            "Total: " + formatPrice(total),
            "Name: " + formData.get("customerName"),
            "Phone: " + formData.get("customerPhone"),
            "Delivery address: " + [
                "House " + formData.get("houseNumber"),
                "Interior/Unit " + formData.get("interiorNumber"),
                formData.get("street"),
                formData.get("district"),
                formData.get("city")
            ].join(", ")
        ].join("\n");

        orderMessage.value = message;
        orderMessage.hidden = false;
        smsLink.href = "sms:+639391700113?body=" + encodeURIComponent(message);
        smsLink.hidden = false;
        resultLabel.textContent = "Your order is ready. Open your SMS app and send the prepared message.";
        orderMessage.focus();
        orderMessage.select();
    });

    function closeCheckout() {
        checkout.hidden = true;
        if (previousFocus) previousFocus.focus();
    }

    checkout.querySelector(".checkout-close").addEventListener("click", closeCheckout);
    checkout.addEventListener("click", function (event) {
        if (event.target === checkout) closeCheckout();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (!checkout.hidden) closeCheckout();
            else if (!cart.hidden) closeCart();
            else if (mainNav.classList.contains("is-open")) {
                mainNav.classList.remove("is-open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation menu");
                menuToggle.focus();
            }
        }
    });

    renderCart();
});

