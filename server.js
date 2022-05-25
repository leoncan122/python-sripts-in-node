const express = require('express');
const app = express();
let cors = require('cors');
const multer = require('multer');
var router = express.Router();

const port = process.env.PORT || 3000;
const spawn = require('child_process').spawn;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `pdfToRead.pdf`);
  },
});

const upload = multer({ storage: storage });

app.use(cors({ exposedHeaders: '*' }));
app.use(express.json());

const pythonToExcelProcess = spawn('python', ['toexel.py']);

let toExcelResponse = '';

app.post('/upload', upload.single('pdfFile'), function (req, res) {
  res.send({ data: true });
});
app.get('/convert', function (request, response) {
  response.setHeader(
    'Content-Disposition',
    "attachment; filename='Plantillas modelos impuestos UHY.xlsx'; filename*=UTF-8''Plantillas modelos impuestos UHY.xlsx"
  );
  response.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  pythonToExcelProcess.stdin.write('prueba fichero');
  pythonToExcelProcess.stdout.on('data', (data) => {
    toExcelResponse += data.toString();
    console.log(toExelResponse);
  });

  pythonToExcelProcess.on('end', () => console.log(toExcelResponse));

  pythonToExcelProcess.stdin.end();
  // console.log('se hizo algo 2');
  response.download(
    './Plantillas modelos impuestos UHY.xlsx',
    'Plantillas modelos impuestos UHY.xlsx',

    (err) => {
      if (err) console.log(err);
    }
  );
});

app.listen(port, () => {
  console.log('conextion correcta', port);
});
