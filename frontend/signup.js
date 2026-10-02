const form = document.getElementById('signup-form');
const errorDiv = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Hide error on new submit
  errorDiv.classList.add('d-none');
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await axios.post('http://localhost:3000/user/signup', {
      username, email, password
    });

    if (response.status === 201) {
      // Auto-login the user
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = 'index.html'; 
    }
  } catch (error) {
    errorDiv.classList.remove('d-none');
    if (error.response && error.response.status === 409) {
      errorDiv.textContent = 'You already have an account, please login';
      // Redirect after reading message
      setTimeout(() => window.location.href = 'login.html', 2500);
    } else {
      console.error(error);
      errorDiv.textContent = 'Error signing up';
    }
  }
});
