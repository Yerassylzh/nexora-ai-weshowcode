/**
 * Utility functions for handling asynchronous image loading from S3
 */

/**
 * Retries fetching an image from a URL until it's available
 * Useful for handling ModelsLab S3 future_links that aren't immediately ready
 * 
 * @param url - The image URL to fetch
 * @param maxRetries - Maximum number of retry attempts (default: 30)
 * @param retryDelay - Delay between retries in milliseconds (default: 5000)
 * @returns Promise resolving to the image Blob
 * @throws Error if image fails to load after all retries
 */
export async function waitForImage(
  url: string,
  maxRetries = 30,
  retryDelay = 5000
): Promise<Blob> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        return await response.blob();
      }
    } catch (error) {
      console.log(`Image not ready yet (attempt ${i + 1}/${maxRetries}), retrying in ${retryDelay/1000}s...`);
    }
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  throw new Error(`Image failed to load after ${maxRetries} attempts`);
}

/**
 * Converts a Blob to a data URL
 * 
 * @param blob - The Blob to convert
 * @returns Promise resolving to data URL string
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
