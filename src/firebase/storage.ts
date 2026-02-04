import { Directory, File, Paths } from "expo-file-system";

/**
 * Save image to local file system
 * @param uri - The source image URI (from image picker)
 * @param filename - The filename to save as (e.g., "avatar_userId.jpg")
 * @returns The local file path
 */
export async function saveImageLocally(
  uri: string,
  filename: string,
): Promise<string> {
  try {
    // Create images directory in document directory
    const imagesDir = new Directory(Paths.document, "images");

    // Create directory if it doesn't exist
    if (!imagesDir.exists) {
      await imagesDir.create();
    }

    // Create file reference
    const destinationFile = new File(imagesDir, filename);

    // Copy file from source URI
    const sourceFile = new File(uri);
    await sourceFile.copy(destinationFile);

    return destinationFile.uri;
  } catch (error) {
    console.error("Error saving image locally:", error);
    throw error;
  }
}

/**
 * Delete image from local file system
 * @param uri - The local file path to delete
 */
export async function deleteImageLocally(uri: string): Promise<void> {
  try {
    if (!uri) return;

    const file = new File(uri);
    if (file.exists) {
      await file.delete();
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}
