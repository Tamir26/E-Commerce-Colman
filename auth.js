$(document).ready(function() {
    // Check login status on every page load
    function checkLoginStatus() {
        const userHash = Cookies.get('userHash');
        const username = Cookies.get('username');
        
        if (userHash && username) {
            // User is logged in
            $('.nav-username').html(`<a href="user.html">Hello, ${username}</a>`);
            $('#login').hide();
            $('#sign-in').hide();
            // Add logout button if it doesn't exist
            if (!$('#logout').length) {
                $('.auth-input').append('<a id="logout">Logout</a>');
            }
        } else {
            // User is not logged in
            $('.nav-username').html(`<a href="user.html">Welcome, Guest</a>`);
            $('#login').show();
            $('#sign-in').show();
            $('#logout').remove();
        }

        // Handle nav-username clicks
        $('.nav-username a').off('click').on('click', function(e) {
            e.preventDefault();
            if (!Cookies.get('userHash')) {
                alert('Please log in first');
                return;
            }
            window.location.href = 'user.html';
        });
    }
    function updateNavByRole() {
        const userRole = Cookies.get('userRole');
        
        // Remove any existing role-based nav items first
        $('.role-based-nav').remove();
        
        if (userRole === 'Admin') {
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
    }

    // Check status immediately
    checkLoginStatus();

    // Global event delegation for nav-username clicks
    $(document).on('click', '.nav-username a', function(e) {
        e.preventDefault();
        if (!Cookies.get('userHash')) {
            alert('Please log in first');
            return;
        }
        window.location.href = 'user.html';
    });

    // Handle logout
    $(document).on('click', '#logout', function() {
        $.ajax({
            url: ['http://172.20.10.2:696/user/logout'],
            method:'POST',
            contentType: 'application/json',
            data: JSON.stringify({User_hash: Cookies.get("userHash")}),
            success: function() {
                console.log('Login Out: ',Cookies.get("userHash"));
            },
            error: function(xhr, status, error) {
                console.error('Login Out:', error);
            }
        });
        // Remove cookies with explicit path
        Cookies.remove('userHash', { path: '/' });
        Cookies.remove('username', { path: '/' });
        Cookies.remove('userRole', { path: '/' });
        
        // Clear localStorage
        localStorage.removeItem('userHash');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        
        checkLoginStatus();
        window.location.href = 'index.html';
    });
});