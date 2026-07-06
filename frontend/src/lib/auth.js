// Shared authentication helpers
export async function signOut() {
  // Try to notify backend (if endpoint exists), ignore errors
  try {
    await fetch('http://127.0.0.1:3000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {})
  } catch (e) {
    // ignore
  }

  // Clear client-side auth data
  try { localStorage.removeItem('token') } catch (e) {}
  try { localStorage.removeItem('user') } catch (e) {}
}

export default signOut
