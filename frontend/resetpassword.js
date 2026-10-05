document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const resetId = urlParams.get('id');

  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  const successState = document.getElementById('success-state');
  const successMessage = document.getElementById('success-message');
  const resetForm = document.getElementById('reset-password-form');

  if (!resetId) {
    loadingState.classList.add('d-none');
    errorState.classList.remove('d-none');
    errorMessage.textContent = 'Invalid or missing reset token. Your URL is: ' + window.location.href;
    return;
  }

  try {
    // Verify if the link is still valid and active
    const response = await axios.get(`http://localhost:3000/password/resetpassword/${resetId}`);
    
    if (response.data.success) {
      loadingState.classList.add('d-none');
      resetForm.classList.remove('d-none');
    }
  } catch (error) {
    loadingState.classList.add('d-none');
    errorState.classList.remove('d-none');
    errorMessage.textContent = error.response?.data?.message || 'The reset link is invalid or has expired.';
  }

  // Handle form submission
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newpassword = document.getElementById('newpassword').value;
    
    try {
      const res = await axios.post(`http://localhost:3000/password/updatepassword/${resetId}`, { newpassword });
      
      resetForm.classList.add('d-none');
      successState.classList.remove('d-none');
      successMessage.textContent = res.data.message || 'Successfully updated the password. You can now login.';
    } catch (err) {
      resetForm.classList.add('d-none');
      errorState.classList.remove('d-none');
      errorMessage.textContent = err.response?.data?.message || 'Something went wrong updating your password.';
    }
  });
});
