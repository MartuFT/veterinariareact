import express from 'express';
import imagenesRouter from './router/imagenes.js';

const app = express();


app.use('/api', imagenesRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor escuchando en puerto ${port}`));

//import express from 'express';
//import multer from 'multer';
//const app = express();



//const storage = multer.memoryStorage(); 
//const upload = multer({ storage });

//app.get("/", (req, res) => {
  //res.send("api node.js ");
//});

//app.post("/subir-imagen", upload.single("imagen"), (req, res) => {
  //const archivo = req.file;

  //if (!archivo) {
   // return res.status(400).json({ error: "No se subió ninguna imagen" });
 // }

  
  //console.log("Recibido:", archivo.originalname);

  //res.json({
   // mensaje: "Imagen recibida correctamente",
   // nombre: archivo.originalname,
  //  tipo: archivo.mimetype,
 //   tamaño: archivo.size,
 // });
//});

//const port = process.env.port || 80;
//app.listen(port, () => console.log(`escuchando en puerto ${port}`));


