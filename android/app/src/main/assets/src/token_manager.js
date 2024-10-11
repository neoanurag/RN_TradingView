import { getToken } from "./helpers.js";

class TokenManager {
  constructor() {
    this.token = null; // Cache the token
    this.tokenPromise = null; // Cache the in-flight promise to avoid multiple requests
  }

  async getToken() {
    // If we already have a token cached, return it
    if (this.token !== null) {
      return this.token;
    }

    // If the token is being fetched (tokenPromise exists), return the promise (to avoid duplicate API calls)
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // If no token and no promise, make the API call to fetch the token
    let token;
      token = localStorage.getItem("crm_token");
    

    this.tokenPromise = getToken(token);
    try {
      // Wait for the token to be fetched
      this.token = await this.tokenPromise;
    } catch (error) {
      // In case of failure, clear the tokenPromise and rethrow the error
      console.error("Failed to fetch token:", error);
      this.tokenPromise = null;
      throw error;
    }

    // Clear the promise once the token is fetched
    this.tokenPromise = null;

    return this.token;
  }

  // Optional: Method to manually reset or invalidate the token
  invalidateToken() {
    this.token = null;
  }
}

const tokenManager = new TokenManager();
export default tokenManager;
