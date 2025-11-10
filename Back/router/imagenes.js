import express from 'express';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PNG, JPEG, and JPG files are allowed.'), false);
    }
}; 
const upload = multer({ storage, fileFilter });

// Store uploaded images in memory (in production, you'd use a database or file storage)
let uploadedImages = {
  transversal: null,
  longitudinal: null,
  petSize: null
};

router.post('/subir-imagen', upload.fields([
  { name: 'transversal', maxCount: 1 },
  { name: 'longitudinal', maxCount: 1 }
]), (req, res) => {
  console.log('Archivos recibidos:', req.files);
  console.log('Body:', req.body);
  
  const transversal = req.files?.transversal?.[0];
  const longitudinal = req.files?.longitudinal?.[0];
  const petSize = req.body?.petSize;

  if (!transversal || !longitudinal) {
    return res.status(400).json({ 
      error: 'Se requieren ambas imágenes: transversal y longitudinal' 
    });
  }

  // Store images in memory (in production, save to database/storage)
  uploadedImages = {
    transversal: transversal.buffer,
    longitudinal: longitudinal.buffer,
    petSize: petSize,
    transversalName: transversal.originalname,
    longitudinalName: longitudinal.originalname
  };

  res.json({
    mensaje: 'Imágenes recibidas correctamente',
    transversal: {
      nombre: transversal.originalname,
      tipo: transversal.mimetype,
      tamaño: transversal.size
    },
    longitudinal: {
      nombre: longitudinal.originalname,
      tipo: longitudinal.mimetype,
      tamaño: longitudinal.size
    },
    petSize: petSize,
    resultado: "Imágenes procesadas correctamente"
  });
});

// GET endpoint comentado - no se usará todavía
// router.get('/descargar-pdf', (req, res) => {
//   // Check if images were uploaded
//   // if (!uploadedImages.transversal || !uploadedImages.longitudinal) {
//   //   return res.status(404).json({ 
//   //     error: 'No hay imágenes disponibles. Por favor sube las imágenes primero.' 
//   //   });
//   // }
//
//   // For now, return a simple PDF response
//   // In production, you would generate a PDF using a library like pdfkit or jspdf
//   // This is a placeholder - you'll need to implement actual PDF generation
//   // res.setHeader('Content-Type', 'application/pdf');
//   // res.setHeader('Content-Disposition', 'attachment; filename=Resultado-VeterinarIA.pdf');
//   // 
//   // Placeholder PDF content (minimal valid PDF)
//   // In production, use pdfkit or similar to generate a proper PDF with the images
//   // const pdfContent = Buffer.from(
//   //   '%PDF-1.4\n' +
//   //   '1 0 obj\n' +
//   //   '<< /Type /Catalog /Pages 2 0 R >>\n' +
//   //   'endobj\n' +
//   //   '2 0 obj\n' +
//   //   '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n' +
//   //   'endobj\n' +
//   //   '3 0 obj\n' +
//   //   '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n' +
//   //   'endobj\n' +
//   //   '4 0 obj\n' +
//   //   '<< /Length 44 >>\n' +
//   //   'stream\n' +
//   //   'BT\n' +
//   //   '/F1 12 Tf\n' +
//   //   '100 700 Td\n' +
//   //   '(Resultado VeterinarIA) Tj\n' +
//   //   'ET\n' +
//   //   'endstream\n' +
//   //   'endobj\n' +
//   //   '5 0 obj\n' +
//   //   '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n' +
//   //   'endobj\n' +
//   //   'xref\n' +
//   //   '0 6\n' +
//   //   '0000000000 65535 f \n' +
//   //   '0000000009 00000 n \n' +
//   //   '0000000058 00000 n \n' +
//   //   '0000000115 00000 n \n' +
//   //   '0000000294 00000 n \n' +
//   //   '0000000384 00000 n \n' +
//   //   'trailer\n' +
//   //   '<< /Size 6 /Root 1 0 R >>\n' +
//   //   'startxref\n' +
//   //   '478\n' +
//   //   '%%EOF'
//   // );
//
//   // res.send(pdfContent);
// });

export default router;
