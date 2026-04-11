document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    
    const errorMessage = document.getElementById('errorMessage');

    const demoEmail = "demo";
    const demoPassword = "demo"; 
    
    if (emailInput === demoEmail && passwordInput === demoPassword) {
        errorMessage.style.display = 'none';
        window.location.href = 'dashboard.html';
        
    } else {
        errorMessage.style.display = 'block';
        
    }
});