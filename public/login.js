// public/login.js
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem('authToken', data.token); // Store token in localStorage
            window.location.href = '/admin'; // Redirect to admin page
        }
    })
    .catch(err => {
        alert(err.message);
        console.error('Error:', err);
    });
});

// document.getElementById('logout-button').addEventListener('click', function () {
//     localStorage.removeItem('token'); // Remove token from localStorage
//     window.location.href = '/'; // Redirect to login page
// });

// Check if token exists before accessing protected routes
window.onload = function () {
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname === '/admin') {
        window.location.href = '/'; // Redirect to login if not authenticated
    }
};


// Forgot Password Logic
document.getElementById('forgot-password').addEventListener('click', function () {
    const modal = document.getElementById('otp-popup');
    modal.style.display = 'block';

    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

document.getElementById('send-otp').addEventListener('click', function () {
    const email = document.getElementById('email').value;

    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);  // Log the entire response
        if (data.message) {
            alert(data.message);
            if (data.message === 'OTP sent to your email.') {
                document.getElementById('otp').style.display = 'block';
                document.getElementById('new-password').style.display = 'block';
                document.getElementById('confirm-password').style.display = 'block';
                document.getElementById('update-password').style.display = 'block';
            }
        } else if (data.error) {
            alert(data.error);  // Show error message if exists
        }
    })
    .catch(err => console.error('Error:', err));
});

document.getElementById('update-password').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    fetch('/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === 'Password updated successfully.') {
            document.getElementById('otp-popup').style.display = 'none'; // Close the modal
        }
    })
    .catch(err => console.error('Error:', err));
});

