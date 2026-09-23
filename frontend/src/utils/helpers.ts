/**
 * Helper Functions
 * Common utility functions used across the application
 */

/**
 * Format a date to a readable string
 * @param date Date object or string
 * @param format Optional format pattern
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = "DD/MM/YYYY"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", String(year));
}

/**
 * Format calories value
 * @param calories Number of calories
 * @returns Formatted string with unit
 */
export function formatCalories(calories: number): string {
  return `${calories.toFixed(0)} kcal`;
}

/**
 * Format weight value in kg
 * @param weight Weight in kg
 * @returns Formatted string with unit
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}

/**
 * Format height value in cm
 * @param height Height in cm
 * @returns Formatted string with unit
 */
export function formatHeight(height: number): string {
  return `${height.toFixed(0)} cm`;
}

/**
 * Calculate BMI (Body Mass Index)
 * @param weight Weight in kg
 * @param height Height in cm
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Format BMI value
 * @param bmi BMI value
 * @returns Formatted string with unit
 */
export function formatBMI(bmi: number): string {
  return bmi.toFixed(1);
}

/**
 * Get BMI category based on value
 * @param bmi BMI value
 * @returns Category string
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  return "Obeso";
}

/**
 * Truncate text to a maximum length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert string to slug format
 * @param text Text to convert
 * @returns Slug string
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Validation result
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  strength: "weak" | "fair" | "good" | "strong";
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("A senha deve ter pelo menos 8 caracteres");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Adicione letras minúsculas");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Adicione letras maiúsculas");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Adicione números");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Adicione caracteres especiais");

  const strengthMap = {
    0: "weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong",
    5: "strong",
  } as const;

  return {
    isValid: score >= 3,
    strength: strengthMap[score as keyof typeof strengthMap],
    feedback,
  };
}

/**
 * Delay execution (useful for async operations)
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
