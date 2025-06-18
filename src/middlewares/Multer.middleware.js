import multer from "multer";

const storage = multer.diskStorage({
  // req from user, file [multer has that, cb is callback]
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({
     storage,
})