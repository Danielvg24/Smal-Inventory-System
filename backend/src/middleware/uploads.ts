import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const receiptsDir = path.join('/app', 'uploads', 'receipts');
const photosDir = path.join('/app', 'uploads', 'photos');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'receipts') return cb(null, receiptsDir);
    if (file.fieldname === 'photo') return cb(null, photosDir);
    cb(null, receiptsDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${unique}-${safeOriginal}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.fieldname === 'receipts') {
    return file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only PDF files are allowed'));
  }
  if (file.fieldname === 'photo') {
    return /^image\/(jpeg|png|webp)$/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG/PNG/WEBP images are allowed'));
  }
  cb(null, false);
};

const baseUpload = multer({ 
  storage, 
  fileFilter, 
  limits: { 
    fileSize: 10 * 1024 * 1024,
    fieldSize: 2 * 1024 * 1024,
    fields: 10,
    files: 10
  } 
});
export const uploadReceipts = baseUpload.array('receipts', 10);
export const uploadPhoto = baseUpload.single('photo');
export const uploadReceiptsAndPhoto = baseUpload.fields([
  { name: 'receipts', maxCount: 10 },
  { name: 'photo', maxCount: 1 }
]);

// Combined middleware for both receipts and photo uploads
export const maybeUploadReceiptsAndPhoto: any = (req: any, res: any, next: any) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    return uploadReceiptsAndPhoto(req, res, async (err: any) => {
      if (err) return next(err);
      try {
        // Process photo with sharp if uploaded
        const files: any = req.files;
        if (files && files.photo && files.photo[0]) {
          const photoFile = files.photo[0];
          const inputPath = photoFile.path;
          const ext = path.extname(photoFile.filename).toLowerCase();
          const outputName = photoFile.filename.replace(ext, '.webp');
          const outputPath = path.join(photosDir, outputName);
          await sharp(inputPath)
            .rotate()
            .resize({ width: 800, height: 600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);
          // Replace the file info with the processed one
          photoFile.processedFilename = outputName;
        }
      } catch (e) {
        return next(e);
      }
      next();
    });
  }
  next();
};

// Conditional middleware: only invoke multer when Content-Type is multipart/form-data
export const maybeUploadReceipts: any = (req: any, res: any, next: any) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    return uploadReceipts(req, res, (err: any) => {
      if (err) return next(err);
      next();
    });
  }
  next();
};

// Process photo upload and resize using sharp
export const maybeUploadPhoto: any = (req: any, res: any, next: any) => {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('multipart/form-data')) return next();

  uploadPhoto(req, res, async (err: any) => {
    if (err) {
      console.error('Multer error in maybeUploadPhoto:', err);
      return next(err);
    }
    try {
      if (req.file && req.file.fieldname === 'photo') {
        const inputPath = req.file.path;
        const ext = path.extname(req.file.filename).toLowerCase();
        const outputName = req.file.filename.replace(ext, '.webp');
        const outputPath = path.join(photosDir, outputName);
        await sharp(inputPath)
          .rotate()
          .resize({ width: 800, height: 600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);
        // Replace the file info with the processed one
        req.file.processedFilename = outputName;
        // Clean up the original file
        try {
          fs.unlinkSync(inputPath);
        } catch {}
      }
    } catch (e) {
      console.error('Sharp processing error:', e);
      return next(e);
    }
    next();
  });
};

