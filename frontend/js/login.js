document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Fallback nếu API_BASE_URL chưa được định nghĩa
    const BASE = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:3001/api';

    // Cho phép demo offline
    if (email === 'demo' && password === 'demo') {
        localStorage.setItem('token', 'mock-token-for-demo-only');
        localStorage.setItem('role', 'admin');
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const response = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', 'admin');
            window.location.href = 'dashboard.html';  // dòng này sẽ chạy
        } else {
            errorMessage.innerText = data.error || data.message || 'Sai email hoặc mật khẩu!';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.innerText = 'Không kết nối được server. Hãy thử lại!';
        errorMessage.style.display = 'block';
    }
});