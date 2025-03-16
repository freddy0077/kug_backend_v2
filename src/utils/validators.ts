/**
 * Validates and normalizes dog gender to ensure consistent format
 * @param gender The gender string to validate
 * @returns Normalized gender in uppercase format
 * @throws Error if gender is invalid
 */
export const validateDogGender = (gender: string): string => {
  const normalizedGender = gender.trim().toUpperCase();
  
  if (normalizedGender !== 'MALE' && normalizedGender !== 'FEMALE') {
    throw new Error(`Invalid gender: ${gender}. Must be either 'MALE' or 'FEMALE'`);
  }
  
  return normalizedGender;
};
