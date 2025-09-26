import multer from 'multer';

// We keep memoryStorage: production should use Supabase storage or S3.
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
