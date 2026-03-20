/**
 * Validation utilities for form handling and data validation
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns ValidationResult
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate person name
 *
 * @param name - Name to validate
 * @returns ValidationResult
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate date format (YYYY-MM-DD or YYYY)
 *
 * @param date - Date string to validate
 * @returns ValidationResult
 */
export function validateDate(date: string): ValidationResult {
  const errors: string[] = [];

  if (!date || date.trim().length === 0) {
    // Empty date is allowed
    return { valid: true, errors };
  }

  const dateRegex = /^\d{4}(-\d{2}-\d{2})?$/;
  if (!dateRegex.test(date)) {
    errors.push('Date must be in YYYY or YYYY-MM-DD format');
  } else {
    // Validate actual date values
    const parts = date.split('-');
    const year = parseInt(parts[0], 10);

    if (year < 1500 || year > new Date().getFullYear() + 1) {
      errors.push('Year must be between 1500 and current year');
    }

    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      if (month < 1 || month > 12) {
        errors.push('Month must be between 01 and 12');
      } else if (day < 1 || day > 31) {
        errors.push('Day must be between 01 and 31');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate markdown content for stories
 *
 * @param content - Markdown content to validate
 * @returns ValidationResult
 */
export function validateMarkdown(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  } else if (content.trim().length > 10000) {
    errors.push('Content must not exceed 10,000 characters');
  }

  // Check for balanced brackets and parentheses
  const brackets = { '[': ']', '(': ')', '{': '}' };
  const stack: string[] = [];

  for (const char of content) {
    if (char in brackets) {
      stack.push(char);
    } else if (Object.values(brackets).includes(char)) {
      const last = stack.pop();
      if (last === undefined || brackets[last as keyof typeof brackets] !== char) {
        errors.push('Mismatched brackets or parentheses');
        break;
      }
    }
  }

  if (stack.length > 0) {
    errors.push('Unclosed brackets or parentheses');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file for upload
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns ValidationResult
 */
export function validateFile(
  file: File | null,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;

  if (!file) {
    errors.push('File is required');
  } else {
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate GEDCOM file specifically
 *
 * @param file - File to validate
 * @returns ValidationResult
 */
export function validateGedcomFile(file: File | null): ValidationResult {
  const errors: string[] = [];

  // First validate as file
  const fileValidation = validateFile(file, {
    maxSize: 50 * 1024 * 1024, // 50MB for GEDCOM
    allowedTypes: ['text/plain', 'application/octet-stream'],
  });

  if (!fileValidation.valid) {
    return fileValidation;
  }

  // Check GEDCOM-specific requirements
  if (file && !file.name.toLowerCase().endsWith('.ged')) {
    errors.push('File must have .ged extension');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate search query
 *
 * @param query - Search query to validate
 * @returns ValidationResult
 */
export function validateSearchQuery(query: string): ValidationResult {
  const errors: string[] = [];

  if (query.length > 0 && query.length < 2) {
    errors.push('Search query must be at least 2 characters');
  } else if (query.length > 100) {
    errors.push('Search query must not exceed 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate place name
 *
 * @param place - Place name to validate
 * @returns ValidationResult
 */
export function validatePlace(place: string): ValidationResult {
  const errors: string[] = [];

  if (!place || place.trim().length === 0) {
    // Empty place is allowed
    return { valid: true, errors };
  }

  if (place.trim().length < 2) {
    errors.push('Place name must be at least 2 characters');
  } else if (place.trim().length > 200) {
    errors.push('Place name must not exceed 200 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate occupation name
 *
 * @param occupation - Occupation to validate
 * @returns ValidationResult
 */
export function validateOccupation(occupation: string): ValidationResult {
  const errors: string[] = [];

  if (!occupation || occupation.trim().length === 0) {
    // Empty occupation is allowed
    return { valid: true, errors };
  }

  if (occupation.trim().length < 2) {
    errors.push('Occupation must be at least 2 characters');
  } else if (occupation.trim().length > 100) {
    errors.push('Occupation must not exceed 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate entire person object
 *
 * @param person - Person object to validate
 * @returns ValidationResult
 */
export function validatePerson(person: {
  name: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  occupation?: string;
}): ValidationResult {
  const allErrors: string[] = [];

  const nameValidation = validateName(person.name);
  allErrors.push(...nameValidation.errors);

  if (person.birthDate) {
    const birthValidation = validateDate(person.birthDate);
    allErrors.push(...birthValidation.errors.map((e) => `Birth date: ${e}`));
  }

  if (person.deathDate) {
    const deathValidation = validateDate(person.deathDate);
    allErrors.push(...deathValidation.errors.map((e) => `Death date: ${e}`));
  }

  if (person.birthPlace) {
    const placeValidation = validatePlace(person.birthPlace);
    allErrors.push(...placeValidation.errors.map((e) => `Birth place: ${e}`));
  }

  if (person.occupation) {
    const occupationValidation = validateOccupation(person.occupation);
    allErrors.push(...occupationValidation.errors.map((e) => `Occupation: ${e}`));
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
