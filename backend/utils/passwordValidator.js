/**
 * Password validation utility
 * 
 * This utility validates password strength based on several criteria:
 * 1. Minimum length
 * 2. Contains uppercase letters
 * 3. Contains lowercase letters
 * 4. Contains numbers
 * 5. Contains special characters
 */

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Object with isValid flag and error messages
 */
export const validatePassword = (password) => {
  const errors = [];
  
  // Check minimum length (at least 8 characters)
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Simple password strength estimator (0-100)
 * @param {string} password - The password to check
 * @returns {number} - Strength score from 0-100
 */
export const passwordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length contribution (up to 25 points)
  score += Math.min(25, password.length * 2);
  
  // Character variety
  if (/[A-Z]/.test(password)) score += 10; // Uppercase
  if (/[a-z]/.test(password)) score += 10; // Lowercase
  if (/[0-9]/.test(password)) score += 10; // Numbers
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15; // Special chars
  
  // Additional variety bonus
  const charTypes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/];
  const typesUsed = charTypes.filter(type => type.test(password)).length;
  score += (typesUsed - 1) * 5; // Bonus for using multiple types
  
  // Check for common patterns/sequences
  if (/123|abc|qwerty|password|admin|user/i.test(password)) {
    score = Math.max(0, score - 20);
  }
  
  return Math.min(100, score);
};