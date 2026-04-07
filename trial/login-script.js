// Grab Form Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const subtitle = document.getElementById('auth-subtitle');

// Initialize the JSON Database in LocalStorage if it doesn't exist
if (!localStorage.getItem('burnWatch_Users')) {
    localStorage.setItem('burnWatch_Users', JSON.stringify([]));
}

// UI Toggle between Login and Register
function toggleAuthMode() {
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        subtitle.innerText = "Welcome back. Please log in.";
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        subtitle.innerText = "Create a new account.";
    }
}

// 1. REGISTRATION LOGIC
registerForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page refresh
    
    const userVal = document.getElementById('reg-username').value.trim();
    const passVal = document.getElementById('reg-password').value.trim();
    
    // Parse the JSON array of users
    let users = JSON.parse(localStorage.getItem('burnWatch_Users'));
    
    // Check if username is taken
    const userExists = users.find(u => u.username === userVal);
    if (userExists) {
        alert("Username already exists! Please choose another.");
        return;
    }

    // Add new user to database
    users.push({ username: userVal, password: passVal });
    localStorage.setItem('burnWatch_Users', JSON.stringify(users));
    
    // Automatically log them in and redirect
    localStorage.setItem('burnWatch_ActiveSession', userVal);
    alert("Registration successful! Taking you to BurnWatch.");
    window.location.href = 'index.html'; // REDIRECT TO DASHBOARD
});

// 2. LOGIN LOGIC
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userVal = document.getElementById('login-username').value.trim();
    const passVal = document.getElementById('login-password').value.trim();
    
    // Parse the JSON array of users
    let users = JSON.parse(localStorage.getItem('burnWatch_Users'));
    
    // Check credentials
    const validUser = users.find(u => u.username === userVal && u.password === passVal);
    
    if (validUser) {
        // Set active session and redirect
        localStorage.setItem('burnWatch_ActiveSession', userVal);
        window.location.href = 'index.html'; // REDIRECT TO DASHBOARD
    } else {
        alert("Invalid username or password.");
    }
});