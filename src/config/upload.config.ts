import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
// monta path ate tmp folder
const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');
export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    // pasta para salvar os arquivos
    destination: tmpFolder,
    // funcao para definir filename
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString();
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
};
