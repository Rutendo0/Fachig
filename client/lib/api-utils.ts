/**
 * Safely parse JSON response with proper error handling
 * Prevents "Unexpected token" errors when server returns non-JSON content
 */
export async function safeJsonParse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    // If response is not JSON, try to get text for better error message
    let text = '';
    try {
      text = await response.text();
    } catch {
      // If even text parsing fails, use generic message
    }
    
    throw new Error(
      text || `Server returned ${response.status} ${response.statusText} with non-JSON content`
    );
  }

  try {
    return await response.json();
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError);
    throw new Error('Server returned malformed JSON response');
  }
}

/**
 * Safely parse JSON response with fallback for error cases
 * Returns empty object if parsing fails (useful for error responses)
 */
export async function safeJsonParseWithFallback(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch (parseError) {
    console.warn('JSON parsing failed, using fallback:', parseError);
    return {};
  }
}

/**
 * Fetch wrapper with built-in JSON parsing and error handling
 */
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  return safeJsonParse<T>(response);
}
