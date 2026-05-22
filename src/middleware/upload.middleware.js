const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { errorResponse } = require("../utils/apiResponse");

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_FILE_SIZE_MB = 5;

const ensureUploadDir = (folder) => {
  const uploadDir = path.join(process.cwd(), "uploads", folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
};

const createImageFileFilter = () => {
  return (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`
      )
    );
  };
};

const createImageUpload = ({ folder, prefix }) => {
  const uploadDir = ensureUploadDir(folder);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      cb(null, `${uniqueName}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: createImageFileFilter(),
    limits: {
      fileSize: MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024,
    },
  });
};

const createRouteAwareImageUpload = () => {
  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const folder = req.baseUrl.includes("rooms") ? "rooms" : "properties";

      cb(null, ensureUploadDir(folder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      cb(null, `${uniqueName}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: createImageFileFilter(),
    limits: {
      fileSize: MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024,
    },
  });
};

const handleUpload = (uploadHandler) => {
  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return errorResponse(
            res,
            `File too large. Maximum size is ${MAX_IMAGE_FILE_SIZE_MB}MB`,
            400
          );
        }

        return errorResponse(res, err.message, 400);
      }

      if (err) {
        return errorResponse(res, err.message, 400);
      }

      return next();
    });
  };
};

const routeAwareImageUpload = createRouteAwareImageUpload();
const propertyImageUpload = createImageUpload({
  folder: "properties",
  prefix: "property",
});
const roomImageUpload = createImageUpload({
  folder: "rooms",
  prefix: "room",
});
const profileImageUpload = createImageUpload({
  folder: "profiles",
  prefix: "profile",
});

const upload = routeAwareImageUpload;
upload.propertyImages = handleUpload(propertyImageUpload.array("images", 10));
upload.roomImages = handleUpload(roomImageUpload.array("images", 10));
upload.profileImage = handleUpload(profileImageUpload.single("profile_image"));
upload.createImageUpload = createImageUpload;
upload.handleUpload = handleUpload;

module.exports = upload;
