const errorToast = document.getElementById("error-toast");
const errorToastMsg = document.getElementById("error-toast-msg");
let errorToastTimer = null;

function showError(message, duration = 5000) {
  if (errorToastTimer) clearTimeout(errorToastTimer);
  errorToastMsg.textContent = message;
  errorToast.classList.add("show");
  if (duration > 0) {
    errorToastTimer = setTimeout(() => hideError(), duration);
  }
}

function hideError() {
  errorToast.classList.remove("show");
  if (errorToastTimer) {
    clearTimeout(errorToastTimer);
    errorToastTimer = null;
  }
}
