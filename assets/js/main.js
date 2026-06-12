document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initFAQAccordion();
    initShopCatalog();
    initProductDetail();
    initDryerCalculator();
    initCheckoutFlow();
    initEnquiryForms();
});

/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.querySelector(".main-nav");
    
    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener("click", () => {
            if (mainNav.style.display === "block") {
                mainNav.style.display = "";
            } else {
                mainNav.style.display = "block";
                mainNav.style.position = "absolute";
                mainNav.style.top = "100%";
                mainNav.style.left = "0";
                mainNav.style.width = "100%";
                mainNav.style.backgroundColor = "var(--color-surface)";
                mainNav.style.boxShadow = "var(--shadow-md)";
                mainNav.style.padding = "20px";
                
                const ul = mainNav.querySelector("ul");
                ul.style.flexDirection = "column";
                ul.style.gap = "15px";
            }
        });
    }
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFAQAccordion() {
    const triggers = document.querySelectorAll(".faq-trigger");
    triggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const item = trigger.closest(".faq-item");
            const isOpen = item.classList.contains("open");
            
            // Close all items
            document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
            
            // If it wasn't open, open it
            if (!isOpen) {
                item.classList.add("open");
            }
        });
    });
}

/* ==========================================================================
   SHOP CATALOG SEARCH & FILTER
   ========================================================================== */
let activeCategory = "all";
let searchPattern = "";
let currentSort = "default";

function initShopCatalog() {
    const grid = document.getElementById("shopProductGrid");
    if (!grid) return; // Not on shop.html
    
    renderCatalog();
    
    // Category click filters
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = btn.dataset.category;
            renderCatalog();
        });
    });
    
    // Search input
    const searchInput = document.getElementById("shopSearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchPattern = e.target.value.toLowerCase().trim();
            renderCatalog();
        });
    }
    
    // Sort dropdown
    const sortSelect = document.getElementById("shopSort");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderCatalog();
        });
    }
}

function renderCatalog() {
    const grid = document.getElementById("shopProductGrid");
    if (!grid) return;
    
    // 1. Filter products database
    let products = Object.values(PRODUCTS_DB);
    
    if (activeCategory !== "all") {
        products = products.filter(p => p.category.toLowerCase().replace(" & ", "-") === activeCategory);
    }
    
    if (searchPattern) {
        products = products.filter(p => p.name.toLowerCase().includes(searchPattern) || p.description.toLowerCase().includes(searchPattern));
    }
    
    // 2. Sort products
    if (currentSort === "price-low") {
        products.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
        products.sort((a, b) => b.price - a.price);
    } else if (currentSort === "rating") {
        products.sort((a, b) => b.rating - a.rating);
    }
    
    // 3. Render
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--color-text-muted);">
                <i class="fas fa-search" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 12px;"></i>
                <p>No products found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    let html = "";
    products.forEach(p => {
        const discountPercentage = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        let starHtml = "";
        for (let i = 1; i <= 5; i++) {
            starHtml += `<i class="${i <= p.rating ? 'fas' : 'far'} fa-star"></i>`;
        }
        
        html += `
            <div class="product-card">
                <div class="product-tag">
                    <span class="badge ${p.badgeClass}">${p.badge}</span>
                </div>
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="product-img">
                    <a href="product-detail.html?id=${p.id}" class="product-quick-view">Quick View</a>
                </div>
                <div class="product-info">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title"><a href="product-detail.html?id=${p.id}">${p.name}</a></h3>
                    <div class="product-rating">
                        ${starHtml} <span style="font-size: 0.8rem; color: var(--color-text-muted);">(${p.ratingCount})</span>
                    </div>
                    <div class="product-price-row">
                        <div class="product-price">
                            ₹${p.price} <del>₹${p.oldPrice}</del>
                        </div>
                        <button class="btn btn-primary btn-sm btn-icon add-to-cart-btn" data-id="${p.id}" title="Add to Cart" aria-label="Add to cart">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Wire up Add to Cart buttons
    grid.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            addToCart(id, 1, true);
        });
    });
}

/* ==========================================================================
   PRODUCT DETAIL LOADER
   ========================================================================= */
function initProductDetail() {
    const detailContainer = document.querySelector(".product-detail-layout");
    if (!detailContainer) return; // Not on product-detail.html
    
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id") || "bitter-gourd"; // default to bitter gourd
    const product = PRODUCTS_DB[productId];
    
    if (!product) {
        detailContainer.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 60px 0;">
                <h2>Product Not Found</h2>
                <p>The product you are looking for does not exist.</p>
                <a href="shop.html" class="btn btn-primary" style="margin-top: 20px;">Return to Shop</a>
            </div>
        `;
        return;
    }
    
    // Render detail section
    let starHtml = "";
    for (let i = 1; i <= 5; i++) {
        starHtml += `<i class="${i <= product.rating ? 'fas' : 'far'} fa-star"></i>`;
    }
    
    // Build tabs and info
    const mainImg = document.getElementById("detailMainImg");
    const thumbContainer = document.getElementById("detailThumbs");
    const productTitle = document.getElementById("detailTitle");
    const productCategory = document.getElementById("detailCategory");
    const productRating = document.getElementById("detailRating");
    const productPrice = document.getElementById("detailPrice");
    const productDesc = document.getElementById("detailDesc");
    const productBadge = document.getElementById("detailBadge");
    
    const specOrigin = document.getElementById("specOrigin");
    const specLife = document.getElementById("specLife");
    const specPack = document.getElementById("specPack");
    const specIngredients = document.getElementById("specIngredients");
    
    const tabDesc = document.getElementById("tabDescText");
    const tabBenefits = document.getElementById("tabBenefitsText");
    
    if (mainImg) mainImg.src = product.image;
    if (productTitle) productTitle.textContent = product.name;
    if (productCategory) productCategory.textContent = product.category;
    if (productPrice) productPrice.innerHTML = `₹${product.price} <del style="font-size:1.2rem; color:var(--color-text-muted); margin-left:10px;">₹${product.oldPrice}</del>`;
    if (productDesc) productDesc.textContent = product.description;
    
    if (productRating) {
        productRating.innerHTML = `${starHtml} <span style="color:var(--color-text-muted); font-size:0.9rem; margin-left:8px;">(${product.ratingCount} Customer reviews)</span>`;
    }
    
    if (productBadge) {
        productBadge.textContent = product.badge;
        productBadge.className = `badge ${product.badgeClass}`;
    }
    
    // Set specifications
    if (specOrigin) specOrigin.textContent = product.origin;
    if (specLife) specLife.textContent = product.shelfLife;
    if (specPack) specPack.textContent = product.packageSize;
    if (specIngredients) specIngredients.textContent = product.ingredients;
    
    // Set tabs details
    if (tabDesc) tabDesc.textContent = product.description;
    if (tabBenefits) {
        tabBenefits.innerHTML = `
            <ul style="padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Controlled Heat:</strong> Processing is done in zero-dust, temperature-controlled air drying chambers to avoid nutrition loss.</li>
                <li><strong>Extended Preservation:</strong> Reduces water content below 5%, preventing bacterial/mold growth for up to a year.</li>
                <li><strong>No Preservatives:</strong> Free from sulfur treatment, artificial coloring, or sodium benzoate.</li>
                <li><strong>Concentrated Nutrients:</strong> Retains fibers, minerals, and digestive enzymes intact.</li>
            </ul>
        `;
    }
    
    // Setup thumb click handler
    if (thumbContainer) {
        thumbContainer.innerHTML = `
            <div class="thumb-box active"><img src="${product.image}" alt="Product thumbnail"></div>
            <div class="thumb-box"><img src="assets/images/hero_banner.png" alt="Product thumbnail"></div>
        `;
        const thumbs = thumbContainer.querySelectorAll(".thumb-box");
        thumbs.forEach(t => {
            t.addEventListener("click", () => {
                thumbs.forEach(box => box.classList.remove("active"));
                t.classList.add("active");
                mainImg.src = t.querySelector("img").src;
            });
        });
    }
    
    // Setup Quantity Counter
    const qtyVal = document.getElementById("detailQtyVal");
    const decBtn = document.getElementById("detailDecQty");
    const incBtn = document.getElementById("detailIncQty");
    
    if (qtyVal && decBtn && incBtn) {
        let count = 1;
        incBtn.addEventListener("click", () => {
            count++;
            qtyVal.value = count;
        });
        decBtn.addEventListener("click", () => {
            if (count > 1) {
                count--;
                qtyVal.value = count;
            }
        });
    }
    
    // Bind main checkout/add actions
    const addBtn = document.getElementById("detailAddToCart");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const qty = parseInt(qtyVal ? qtyVal.value : 1);
            addToCart(productId, qty, true);
        });
    }
    
    // Tabs clicking
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const targetId = btn.dataset.tab;
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            document.getElementById(targetId).classList.add("active");
        });
    });
    
    // Setup specific product query inputs
    const queryProductField = document.getElementById("queryProduct");
    if (queryProductField) {
        queryProductField.value = product.name;
    }
}

/* ==========================================================================
   FARMER DRYER SERVICE CALCULATOR
   ========================================================================== */
function initDryerCalculator() {
    const form = document.getElementById("dryerCalculatorForm");
    if (!form) return; // Not on enquiry.html
    
    const cropSelect = document.getElementById("calcCrop");
    const weightInput = document.getElementById("calcWeight");
    const resultsBox = document.getElementById("calcResults");
    
    const resRate = document.getElementById("resRate");
    const resTime = document.getElementById("resTime");
    const resSubtotal = document.getElementById("resSubtotal");
    const resSubsidy = document.getElementById("resSubsidy");
    const resTotal = document.getElementById("resTotal");
    
    const CROP_RATES = {
        copra: { rate: 12, timeRatio: 0.05, name: "Copra (Dehydrated Coconut)" }, // rate per kg, time coefficient
        nutmeg: { rate: 15, timeRatio: 0.04, name: "Nutmeg & Spices" },
        cocoa: { rate: 18, timeRatio: 0.045, name: "Cocoa Beans" },
        chillies: { rate: 25, timeRatio: 0.03, name: "Birds Eye Chilli" },
        vegetables: { rate: 20, timeRatio: 0.035, name: "Bitter Gourd / Vegetables" }
    };
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const crop = cropSelect.value;
        const weight = parseFloat(weightInput.value);
        
        if (!crop || isNaN(weight) || weight <= 0) {
            alert("Please select a crop type and enter a valid weight.");
            return;
        }
        
        const config = CROP_RATES[crop];
        const ratePerKg = config.rate;
        
        // Time estimation (higher weights take batches, 1 batch = 24-30 hrs. Mock calculation)
        const estTime = Math.max(12, Math.round(weight * config.timeRatio));
        
        const subtotal = weight * ratePerKg;
        // PMEGP subsidy discount: 10% for agricultural value addition
        const subsidy = Math.round(subtotal * 0.1); 
        const total = subtotal - subsidy;
        
        // Fill results
        if (resRate) resRate.textContent = `₹${ratePerKg} / Kg`;
        if (resTime) resTime.textContent = `~ ${estTime} Hours`;
        if (resSubtotal) resSubtotal.textContent = `₹${subtotal}`;
        if (resSubsidy) resSubsidy.textContent = `-₹${subsidy} (10% PMEGP Subsidy)`;
        if (resTotal) resTotal.textContent = `₹${total}`;
        
        resultsBox.style.display = "block";
        resultsBox.scrollIntoView({ behavior: 'smooth' });
    });
}

/* ==========================================================================
   CHECKOUT PAGE FLOW
   ========================================================================== */
function initCheckoutFlow() {
    const checkoutForm = document.getElementById("checkoutDetailsForm");
    if (!checkoutForm) return; // Not on checkout.html
    
    // Toggle Card vs UPI form display
    const cardToggle = document.getElementById("toggleCard");
    const codToggle = document.getElementById("toggleCod");
    const cardFields = document.getElementById("creditCardFields");
    
    if (cardToggle && codToggle && cardFields) {
        cardToggle.addEventListener("click", () => {
            document.querySelectorAll(".payment-toggle-card").forEach(c => c.classList.remove("active"));
            cardToggle.classList.add("active");
            document.getElementById("paymentMethodRadioCard").checked = true;
            cardFields.style.display = "block";
        });
        
        codToggle.addEventListener("click", () => {
            document.querySelectorAll(".payment-toggle-card").forEach(c => c.classList.remove("active"));
            codToggle.classList.add("active");
            document.getElementById("paymentMethodRadioCod").checked = true;
            cardFields.style.display = "none";
        });
    }
    
    // Realtime Credit Card Preview Mirroring
    const ccNumInput = document.getElementById("ccNum");
    const ccNameInput = document.getElementById("ccName");
    const ccExpInput = document.getElementById("ccExp");
    
    const previewNum = document.getElementById("previewCardNum");
    const previewName = document.getElementById("previewCardName");
    const previewExp = document.getElementById("previewCardExp");
    
    if (ccNumInput && previewNum) {
        ccNumInput.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "");
            // Format 0000 0000 0000 0000
            let formatted = val.match(/.{1,4}/g)?.join(" ") || "";
            e.target.value = formatted.substring(0, 19);
            previewNum.textContent = e.target.value || "•••• •••• •••• ••••";
        });
    }
    
    if (ccNameInput && previewName) {
        ccNameInput.addEventListener("input", (e) => {
            previewName.textContent = e.target.value.toUpperCase() || "CARDHOLDER NAME";
        });
    }
    
    if (ccExpInput && previewExp) {
        ccExpInput.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "");
            if (val.length >= 2) {
                e.target.value = val.substring(0, 2) + "/" + val.substring(2, 4);
            } else {
                e.target.value = val;
            }
            previewExp.textContent = e.target.value || "MM/YY";
        });
    }
    
    // Intercept checkout submit
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Collect shipping details
        const details = {
            name: document.getElementById("checkoutName").value,
            phone: document.getElementById("checkoutPhone").value,
            address: document.getElementById("checkoutAddress").value,
            city: document.getElementById("checkoutCity").value,
            zip: document.getElementById("checkoutZip").value
        };
        
        const paymentMethod = document.querySelector("input[name='paymentMethod']:checked").value;
        
        if (paymentMethod === "whatsapp") {
            // Open whatsapp checkout URL directly
            const url = getWhatsAppCheckoutUrl(details);
            window.open(url, "_blank");
            
            // Clear cart & proceed to order success
            const mockOrderId = "JME-" + Math.floor(100000 + Math.random() * 900000);
            sessionStorage.setItem("lastOrderDetails", JSON.stringify({
                orderId: mockOrderId,
                name: details.name,
                phone: details.phone,
                amount: getTotal(),
                shipping: getShipping(),
                tax: getTax(),
                subtotal: getSubtotal(),
                discount: getDiscount(),
                items: cart,
                method: "WhatsApp Order Confirmation"
            }));
            
            clearCart();
            window.location.href = "order-success.html";
        } else {
            // Digital checkout: card mock payment simulation with loading spinner
            showCardAuthOverlay(details);
        }
    });
}

function showCardAuthOverlay(details) {
    const overlay = document.getElementById("loadingOverlay");
    const container = document.getElementById("otpBoxContainer");
    if (!overlay || !container) return;
    
    overlay.style.display = "flex";
    
    // Step 1: Spinner showing connecting to bank
    container.innerHTML = `
        <div class="spinner"></div>
        <h4>Connecting to Bank Gateway</h4>
        <p class="text-muted" style="font-size:0.9rem; margin-top:8px;">Verifying credentials, please do not close this window...</p>
    `;
    
    setTimeout(() => {
        // Step 2: Show OTP entry form
        container.innerHTML = `
            <i class="fas fa-shield-alt" style="font-size:3rem; color:var(--color-primary-light); margin-bottom:16px;"></i>
            <h4>Secure Card Verification</h4>
            <p style="font-size:0.9rem; color:var(--color-text-muted);">Enter the 6-digit OTP code sent to your phone for confirmation.</p>
            <form id="otpVerifyForm">
                <input type="text" maxlength="6" class="otp-input-field" placeholder="123456" id="otpCode" required>
                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Authorize Payment</button>
            </form>
            <p style="font-size:0.8rem; color:var(--color-text-muted); margin-top:12px;">Mock Simulator - Enter any 6 digits to verify</p>
        `;
        
        const form = document.getElementById("otpVerifyForm");
        form.addEventListener("submit", (ev) => {
            ev.preventDefault();
            
            // Show secondary processing state
            container.innerHTML = `
                <div class="spinner"></div>
                <h4>Authorizing Transaction...</h4>
                <p class="text-muted" style="font-size:0.9rem; margin-top:8px;">Finalizing order registry</p>
            `;
            
            setTimeout(() => {
                // Clear cart & proceed
                const mockOrderId = "JME-" + Math.floor(100000 + Math.random() * 900000);
                sessionStorage.setItem("lastOrderDetails", JSON.stringify({
                    orderId: mockOrderId,
                    name: details.name,
                    phone: details.phone,
                    amount: getTotal(),
                    shipping: getShipping(),
                    tax: getTax(),
                    subtotal: getSubtotal(),
                    discount: getDiscount(),
                    items: cart,
                    method: "Digital Credit/Debit Card"
                }));
                
                clearCart();
                overlay.style.display = "none";
                window.location.href = "order-success.html";
            }, 2000);
        });
        
    }, 2500);
}

/* ==========================================================================
   ENQUIRY FORMS SUBMISSION MOCKERS
   ========================================================================== */
function initEnquiryForms() {
    const contactForm = document.getElementById("contactForm");
    const generalEnquiryForm = document.getElementById("generalEnquiryForm");
    const dryerEnquiryForm = document.getElementById("dryerCalculatorForm");
    
    const showSuccess = (title, msg) => {
        alert(`${title}\n\n${msg}`);
    };
    
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = contactForm.querySelector("#contactName").value;
            showSuccess(
                "Enquiry Submitted Successfully!",
                `Thank you ${name}. Our representative will contact you shortly regarding your message.`
            );
            contactForm.reset();
        });
    }
    
    if (generalEnquiryForm) {
        generalEnquiryForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("queryName").value;
            const product = document.getElementById("queryProduct").value;
            showSuccess(
                "Wholesale Enquiry Registered",
                `Thank you ${name} for your wholesale enquiry on "${product}". Josemon Jacob's team will contact you with bulk prices within 24 hours.`
            );
            generalEnquiryForm.reset();
        });
    }
    
    // Handle submission of Dryer Reservation after Calculation
    const submitDryerBtn = document.getElementById("submitDryerBooking");
    if (submitDryerBtn) {
        submitDryerBtn.addEventListener("click", () => {
            const cropName = document.getElementById("calcCrop").options[document.getElementById("calcCrop").selectedIndex].text;
            const weight = document.getElementById("calcWeight").value;
            const totalCost = document.getElementById("resTotal").textContent;
            
            showSuccess(
                "Dryer Reservation Request Received",
                `Your booking enquiry for processing ${weight}kg of ${cropName} (Est: ${totalCost}) has been submitted. We will call you to confirm your dryer slot timing.`
            );
            
            document.getElementById("dryerCalculatorForm").reset();
            document.getElementById("calcResults").style.display = "none";
        });
    }
}
