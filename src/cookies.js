// Function to set a cookie
function setCookie(name, value, minutes) {
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + minutes * 60 * 1000);
  const cookieValue =
    encodeURIComponent(value) +
    (minutes ? "; expires=" + expirationDate.toUTCString() : "");
  const secureFlag = "; Secure"; // This ensures the cookie is sent only over HTTPS
  const sameSiteFlag = "; SameSite=None"; // This sets SameSite to None
  document.cookie = name + "=" + cookieValue + secureFlag + sameSiteFlag + "; path=/";
}

// Function to get the value of a cookie
function getCookie(name) {
  const cookieName = name + "=";
  const cookieArray = document.cookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(
        cookie.substring(cookieName.length, cookie.length)
      );
    }
  }
  return null;
}
