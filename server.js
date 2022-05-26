const express = require('express');
const app = express();
let cors = require('cors');
const multer = require('multer');

const port = process.env.PORT || 3000;
const spawn = require('child_process').spawn;
let pythonToExcelProcess;

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

let toExcelResponse = '';
let type = {};
app.post('/upload/:id', upload.single('pdfFile'), function (req, res) {
  type = { type: req.params.id };
  pythonToExcelProcess = spawn('python', ['toexel.py']);
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

  pythonToExcelProcess.stdout.on('data', function (data) {
    console.log(data, 'data');
    toExcelResponse += data.toString();
  });
  console.log(type);
  pythonToExcelProcess.stdin.write(type.type);

  pythonToExcelProcess.stdout.on('end', function () {
    response.download(
      './Plantillas modelos impuestos UHY.xlsx',
      'Plantillas modelos impuestos UHY.xlsx',

      (err) => {
        if (err) console.log(err);
      }
    );
    type = {};
  });

  pythonToExcelProcess.stdin.end();

  console.log(toExcelResponse);
});

app.listen(port, () => {
  console.log('conextion correcta', port);
});
