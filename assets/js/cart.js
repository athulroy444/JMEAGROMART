// Central Product Database
const PRODUCTS_DB = {
    "bitter-gourd": {
        id: "bitter-gourd",
        name: "Dried Bitter Gourd (Pavakka)",
        category: "Dried Vegetables",
        price: 120,
        oldPrice: 150,
        image: "assets/images/dried_bitter_gourd.png",
        badge: "Bestseller",
        badgeClass: "badge-organic",
        rating: 5,
        ratingCount: 48,
        description: "Premium dehydrated bitter gourd slices processed under clean controlled temperatures. Zero added preservatives. Perfect for traditional Kerala curries, stir-fries, and healthy chips.",
        origin: "Marangattupilly, Kottayam",
        shelfLife: "12 Months",
        packageSize: "100g Pouch",
        ingredients: "100% Dehydrated Bitter Gourd"
    },
    "kanthari-chilli": {
        id: "kanthari-chilli",
        name: "Birds Eye Chilli (Kanthari)",
        category: "Dried Vegetables",
        price: 180,
        oldPrice: 200,
        image: "assets/images/birds_eye_chilli.png",
        badge: "Hot Deal",
        badgeClass: "badge-dryer",
        rating: 5,
        ratingCount: 32,
        description: "Authentic Kerala Kanthari Mulaku (Birds Eye Chilli), dried in our state-of-the-art agricultural dryers to retain its vibrant color, intense heat, and medicinal properties.",
        origin: "Kottayam District, Kerala",
        shelfLife: "12 Months",
        packageSize: "50g Pouch",
        ingredients: "100% Dehydrated Birds Eye Chilli"
    },
    "jackfruit-slices": {
        id: "jackfruit-slices",
        name: "Dehydrated Jackfruit Slices",
        category: "Dehydrated Fruits",
        price: 150,
        oldPrice: 180,
        image: "assets/images/dried_jackfruit.png",
        badge: "100% Organic",
        badgeClass: "badge-organic",
        rating: 4,
        ratingCount: 29,
        description: "Naturally sweet and fibrous tender jackfruit slices dried to perfection. Great as a healthy snack, or can be rehydrated for making traditional jackfruit puzhukku and curries.",
        origin: "Local Farms, Mannackanad",
        shelfLife: "9 Months",
        packageSize: "200g Pouch",
        ingredients: "100% Pure Dried Jackfruit Slices"
    },
    "nutmeg-mace": {
        id: "nutmeg-mace",
        name: "Dried Nutmeg & Mace",
        category: "Spices & Powders",
        price: 240,
        oldPrice: 280,
        image: "assets/images/nutmeg_copra.png",
        badge: "Spices Special",
        badgeClass: "badge-dryer",
        rating: 5,
        ratingCount: 15,
        description: "Directly sourced nutmeg seeds and bright red mace dried under optimized conditions. Ensures retention of essential oils, strong aroma, and rich spice flavor.",
        origin: "Marangattupilly Farms",
        shelfLife: "18 Months",
        packageSize: "100g Pack",
        ingredients: "Nutmeg Seeds & Dried Mace flakes"
    },
    "copra-coconut": {
        id: "copra-coconut",
        name: "Premium Dryer Copra",
        category: "Farmer Services",
        price: 95,
        oldPrice: 110,
        image: "assets/images/nutmeg_copra.png", // reusing similar image
        badge: "Dryer Grade",
        badgeClass: "badge-dryer",
        rating: 4,
        ratingCount: 52,
        description: "Vaccum dried coconut halves (copra) prepared in our high-capacity drying unit. 100% sulfur-free, fungus-free, and ideal for premium oil extraction or culinary use.",
        origin: "JME Agri Dryer Unit",
        shelfLife: "6 Months",
        packageSize: "500g Pack",
        ingredients: "Sulfur-free Dried Coconut (Copra)"
    },
    "ivy-gourd": {
        id: "ivy-gourd",
        name: "Dehydrated Ivy Gourd (Kovakka)",
        category: "Dried Vegetables",
        price: 110,
        oldPrice: 130,
        image: "assets/images/dried_bitter_gourd.png", // Fallback reuse
        badge: "New Arrival",
        badgeClass: "badge-organic",
        rating: 4,
        ratingCount: 18,
        description: "Sliced Ivy Gourd dehydrated using hot-air drying units, retaining high fiber and natural green color. Excellent for quick cooking fryups or curries.",
        origin: "Kottayam, Kerala",
        shelfLife: "10 Months",
        packageSize: "100g Pouch",
        ingredients: "Dehydrated Kovakka"
    }
};

// State Variables
let cart = [];
let appliedPromo = null;

// Initialize Cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem("jme_cart");
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    
    const savedPromo = localStorage.getItem("jme_promo");
    if (savedPromo) {
        appliedPromo = JSON.parse(savedPromo);
    }
    
    updateCartUI();
    setupCartDrawerListeners();
}

// Save Cart to localStorage
function saveCart() {
    localStorage.setItem("jme_cart", JSON.stringify(cart));
    if (appliedPromo) {
        localStorage.setItem("jme_promo", JSON.stringify(appliedPromo));
    } else {
        localStorage.removeItem("jme_promo");
    }
    updateCartUI();
}

// Add Item to Cart
function addToCart(productId, qty = 1, showDrawer = true) {
    const product = PRODUCTS_DB[productId];
    if (!product) return;
    
    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            qty: qty
        });
    }
    
    saveCart();
    
    if (showDrawer) {
        openCartDrawer();
    }
}

// Remove Item from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// Update Item Quantity
function updateQty(productId, newQty) {
    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart[index].qty = newQty;
        saveCart();
    }
}

// Clear Cart
function clearCart() {
    cart = [];
    appliedPromo = null;
    saveCart();
}

// Calculations
function getCartCount() {
    return cart.reduce((total, item) => total + item.qty, 0);
}

function getSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
}

function getDiscount() {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") {
        return Math.round(getSubtotal() * (appliedPromo.val / 100));
    }
    return appliedPromo.val;
}

function getShipping() {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 500 ? 0 : 40; // Free shipping above ₹500
}

function getTax() {
    // 5% agricultural tax
    return Math.round((getSubtotal() - getDiscount()) * 0.05);
}

function getTotal() {
    return getSubtotal() - getDiscount() + getShipping() + getTax();
}

// Apply Promo Code
function applyPromoCode(code) {
    const uppercaseCode = code.trim().toUpperCase();
    if (uppercaseCode === "JMEAGRO") {
        appliedPromo = { code: "JMEAGRO", type: "percent", val: 10 };
        saveCart();
        return { success: true, message: "10% Discount applied successfully!" };
    }
    if (uppercaseCode === "FREESHIP") {
        appliedPromo = { code: "FREESHIP", type: "percent", val: 0, desc: "Free Shipping" }; // Custom handling
        saveCart();
        return { success: true, message: "Promo applied!" };
    }
    return { success: false, message: "Invalid promo code" };
}

function removePromoCode() {
    appliedPromo = null;
    saveCart();
}

// Drawer Open / Close Functions
function openCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartDrawerOverlay");
    if (drawer && overlay) {
        drawer.classList.add("open");
        overlay.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent scrolling behind drawer
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartDrawerOverlay");
    if (drawer && overlay) {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
    }
}

// Setup Event Listeners for Cart Drawer UI triggers
function setupCartDrawerListeners() {
    const triggers = document.querySelectorAll(".cart-trigger");
    triggers.forEach(trigger => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    });
    
    const closeBtn = document.getElementById("cartCloseBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeCartDrawer);
    }
    
    const overlay = document.getElementById("cartDrawerOverlay");
    if (overlay) {
        overlay.addEventListener("click", closeCartDrawer);
    }
}

// Main UI Update Orchestrator
function updateCartUI() {
    // 1. Update Header Badges
    const badges = document.querySelectorAll(".cart-count");
    const count = getCartCount();
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
    });
    
    // 2. Render Drawer List
    const drawerContainer = document.getElementById("cartDrawerItems");
    const subtotalLabel = document.getElementById("cartDrawerSubtotal");
    
    if (drawerContainer) {
        if (cart.length === 0) {
            drawerContainer.innerHTML = `
                <div class="cart-empty-message">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your cart is empty.</p>
                    <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top: 15px;">Shop Now</a>
                </div>
            `;
        } else {
            let html = "";
            cart.forEach(item => {
                html += `
                    <div class="cart-item-card" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <span class="cart-item-price">₹${item.price}</span>
                            <div class="cart-item-qty">
                                <button class="qty-btn dec-qty">-</button>
                                <span class="qty-val">${item.qty}</span>
                                <button class="qty-btn inc-qty">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove remove-item" aria-label="Remove item">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            drawerContainer.innerHTML = html;
            
            // Add click listeners to drawer items buttons
            drawerContainer.querySelectorAll(".inc-qty").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.closest(".cart-item-card").dataset.id;
                    const item = cart.find(i => i.id === id);
                    if (item) updateQty(id, item.qty + 1);
                });
            });
            
            drawerContainer.querySelectorAll(".dec-qty").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.closest(".cart-item-card").dataset.id;
                    const item = cart.find(i => i.id === id);
                    if (item) updateQty(id, item.qty - 1);
                });
            });
            
            drawerContainer.querySelectorAll(".remove-item").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.closest(".cart-item-card").dataset.id;
                    removeFromCart(id);
                });
            });
        }
    }
    
    if (subtotalLabel) {
        subtotalLabel.textContent = `₹${getSubtotal()}`;
    }
    
    // 3. Render Cart Page Table (if we are on cart.html)
    updateCartPageUI();
    
    // 4. Render Checkout Info (if we are on checkout.html)
    updateCheckoutUI();
}

// Render cart table on the dedicated cart.html
function updateCartPageUI() {
    const tableContainer = document.getElementById("cartTableBody");
    const pageSubtotal = document.getElementById("pageSubtotal");
    const pageDiscount = document.getElementById("pageDiscount");
    const pageDiscountRow = document.getElementById("pageDiscountRow");
    const pageShipping = document.getElementById("pageShipping");
    const pageTax = document.getElementById("pageTax");
    const pageTotal = document.getElementById("pageTotal");
    const promoForm = document.getElementById("promoForm");
    const promoApplied = document.getElementById("promoAppliedBadge");
    
    if (tableContainer) {
        if (cart.length === 0) {
            // Show empty cart screen, hide normal summary layout
            const layout = document.querySelector(".cart-layout");
            if (layout) {
                layout.innerHTML = `
                    <div style="grid-column: span 2; text-align: center; padding: 60px 0;">
                        <i class="fas fa-shopping-cart" style="font-size: 4rem; color: var(--color-primary-light); opacity: 0.3; margin-bottom: 24px; display:block;"></i>
                        <h3 style="font-family:'Outfit'; font-size:1.8rem; margin-bottom:12px;">Your shopping cart is empty</h3>
                        <p style="color:var(--color-text-muted); margin-bottom:32px;">Add dehydrated farm products or book processing services to start.</p>
                        <a href="shop.html" class="btn btn-primary">Browse Shop</a>
                    </div>
                `;
            }
        } else {
            let html = "";
            cart.forEach(item => {
                html += `
                    <tr data-id="${item.id}">
                        <td>
                            <div class="cart-table-product">
                                <img src="${item.image}" alt="${item.name}">
                                <div>
                                    <h4 class="cart-table-title"><a href="product-detail.html?id=${item.id}">${item.name}</a></h4>
                                    <span style="font-size:0.8rem; color:var(--color-text-muted);">${item.category}</span>
                                </div>
                            </div>
                        </td>
                        <td>₹${item.price}</td>
                        <td>
                            <div class="qty-selector">
                                <button class="qty-select-btn dec-page-qty">-</button>
                                <input type="text" class="qty-input" value="${item.qty}" readonly>
                                <button class="qty-select-btn inc-page-qty">+</button>
                            </div>
                        </td>
                        <td style="font-weight:700;">₹${item.price * item.qty}</td>
                        <td class="cart-table-remove-col">
                            <button class="remove-page-item" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    </tr>
                `;
            });
            tableContainer.innerHTML = html;
            
            // Wire listeners
            tableContainer.querySelectorAll(".inc-page-qty").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.closest("tr").dataset.id;
                    const item = cart.find(i => i.id === id);
                    if (item) updateQty(id, item.qty + 1);
                });
            });
            tableContainer.querySelectorAll(".dec-page-qty").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.closest("tr").dataset.id;
                    const item = cart.find(i => i.id === id);
                    if (item) updateQty(id, item.qty - 1);
                });
            });
            tableContainer.querySelectorAll(".remove-page-item").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.closest("tr").dataset.id;
                    removeFromCart(id);
                });
            });
        }
    }
    
    // Update labels
    if (pageSubtotal) pageSubtotal.textContent = `₹${getSubtotal()}`;
    if (pageShipping) {
        const ship = getShipping();
        pageShipping.textContent = ship === 0 ? "FREE" : `₹${ship}`;
    }
    if (pageTax) pageTax.textContent = `₹${getTax()}`;
    if (pageTotal) pageTotal.textContent = `₹${getTotal()}`;
    
    if (pageDiscount && pageDiscountRow) {
        const disc = getDiscount();
        if (disc > 0) {
            pageDiscount.textContent = `-₹${disc}`;
            pageDiscountRow.style.display = "flex";
        } else {
            pageDiscountRow.style.display = "none";
        }
    }
    
    if (promoForm && promoApplied) {
        if (appliedPromo) {
            promoApplied.style.display = "flex";
            promoApplied.querySelector(".applied-code-text").textContent = `${appliedPromo.code} (${appliedPromo.val}% Off)`;
            promoForm.style.display = "none";
        } else {
            promoApplied.style.display = "none";
            promoForm.style.display = "flex";
            promoForm.reset();
        }
    }
}

// Render checkout summaries on checkout.html
function updateCheckoutUI() {
    const summaryList = document.getElementById("checkoutSummaryItems");
    const subVal = document.getElementById("checkoutSubtotal");
    const shippingVal = document.getElementById("checkoutShipping");
    const taxVal = document.getElementById("checkoutTax");
    const totalVal = document.getElementById("checkoutTotal");
    const discRow = document.getElementById("checkoutDiscountRow");
    const discVal = document.getElementById("checkoutDiscount");
    
    if (summaryList) {
        let html = "";
        cart.forEach(item => {
            html += `
                <div class="summary-row" style="border-bottom:1px solid #f1f8e9; padding-bottom:8px;">
                    <span style="font-weight:500;">${item.name} <span style="color:var(--color-primary-light);">x${item.qty}</span></span>
                    <span>₹${item.price * item.qty}</span>
                </div>
            `;
        });
        summaryList.innerHTML = html;
    }
    
    if (subVal) subVal.textContent = `₹${getSubtotal()}`;
    if (taxVal) taxVal.textContent = `₹${getTax()}`;
    if (totalVal) totalVal.textContent = `₹${getTotal()}`;
    if (shippingVal) {
        const ship = getShipping();
        shippingVal.textContent = ship === 0 ? "FREE" : `₹${ship}`;
    }
    
    if (discRow && discVal) {
        const disc = getDiscount();
        if (disc > 0) {
            discVal.textContent = `-₹${disc}`;
            discRow.style.display = "flex";
        } else {
            discRow.style.display = "none";
        }
    }
}

// WhatsApp Checkout Generator
function getWhatsAppCheckoutUrl(shippingDetails) {
    const phone = "919447285144"; // Authentic JME Agro owner phone number placeholder (Josemon Jacob)
    let message = `*JME AGRO MART - NEW ORDER*\n`;
    message += `-----------------------------\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${shippingDetails.name}\n`;
    message += `Phone: ${shippingDetails.phone}\n`;
    message += `Address: ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zip}\n\n`;
    
    message += `*Items Ordered:*\n`;
    cart.forEach(item => {
        message += `- ${item.name} (x${item.qty}) : ₹${item.price * item.qty}\n`;
    });
    message += `\n`;
    
    message += `Subtotal: ₹${getSubtotal()}\n`;
    if (getDiscount() > 0) {
        message += `Discount: -₹${getDiscount()} (${appliedPromo.code})\n`;
    }
    message += `Shipping: ${getShipping() === 0 ? 'FREE' : '₹' + getShipping()}\n`;
    message += `Tax (5% GST): ₹${getTax()}\n`;
    message += `*Total Amount:* ₹${getTotal()}\n`;
    message += `-----------------------------\n`;
    message += `Payment Preference: Cash on Delivery / UPI Transfer\n`;
    message += `Please confirm my order. Thank you!`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Load cart on boot
document.addEventListener("DOMContentLoaded", initCart);
