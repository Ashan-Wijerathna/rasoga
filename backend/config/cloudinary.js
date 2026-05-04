const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/photos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/documents');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const artworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/artwork');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const photoFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG PNG WEBP allowed'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF allowed'), false);
  }
};

exports.uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: photoFilter,
});

exports.uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: pdfFilter,
});

exports.uploadArtwork = multer({
  storage: artworkStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: photoFilter,
});

const SIGNATURE_FIELDS = new Set(['classTeacherSignature', 'principalSignature', 'officialSeal']);

const applicationStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isPhoto =
      file.fieldname === 'passportPhoto' ||
      file.fieldname.startsWith('passportPhoto_');
    const isSignature = SIGNATURE_FIELDS.has(file.fieldname);
    let dir;
    if (isPhoto) dir = path.join(__dirname, '../uploads/photos');
    else if (isSignature) dir = path.join(__dirname, '../uploads/signatures');
    else dir = path.join(__dirname, '../uploads/documents');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const applicationFilter = (_req, file, cb) => {
  const isPhoto =
    file.fieldname === 'passportPhoto' ||
    file.fieldname.startsWith('passportPhoto_');
  const isSignature = SIGNATURE_FIELDS.has(file.fieldname);
  if (isPhoto || isSignature) {
    photoFilter(_req, file, cb);
  } else {
    pdfFilter(_req, file, cb);
  }
};

const applicationFields = [
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'classTeacherSignature', maxCount: 1 },
  { name: 'principalSignature', maxCount: 1 },
  { name: 'officialSeal', maxCount: 1 },
];
for (let i = 0; i < 10; i++) {
  applicationFields.push({ name: `passportPhoto_${i}`, maxCount: 1 });
  applicationFields.push({ name: `birthCertificate_${i}`, maxCount: 1 });
}

exports.applicationUpload = multer({
  storage: applicationStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: applicationFilter,
});

exports.applicationFields = applicationFields;

exports.uploadCustomFields = (fieldNames) => {
  const customStorage = multer.diskStorage({
    destination: (_req, file, cb) => {
      const dir = path.join(__dirname, '../uploads/custom-fields');
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  });

  return multer({
    storage: customStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, _file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (allowed.includes(_file.mimetype)) cb(null, true);
      else cb(new Error('File type not allowed'), false);
    },
  }).fields(fieldNames.map(name => ({ name, maxCount: 1 })));
};
