const form = document.getElementById('login-form');
const errorDiv = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Hide error on new submit
  errorDiv.classList.add('d-none');
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await axios.post('http://localhost:3000/user/login', {
      email, password
    });

    if (response.status === 200) {
      // Optional: store user details in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Redirect to main expense tracker page
      window.location.href = 'index.html'; 
    }
  } catch (error) {
    errorDiv.classList.remove('d-none');
    if (error.response && (error.response.status === 404 || error.response.status === 401)) {
      errorDiv.textContent = 'Credentials are incorrect';
    } else {
      console.error(error);
      errorDiv.textContent = 'Error logging in';
    }
  }
});
