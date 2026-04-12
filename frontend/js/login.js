document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    if (email === "demo" && password === "demo") {
        localStorage.setItem('token', 'mock-token-for-demo-only');
        localStorage.setItem('role', 'admin'); 
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); // Lưu token thật từ server
            localStorage.setItem('role', data.user.role); // Lưu role thật
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.innerText = data.message || "Invalid email or password!";
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.innerText = "Server is offline. Please use demo/demo to test.";
        errorMessage.style.display = 'block';
    }
});