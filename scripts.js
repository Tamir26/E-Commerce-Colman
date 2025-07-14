console.log("Downloading the Config Values")
import config from "./config.js";
console.log("Config Values are loaded")
$(document).ready(function() {
    // Check and update nav bar on every page load
    const userRole = Cookies.get('userRole')?.toLowerCase();
    if (userRole) {
        $('.role-based-nav').remove();
        if (userRole === 'admin') {
            $('.nav-links').append(`
                <li class="role-based-nav">
                    <a href="supply-management.html">Supply Management</a>
                </li>
                <li class="role-based-nav">
                    <a href="user-management.html">User Management</a>
                </li>
            `);
        } else if (userRole === 'supplier') {
            $('.nav-links').append(`
                <li class="role-based-nav">
                    <a href="supply-management.html">Supply Management</a>
                </li>
            `);
        }
    }

    // Handle supply management page content
    if (window.location.pathname.includes('supply-management.html')) {
        const userRole = Cookies.get('userRole')?.toLowerCase();
        if (!userRole || (userRole !== 'admin' && userRole !== 'supplier')) {
            window.location.href = 'index.html';
            return;
        }

        $('main').html(`
            <section class="page" id="supply-management">
                <div class="show-bar">
                    <h2>Supply Management</h2>
                    <form id="add-product-form" class="auth-form">
                        <input type="text" name="name" placeholder="Product Name" required>
                        <input type="number" name="price" placeholder="Price" required>
                        <input type="text" name="description" placeholder="Description" required>
                        <input type="text" name="category" placeholder="Category" required>
                        <input type="number" name="quantity" placeholder="Quantity" required>
                        <input type="text" name="img_url" placeholder="Image URL">
                        <button type="submit">Add Product</button>
                    </form>
                    <div id="products-grid">
                        <!-- Products will be loaded here -->
                    </div>
                </div>
            </section>
        `);
    }

    // Handle user management page content
    if (window.location.pathname.includes('user-management.html')) {
        const userRole = Cookies.get('userRole')?.toLowerCase();
        if (userRole !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        $('main').html(`
            <section class="page" id="user-management">
                <div class="show-bar">
                    <h2>User Management</h2>
                    <div id="users-grid">
                        <!-- Users will be loaded here -->
                    </div>
                </div>
            </section>
        `);

        // Load users
        const userHash = Cookies.get('userHash');
        $.ajax({
            url: config.backendURL + '/admin/users/view',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ User_hash: userHash }),
            success: function(response) {
                const users = response.data;
                const usersHtml = users.map(user => `
                    <div class="product-grid">
                        <h3>${user.username}</h3>
                        <p>Role: 
                            <select class="role-select" data-user-id="${user.id}">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                <option value="supplier" ${user.role === 'supplier' ? 'selected' : ''}>Supplier</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </p>
                        <button class="delete-user" data-user-id="${user.id}">Delete User</button>
                    </div>
                `).join('');
                $('#users-grid').html(usersHtml);
            },
            error: function(xhr, status, error) {
                console.error('Error loading users:', error);
                $('#users-grid').html('<p>Error loading users</p>');
            }
        });
    }
});
//Login
$(document).ready(function() {
    $('#login-form').submit(function(e) {
        e.preventDefault();
        
        const Username =$('#username').val();
        const Password =$('#password').val();
        
        const userLogin={
            Username: Username,
            Password: Password
        };

        $('#message').text('Connecting...').css('color', 'blue','bold');
        $.ajax({
            url: config.backendURL+config.routes['/api/login'],
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userLogin),
            success: function(response, status, xhr) {
                if (xhr.status == 200) {
                    $('#message').text('Login Succeeded').css('color', 'green');
                    // Update nav-username with proper link structure
                    $('.nav-username').empty().html(`<a href="user.html">Hello, ${response.Username}</a>`);
                    Cookies.set('userHash', response.User_hash, { expires: 1/24 }); 
                    Cookies.set('username', response.Username, { expires: 1/24 });
                    Cookies.set('userRole', response.User_role, { expires: 1/24 });
                    localStorage.setItem('userHash', response.User_hash);
                    localStorage.setItem('username', response.Username);
                    localStorage.setItem('userRole', response.User_role);
                    console.log("Your role is:",response.User_hash);

                    const userRole = response.User_role;
                    console.log("userRole ",userRole)
                    $('.role-based-nav').remove(); // Clear existing role-based nav items
                    if (userRole === 'admin') {
                        $('.nav-links').append(`
                            <li class="role-based-nav">
                                <a href="supply-management.html">Supply Management</a>
                            </li>
                            <li class="role-based-nav">
                                <a href="user-management.html">User Management</a>
                            </li>
                        `);
                    } else if (userRole === 'Supplier') {
                        $('.nav-links').append(`
                            <li class="role-based-nav">
                                <a href="supply-management.html">Supply Management</a>
                            </li>
                        `);
                    }
            
                    document.getElementById('login-form').hidePopover();

                    // Reinitialize click handlers
                    $('.nav-username a').off('click').on('click', function(e) {
                        e.preventDefault();
                        if (!Cookies.get('userHash')) {
                            alert('Please log in first');
                            return;
                        }
                        window.location.href = 'user.html';
                    });

                    // Hide the login form popover after successful login
                    document.getElementById('login-form').hidePopover();
                } 
            },
            error: function(xhr, status, error) {
                var errorMessage;
                switch (xhr.status) {
                    case 400:
                        errorMessage = 'Error: Missing or unvalid Data ' + xhr.status;
                        break;
                    case 401:
                        errorMessage = 'Wrong Username or password ' + xhr.status;
                        break;
                    case 403:
                        errorMessage = 'No premssions ' + xhr.status;
                        break;
                    case 404:
                        errorMessage = "Login service haven't been found " + xhr.status;
                        break;
                    case 500:
                        errorMessage = 'Server error try again '  + xhr.status;
                        break;
                    default:
                        errorMessage = ' Unexpected error : '+ (xhr.responseJSON ? xhr.responseJSON.error : error);
                }
                $('#message').text(errorMessage).css('color', 'red');
                
                console.error('Login Error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
            },
            complete: function() {
                console.log('Login attempt completed');
            }
        });
    }); 
});

//SignIn
$(document).ready(function() {
    $('#sign-in-form').submit(function(e) {
        e.preventDefault();
        
        const firstName =$('#first-name').val();
        const lastName =$('#last-name').val();
        const signInUsername =$('#signin-username').val();
        const signInPassword =$('#first-password').val();
        const passwordConfirm =$('#confirm-password').val();
        const email =$('#email').val();
        const birthdate =$('#birthday-date').val();
        
        if (signInPassword !== passwordConfirm){
            alert("Password do not match");
            return;
        }

        const userData ={
            firstName: firstName,
            lastName: lastName,
            Username: signInUsername,
            Password: signInPassword,
            email: email,
            birthDate: birthdate
        };

        $('#signin-message').text('Registering you...').css('color', 'blue');

        $.ajax({
            url: config.backendURL+config.routes['/api/signin'],
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function(response) {
                $('#signin-message').text('Registration Succeeded').css('color', 'green');
                
                // Update nav-username with proper link structure
                $('.nav-username').empty().html(`<a href="user.html">Hello, ${response.Username}</a>`);
                
                // Set cookies and localStorage after successful registration
                Cookies.set('userHash', response.User_hash, { expires: 1/24 }); 
                Cookies.set('username', response.Username, { expires: 1/24 });
                Cookies.set('userRole', response.User_role, { expires: 1/24 });
                localStorage.setItem('userHash', response.User_hash);
                localStorage.setItem('username', response.Username);
                localStorage.setItem('userRole', response.User_role);
                
                // Reinitialize click handlers
                $('.nav-username a').off('click').on('click', function(e) {
                    e.preventDefault();
                    if (!Cookies.get('userHash')) {
                        alert('Please log in first');
                        return;
                    }
                    window.location.href = 'user.html';
                });
                
                console.log("Registration completed!");
                
                // Hide the signin form popover after successful registration
                document.getElementById('sign-in-form').hidePopover();
            },
            error: function(xhr, status, error) {
                var errorMessage;
                switch (xhr.status) {
                    case 400:
                        errorMessage = 'Error: Missing or unvalid Data';
                        break;
                    case 401:
                        errorMessage = 'Wrong Username or password ';
                        break;
                    case 403:
                        errorMessage = 'No premssions';
                        break;
                    case 404:
                        errorMessage = "User creation failed, change credntials!";
                        break;
                    case 500:
                        errorMessage = 'Server error try again';
                        break;
                    default:
                        errorMessage = ' Unexpected error : ' + (xhr.responseJSON ? xhr.responseJSON.error : error);
                }
                $('#signin-message').text(errorMessage).css('color', 'red');
                
                console.error('Signin Error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
            },
            complete: function() {
                console.log('Sign in attempt completed');
            }
        });
    });
});

// Initialize nav-username click handling on page load
$(document).ready(function() {
    // Global click handler for nav-username
    $(document).on('click', '.nav-username a', function(e) {
        e.preventDefault();
        if (!Cookies.get('userHash')) {
            alert('Please log in first');
            return;
        }
        window.location.href = 'user.html';
    });
});
//Search 
$('#search-btn').on('click', () => {
    const searchContent = $('.search-bar input[type="text"]').val();
    console.log("searched for: ",searchContent)
    
    // Redirect to categories page with search parameter
    window.location.href = `categories.html?search=${encodeURIComponent(searchContent)}`;
});

// function to handle search on categories page load
$(document).ready(function() {
    if (window.location.pathname.includes('categories.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        
        if (searchTerm) {
            // Update the search bar with the search term
            $('#search-bar-text').val(decodeURIComponent(searchTerm));
            
            // Make the API call to search
            $.ajax({
                url: config.backendURL + config.routes['/api/products/load'],
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({Category: searchTerm }),
                success: function(response) {
                    console.log('Search results:', response);
                    
                    // Clear existing products
                    $('#products-grid').empty();
                    
                    if (response && Array.isArray(response)) {
                        if (response.length === 0) {
                            $('#products-grid').html('<p>No products found matching your search.</p>');
                        } else {
                            // Use existing createProductElement function
                            response.forEach(product => {
                                createProductElement(product);
                            });
                        }
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Search Error:', error);
                    $('#products-grid').html('<p>Error loading search results. Please try again.</p>');
                }
            });
        }
    }
});
//loading Tablets
$('#tablets-gif').on('click', () => {
    var category = 'tablets'
    $.ajax({
        url: config.backendURL+config.routes['/api/products/load'],
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({Category:category}),
        success: function(xhr) {
            console.log('Loading products for category:',category);
            var products=xhr
            if (Array.isArray(products)) {
                console.log('Products array:', products.name);
                $('#products-grid').empty();
                products.forEach(product => {
                    console.log('Creating product:', product.name);
                    createProductElement(product);
                });
            }
            
        },
        error: function(xhr, status, error) {
            console.error('Error loading products:', error);
        }
    });});
//loading Elctronics
$('#electronics-gif').on('click', () => {
     var category = 'electronics'
    $.ajax({
        url: config.backendURL+config.routes['/api/products/load'],
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({Category:category}),
        success: function(xhr) {
            console.log('Loading products for category:',category);
            var products = xhr
            if (Array.isArray(products)) {
                console.log('Products array:', products.name);
                $('#products-grid').empty();
                products.forEach(product => {
                    console.log('Creating product:', product.name);
                    createProductElement(product);
                });
            }
            
        },
        error: function(xhr, status, error) {
            console.error('Error loading products:', error);
        }
    });});
//loading Smartphones
$('#phones-gif').on('click', () => {
    var category = 'smartphones'
    $.ajax({
        url: config.backendURL+config.routes['/api/products/load'],
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({Category: category}),
        success: function(xhr) {
            console.log('Loading products for category:',category);
            var products = xhr
            if (Array.isArray(products)) {
                console.log('Products array:', products.name);
                $('#products-grid').empty();
                products.forEach(product => {
                    console.log('Creating product:', product.name);
                    createProductElement(product);
                });
            }
            
        },
        error: function(xhr, status, error) {
            console.error('Error loading products:', error);
        }
    });});
//loading computers
$('#computers-gif').on('click', () => {
    var category = 'computers'
    $.ajax({
        url: config.backendURL+config.routes['/api/products/load'],
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({Category: category}),
        success: function(xhr) {
            console.log('Loading products for category:',category);
            var products = xhr
            if (Array.isArray(products)) {
                console.log('Products array:', products.name);
                $('#products-grid').empty();
                products.forEach(product => {
                    console.log('Creating product:', product.name);
                    createProductElement(product);
                });
            }
            
        },
        error: function(xhr, status, error) {
            console.error('Error loading products:', error);
        }
    });});
//Loading TVs
$('#tv-gif').on('click', () => {
    var category = 'television'
    $.ajax({
        url: config.backendURL+config.routes['/api/products/load'],
        method:'POST',
        contentType: 'application/json',
        data: JSON.stringify({Category: category}),
        success: function(xhr) {
            console.log('Loading products for category:',category);
            var products = xhr
            if (Array.isArray(products)) {
                console.log('Products array:', products.name);
                $('#products-grid').empty();
                products.forEach(product => {
                    console.log('Creating product:', product.name);
                    createProductElement(product);
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading products:', error);
        }
    });});
//Create a product 
function createProductElement(product) {
    if (product.img_url == null){
        product.img_url = './images/logo.png'
    }
    console.log("the img ", product.img_url)
    if (product.quantity !== 0){
            return $('#products-grid').append(`
            <div class="product-grid" id="product_${product.id}">
                <h3>${product.name}</h3>
                <img src="${product.img_url}" alt="${product.name}">
                <div class="product-info-grid" id="${product.name}-grid-info">
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p> 
                </div>
                <div class="product-controller-grid" id="${product.name}-grid-content">
                    <div class="quantity-grid">
                        <button class="add-quantity" id="plus">+</button>
                        <span class="quantity-display">0</span>
                        <button class="subtract-quantity" id="minus">-</button>
                    </div>
                    <button class="add-to-cart"id="${product.id}">Add to Cart</button>
                    <p></p>
                </div>
        </div>`);}
}
// Handle quantity changes
$(document).on('click', '.product-grid .add-quantity, .product-grid .subtract-quantity', function() {
    let $button = $(this);
    let $productGrid = $button.closest('.product-grid');
    let $quantityDisplay = $productGrid.find('.quantity-display');
    let currentQuantity = parseInt($quantityDisplay.text() || '0');
    
    if ($button.attr('id') === 'plus') {
        currentQuantity++;
    } else {
        currentQuantity = Math.max(0, currentQuantity - 1);
    }
    
    $quantityDisplay.text(currentQuantity);
});
//post a tweet
$('.tweet-button').on('click', () => {
    const content= $("#tweetContent").val()
    console.log("Your content for the tweet: ",content)
    $.ajax({
        url: config.backendURL+config.routes['/api/post-tweet'],
        method:'POST',
        contentType: 'application/json',
        data: JSON.stringify({content:content}),
        success: function(xhr) {
            console.log('sending tweet:',content);
        },
        error: function(xhr, status, error) {
            console.error('Error tweeting:', error);
        }
    });});
//Add to Cart 
$(document).on('click', '.add-to-cart', function() {
    let $button = $(this);
    let $productGrid = $button.closest('.product-grid');
    let Product_id = $productGrid.attr('id').split('_')[1];
    let quantity = parseInt($productGrid.find('.quantity-display').text() || '0');
    
    if (quantity === 0) {
        alert('Please select quantity first');
        return;
    }
    
    let userHash = localStorage.getItem('userHash');
    
    if (!userHash) {
        alert('Please log in first');
        return;
    }

    console.log('Adding to cart:', {
        Product_id: Product_id,
        quantity: quantity,
        userHash: userHash
    });

    $.ajax({
        url: config.backendURL + config.routes['/api/cart/add'],
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            Product_id: Product_id,
            User_hash: userHash,
            Product_quantity: quantity  
        }),
        success: function(response) {
            console.log('Success Response:', response);            
            $productGrid.find('.quantity-display').text('0');
            
            if (response) {
                response.quantity = quantity;
                updateCartUI(response);
                saveCartData(response);
                $productGrid.find('.product-controller-grid p').text('Added to cart successfully!').css('color', 'green');
                console.log('Added to cart successfully!' );
            }
        },
        error: function(xhr, status, errorThrown) {
            console.error('AJAX Error:', {
                status: status,
                errorThrown: errorThrown,
                responseText: xhr.responseText
            });
            
            $('.product-controller-grid #'+ Product_id +'p').text('Error updating cart: ' + (xhr.responseJSON?.message || 'Unknown error'))
                        .css('color', 'red');
    
        }
    });
});

function updateCartUI(product) {
    if (product.img_url == null) {
        product.img_url = './images/logo.png';
    }

    $('#cart-items').append(`
        <div class="cart-item" data-product-id="${product._id}">
            <img src="${product.img_url}" alt="${product.name}" 
                 onerror="this.src='./images/logo.png'">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <div class="quantity-display">
                Quantity: ${product.quantity}
            </div>
            <button class="remove-from-cart">Remove</button>
        </div>
    `);
}

function saveCartData(product) {
    try {
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
        
        if (existingItemIndex >= 0) {
            cartItems[existingItemIndex].quantity += product.quantity;
        } else {
            cartItems.push(product);
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        updateCartCount(cartItems);
    } catch (error) {
        console.error('Error saving cart data:', error);
    }
}

// Add a function to update cart count display
function updateCartCount(cartItems) {
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    // If you have a cart count element, update it
    $('.cart-count').text(totalItems);
}

//cart class
const Cart = {
    state: {
        items: null,
        sum_price: 0,
        userHash: () => Cookies.get('userHash'),
        message: null
    },

    api: {
        async request(endpoint, data) {
            try {
                return await $.ajax({
                    url: config.backendURL + config.routes[endpoint],
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ User_hash: Cart.state.userHash(), ...data })
                });
            } catch (error) {
                console.error(`Cart API Error (${endpoint}):`, error);
                throw error;
            }
        },

        fetch: () => Cart.api.request('/api/cart/view'),
        remove: (Product_id,User_hash) => Cart.api.request('/api/cart/remove', { Product_id:Product_id,User_hash:User_hash }),
        checkout: (User_hash) => Cart.api.request('/api/cart/checkout', {User_hash:User_hash })
    },

    ui: {
        templates: {
            item: (item) => `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.img_url || './images/logo.png'}" 
                             alt="${item.name || 'Product'}"
                             onerror="this.src='./images/logo.png'">
                    </div>
                    <div class="item-details">
                        <h3>${item.name || 'Unnamed Product'}</h3>
                        <p class="description">${item.description || ''}</p>
                        <p class="price">Price: $${(item.price || 0).toFixed(2)}</p>

                        <button class="remove-item">Remove from Cart</button>
                    </div>
                </div>`,

            summary: (items , sum_price) => {
                const totals = items.reduce((acc, item) => ({
                    items: items.length,
                    price: sum_price
                }), { items: 0, price: 0 });
            

                return `
                    <div class="cart-summary">
                        <h3>Order Summary</h3>
                        <div class="summary-details">
                            <div class="summary-row">
                                <span>Total Items:</span>
                                <span>${totals.items}</span>
                            </div>
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span>$${totals.price}</span>
                            </div>
                            <div class="summary-row">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span>$${totals.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <button  popovertarget="recipt" id="checkout-button" class="cta-button">
                            Proceed to Checkout
                        </button>
                    </div>`;
            },

            receipt: (message) => `
            <div class="receipt-content">
                <h3>Order Receipt</h3>
                <div class="receipt-message">
                    <p>Hello, ${message.full_name}</p>
                    <p>Your payment for $${message.sum}</p>
                    <p>was completed</p>
                    <p>Thank you, come again!</p>
                </div>
                <button class="close-receipt">Close</button>
            </div>
        `
        },

        render() {
            if (!Cart.state.items || !Cart.state.items.length) {
                $('main').html('<div class="empty-cart">Your cart is empty</div>');
                return;
            }

            $('main').html(`
                <section class="page" id="cart-page">
                    <h2>Your Cart</h2>
                    <div class="cart-container">
                        <div class="cart-items">
                            ${Cart.state.items.map(item => Cart.ui.templates.item(item)).join('')}
                        </div>
                        ${Cart.ui.templates.summary(Cart.state.items,Cart.state.sum_price)}
                    </div>
                </section>`
            );
        },
        showMessage(message, isError = false) {
            const messageElement = $(`<div class="message ${isError ? 'error' : 'success'}">Thank you for buying ${message.full_name}, Your Total amount is ${message.sum}$</div>`);
            $('body').append(messageElement);
            setTimeout(() => messageElement.fadeOut(() => messageElement.remove()), 3000);
        },
    
    },

    async init() {
        if (!Cart.state.userHash()) {
            alert('Please log in to view your cart');
            return false;
        }

        try {
            const response = await Cart.api.fetch();
            console.log("this response.data ",response.data.products)
            Cart.state.items = response.data.products; 
            Cart.state.sum_price = response.data.sum_price;
            Cart.ui.render();
            return true;
        } catch (error) {
            console.error('Failed to load cart:', error);
            alert('Failed to load cart');
            return false;
        }
    },

    bindEvents() {
        // Remove item
        $(document).on('click', '.remove-item', async function() {
            const Product_id = $(this).closest('.cart-item').data('product-id');
            const User_hash = Cookies.get("userHash")
            try {
                await Cart.api.remove(Product_id,User_hash);
                const response = await Cart.api.fetch(Product_id,User_hash);
                // Handle array response after removal
                Cart.state.items = response.data.products;
                Cart.state.sum_price = response.data.sum_price;
                Cart.ui.render();
            } catch (error) {
                console.error('Failed to remove item:', error);
                alert('Failed to remove item');
            }
        });

        //Checkout 
        $(document).on('click', '#checkout-button', async function() {
            console.log("Checkout button clicked");
            const User_hash = Cookies.get("userHash");
            try {
                const response = await Cart.api.checkout(User_hash);
                console.log("Checkout response:", response);
                
                if (response && response.reception) {
                    // Clear cart state after successful checkout
                    Cart.state.items = [];
                    Cart.state.sum_price = 0;
                    Cart.ui.showMessage(response.reception);
                    setTimeout(() => {
                        Cart.ui.render();
                    }, 60);
                    
                } else {
                    throw new Error('Invalid checkout response');
                }
            } catch (error) {
                console.error('Checkout failed:', error);
                alert('Checkout failed. Please try again.');
            }
        });
        
        // Add this close receipt handler
        $(document).on('click', '.close-receipt', function() {
            $('#recipt').hide();
        });

        // Cart link
        $('a[href="cart.html"]').on('click', async function(e) {
            e.preventDefault();
            if (await Cart.init()) {
                window.location.href = 'cart.html';
            }
        });
    }
};

// Initialize cart
$(document).ready(async function() {
    if (window.location.pathname.includes('cart.html')) {
        await Cart.init();
    }
    Cart.bindEvents();
});

const User = {
    state: {
        userInfo: null,
        userHash: () => Cookies.get('userHash'),
        isEditing: false
    },

    api: {
        async request(endpoint, data) {
            try {
                return await $.ajax({
                    url: config.backendURL + config.routes[endpoint],
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ User_hash: User.state.userHash(), ...data })
                });
            } catch (error) {
                console.error(`User API Error (${endpoint}):`, error);
                throw error;
            }
        },

        fetchUserInfo: () => User.api.request('/api/user/view'),
        updateUserInfo: (userData) => User.api.request('/api/user/update', userData),
    },

    ui: {
        templates: {
            userInfo: (user, isEditing) => `
                <section class="page" id="user-page">
                    <h2>User Profile</h2>
                    <div class="user-container">
                        <div class="user-info">
                            <div class="user-details">
                                <form id="user-form" class="user-form" ${isEditing ? '' : 'disabled'}>
                                    <div class="form-group">
                                        <label>Username:</label>
                                        <input type="text" 
                                               value="${user.username || ''}" 
                                               disabled 
                                               class="form-control"
                                               title="Username cannot be changed">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>First Name:</label>
                                        <input type="text" 
                                               name="First_name" 
                                               value="${user.first_name || ''}" 
                                               ${isEditing ? '' : 'disabled'}
                                               class="form-control">
                                    </div>

                                    <div class="form-group">
                                        <label>Last Name:</label>
                                        <input type="text" 
                                               name="Last_name" 
                                               value="${user.last_name || ''}" 
                                               ${isEditing ? '' : 'disabled'}
                                               class="form-control">
                                    </div>

                                    <div class="form-group">
                                        <label>Email:</label>
                                        <input type="email" 
                                               name="Email" 
                                               value="${user.email || ''}" 
                                               ${isEditing ? '' : 'disabled'}
                                               class="form-control">
                                    </div>

                                    <div class="form-group">
                                        <label>Birth Date:</label>
                                        <input type="date" 
                                               name="Birth_date" 
                                               value="${user.birth_date || ''}" 
                                               ${isEditing ? '' : 'disabled'}
                                               class="form-control">
                                    </div>

                                    <div class="form-group">
                                        <label>Role:</label>
                                        <input type="text"
                                                name="Role" 
                                               value="${user.role || ''}" 
                                               disabled 
                                               class="form-control"
                                               title="Role cannot be changed">
                                    </div>

                                    <div class="form-actions">
                                        ${isEditing ? `
                                            <button type="submit" class="save-button">Save Changes</button>
                                            <button type="button" class="cancel-button">Cancel</button>
                                        ` : `
                                            <button type="button" class="edit-button">Edit Profile</button>
                                        `}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>`
        },

        render() {
            if (!User.state.userInfo) {
                $('main').html('<div class="loading">Loading user information...</div>');
                return;
            }
            $('main').html(User.ui.templates.userInfo(User.state.userInfo, User.state.isEditing));
        },

        showMessage(message, isError = false) {
            const messageElement = $(`<div class="message ${isError ? 'error' : 'success'}">${message}</div>`);
            $('main').prepend(messageElement);
            setTimeout(() => messageElement.fadeOut(() => messageElement.remove()), 3000);
        }
    },

    async init() {
        if (!User.state.userHash()) {
            alert('Please log in to view your profile');
            return false;
        }

        try {
            const response = await User.api.fetchUserInfo();
            User.state.userInfo = response.data.user_data;
            User.ui.render();
            return true;
        } catch (error) {
            console.error('Failed to load user information:', error);
            alert('Failed to load user information');
            return false;
        }
    },

    bindEvents() {
        // Edit button click
        $(document).on('click', '.edit-button', function(e) {
            e.preventDefault();
            User.state.isEditing = true;
            User.ui.render();
        });

        // Cancel button click
        $(document).on('click', '.cancel-button', function(e) {
            e.preventDefault();
            User.state.isEditing = false;
            User.ui.render();
        });

        // Form submission
        $(document).on('submit', '#user-form', async function(e) {
            e.preventDefault();
            const form = $(this);
            console.log("The user hash after update is: ",User.state.userInfo.hash)
            const formData = {
                User_hash: User.state.userInfo.hash,
                First_name: form.find('[name="First_name"]').val(),
                Last_name: form.find('[name="Last_name"]').val(),
                Email: form.find('[name="Email"]').val(),
                Birth_date: form.find('[name="Birth_date"]').val(),
                Role: User.state.userInfo.role
            }
            try {
                console.log()
                await User.api.updateUserInfo(formData);
                User.state.userInfo = { ...User.state.userInfo, ...formData };
                User.state.isEditing = false;
                User.ui.render();
                User.ui.showMessage('Profile updated successfully!');
                console.log("user data sent ",User.state.userInfo)
            } catch (error) {
                console.error('Failed to update profile:', error);
                User.ui.showMessage('Failed to update profile. Please try again.', true);
            }
        });
    }
};

// Initialize user module
$(document).ready(async function() {
    if (window.location.pathname.includes('user.html')) {
        await User.init();
    }
    User.bindEvents();
});

const Admin = {
    state: {
        users: null,
        products: null,
        userHash: () => Cookies.get('userHash')
    },

    api: {
        async request(endpoint, data) {
            try {
                return await $.ajax({
                    url: config.backendURL + config.routes[endpoint],
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ User_hash: Admin.state.userHash(), ...data })
                });
            } catch (error) {
                console.error('Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    responseText: error.responseText
                });

                throw error;
            }
        },

        fetchUsers: () => Admin.api.request('/api/admin/users/view'),
        deleteUser: (hash) => Admin.api.request('/api/admin/users/delete', { hash }),
        updateUserRole: (hash, Role) => Admin.api.request('/api/admin/users/update-role', { hash, Role }),
        addProduct: (productData) => Admin.api.request('/api/admin/products/add', productData),
        deleteProduct: (deleteData) => Admin.api.request('/api/admin/products/delete', deleteData),
        fetchSalesStats: () => $.ajax({
            url: config.backendURL + config.routes['/api/stats'],
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({})
        }),
    },

    ui: {
        templates: {
            userManagement: (users) => `
                <div class="show-bar">
                    <h2>User Management</h2>
                    <div class="users-grid">
                        ${users.map(user => `
                             <div class="user-item" 
                                 data-user-id="${user._id}"
                                 data-hash="${user.hash}"
                                 data-username="${user.username}">
                                <h3>${user.username}</h3>
                                <p>Role: 
                                    <select class="role-select">
                                        <option value="costumer" ${user.role === 'costumer' ? 'selected' : ''}>User</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </p>
                                <button class="delete-user">Delete User</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,

            supplyManagement: () => `
                <div class="show-bar">
                    <h2>Supply Management</h2>
                    <form id="add-product-form" class="auth-form">
                        <h3>Manage Products</h3>
                        <div class="form-group">
                            <label for="product-name">Product Name:</label>
                            <input type="text" id="product-name" name="Name" placeholder="Product Name" required>
                        </div>
                        <div class="form-group">
                            <label for="product-price">Price:</label>
                            <input type="number" id="product-price" name="Price" placeholder="Price" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="product-vendor">Vendor:</label>
                            <input type="text" id="product-vendor" name="Vendor" placeholder="Vendor" required>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Description:</label>
                            <textarea id="product-description" name="Description" placeholder="Description" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Category:</label>
                            <select id="product-category" name="Category" required>
                                <option value="">Select Category</option>
                                <option value="computers">Computers</option>
                                <option value="smartphones">Smartphones</option>
                                <option value="tablets">Tablets</option>
                                <option value="television">Television</option>
                                <option value="electronics">Electronics</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-quantity">Quantity:</label>
                            <input type="number" id="product-quantity" name="Quantity" placeholder="Quantity" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="product-image">Image URL:</label>
                            <input id="product-image" name="Img_url" placeholder="Image URL">
                        </div>
                       <div class="form-actions">
                            <button type="submit" id="add-product-form">Add Product</button>
                            <button type="button" id="delete-product-btn" class="delete-button">Delete Product</button>
                        </div>
                    </form>
                     <div class="statistics-section">
                        <h3>Products Statistics</h3>
                        <div class="chart-container">
                            <canvas id="vendorChart"></canvas>
                        </div>
                    </div>
                    <div id="products-grid">
                        <!-- Products will be loaded here -->
                    </div>
                </div>
            `
        },

        showMessage(message, isError = false) {
            const messageElement = $(`<div class="message ${isError ? 'error' : 'success'}">${message}</div>`);
            $('body').append(messageElement);
            setTimeout(() => messageElement.fadeOut(() => messageElement.remove()), 3000);
        },

        async renderSalesChart() {
            try {
                const response = await Admin.api.fetchSalesStats();
                console.log("Raw response from stats:", response);
                
                if (!response || !response.data || !Array.isArray(response.data)) {
                    console.error('Invalid data format received:', response);
                    Admin.ui.showMessage('Invalid data format received from server', true);
                    return;
                }
        
                // Combine counts for same vendors with different capitalizations
                const normalizedData = response.data.reduce((acc, item) => {
                    const normalizedId = item._id.toLowerCase();
                    if (!acc[normalizedId]) {
                        acc[normalizedId] = {
                            _id: item._id,
                            count: 0
                        };
                    }
                    acc[normalizedId].count += item.count;
                    return acc;
                }, {});
        
                // Convert back to array
                const processedData = Object.values(normalizedData);
                
                console.log("Processed data:", processedData);
                
                const labels = processedData.map(item => item._id);
                const values = processedData.map(item => item.count);
                
                console.log("Labels:", labels);
                console.log("Values:", values);
        
                const ctx = document.getElementById('vendorChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Number of Products by Vendor',
                            data: values,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Products'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Vendor'
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Products by Vendor'
                            },
                            legend: {
                                position: 'top'
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to load sales statistics:', error);
                Admin.ui.showMessage('Failed to load sales statistics', true);
            }
        },

        async renderSupplyManagement() {
        $('.page').html(Admin.ui.templates.supplyManagement());
        await Admin.ui.renderSalesChart(); // Add this line
         },

         async renderUserManagement() {
            $('.page').html(Admin.ui.templates.userManagement(Admin.state.users));},
         

    },

    async init() {
        const userRole = Cookies.get('userRole')?.toLowerCase();
        if (!userRole || (userRole !== 'admin' && userRole !== 'supplier')) {
            window.location.href = 'index.html';
            return false;
        }

        if (window.location.pathname.includes('user-management.html')) {
            try {
                const response = await Admin.api.fetchUsers();
                console.log("Users loading ",response.data)
                Admin.state.users = response.data;
                Admin.ui.renderUserManagement(Admin.state.users);
            } catch (error) {
                console.error('Failed to load users:', error);
                Admin.ui.showMessage('Failed to load users', true);
            }
        } else if (window.location.pathname.includes('supply-management.html')) {
            Admin.ui.renderSupplyManagement();
        }

        return true;
    },

    bindEvents() {
        // User management events
        $(document).on('change', '.role-select', async function() {
            const $userItem = $(this).closest('.user-item');
            const hash = $userItem.data('hash');
            const username = $userItem.data('username');
            const Role = $(this).val();

            console.log('Updating user role:', {
                hash,
                username,
                Role
            });
            try {
                console.log("changing user role for user ",username," to role ",Role)
                await Admin.api.updateUserRole(hash, Role);
                Admin.ui.showMessage('User role updated successfully');
            } catch (error) {
                Admin.ui.showMessage('Failed to update user role', true);
            }
        });

        $(document).on('click', '.delete-user', async function() {
            if (!confirm('Are you sure you want to delete this user?')) return;
            
            const $userItem = $(this).closest('.user-item');
            const User_hash = $userItem.data('hash');
            const username = $userItem.data('username');
            try {
                console.log("Deleting user ",username)
                await Admin.api.deleteUser(User_hash);
                $(this).closest('.user-item').remove();
                Admin.ui.showMessage('User deleted successfully');
            } catch (error) {
                Admin.ui.showMessage('Failed to delete user', true);
            }
        });

        // Supply management add
        $(document).on('submit', '#add-product-form', async function(e) {
            e.preventDefault();
            
            // Get all form inputs
            const form = $(this);
            const formData = {
                User_hash: Admin.state.userHash(),
                Name: $('#product-name').val(),
                Price: parseFloat($('#product-price').val()),
                Vendor: $('#product-vendor').val(),
                Description: $('#product-description').val(),
                Category: $('#product-category').val(),
                Quantity: parseInt($('#product-quantity').val()),
                Img_url: $('#product-image').val() || null
            };

            // Debug log to check form values
            console.log('Form values before validation:', formData);

            // Explicit validation for each required field
            const requiredFields = ['Name', 'Price', 'Vendor', 'Description', 'Category', 'Quantity'];
            const missingFields = requiredFields.filter(field => {
                const value = formData[field];
                return value === '' || value === null || value === undefined || Number.isNaN(value);
            });

            if (missingFields.length > 0) {
                console.log('Missing fields:', missingFields);
                Admin.ui.showMessage(`Please fill in the following fields: ${missingFields.join(', ')}`, true);
                return;
            }

            try {
                console.log('Sending product data:', formData);
                const response = await Admin.api.addProduct(formData);
                console.log('Server response:', response);
                Admin.ui.showMessage('Product added successfully');
                form[0].reset();
            } catch (error) {
                console.error('Error adding product:', error);
                Admin.ui.showMessage('Failed to add product: ' + (error.responseJSON?.message || error.message || 'Unknown error'), true);
            }
        });

        // Supply management delete
        $(document).on('click', '#delete-product-btn', async function() {
            const name  = $('#product-name').val();
            const vendor = $('#product-vendor').val();
            const category = $('#product-category').val();
            
            if (!vendor || !category) {
                Admin.ui.showMessage('Please enter Vendor and Category', true);
                return;
            }
        
            if (!confirm('Are you sure you want to delete this product?')) return;
            
            try {
                console.log("Deleting the Product",{
                    Name: name,
                    Vendor: vendor,
                    Category: category
                })
                await Admin.api.deleteProduct({
                    Name: name,
                    Vendor: vendor,
                    Category: category
                });
                
                // Clear the form
                $('#add-product-form')[0].reset();
                Admin.ui.showMessage('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                Admin.ui.showMessage('Failed to delete product', true);
            }
        });
    }
};

// Initialize admin features
$(document).ready(async function() {
    if (window.location.pathname.includes('supply-management.html') || 
        window.location.pathname.includes('user-management.html')) {
        await Admin.init();
        Admin.bindEvents();
    }
});