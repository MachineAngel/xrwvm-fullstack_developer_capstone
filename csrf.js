export function csrfToken() {
  return document.cookie.split("; ").find(cookie => cookie.startsWith("csrftoken="))?.split("=")[1] || "";
}
