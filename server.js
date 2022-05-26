const express = require('express');
const app = express();
let cors = require('cors');
const multer = require('multer');
const path = require('path');

const port = process.env.PORT || 3000;
const spawn = require('child_process').spawn;
let pythonToExcelProcess;
let nameOfFiles = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    let name = `pdfToRead.pdf${Date.now()}${path.extname(
      file.originalname
    )}.pdf`;
    nameOfFiles.push(name);
    cb(null, name);
  },
});

const upload = multer({ storage: storage });
const uploadMultiple = upload.fields([{ name: 'file-6', maxCount: 10 }]);

app.use(cors({ exposedHeaders: '*' }));
app.use(express.json());

let toExcelResponse = '';
let type = {};
app.post('/upload/:id', uploadMultiple, function (req, res) {
  console.log(req.files);
  type = req.params.id;

  res.send({ data: true });
});
app.get('/convert', function (request, response) {
  pythonToExcelProcess = spawn('python', ['toexel.py']);
  pythonToExcelProcess.stdout.on('data', function (data) {
    console.log(data, 'data');
    toExcelResponse += data.toString();
  });
  const dataOfFile = { type, names: nameOfFiles };
  console.log(JSON.stringify(dataOfFile));
  pythonToExcelProcess.stdin.write(JSON.stringify(dataOfFile));
  pythonToExcelProcess.stdin.end();
  pythonToExcelProcess.stdout.on('end', function () {
    response.send({ coverted: true });
  });
});

app.get('/download', function (request, response) {
  response.setHeader(
    'Content-Disposition',
    "attachment; filename='Plantillas modelos impuestos UHY.xlsx'; filename*=UTF-8''Plantillas modelos impuestos UHY.xlsx"
  );
  response.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
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
