const express = require('express');
const app = express();
let cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const spawn = require('child_process').spawn;
let pythonToExcelProcess;

let nameOfFiles = [];

const excels = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'excels');
  },
  filename: function (req, file, cb) {
    let name = `${file.originalname}`;
    nameOfExcel = name;

    console.log(nameOfFiles);
    cb(null, name);
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    let name = `${file.originalname}`;
    nameOfFiles.indexOf(name) === -1 ? nameOfFiles.push(name) : null;

    console.log(nameOfFiles);
    cb(null, name);
  },
});

const upload = multer({ storage: storage });
const uploadExcel = multer({ storage: excels });
const uploadMultiple = upload.fields([{ name: 'file-6', maxCount: 15 }]);
const uploadMExcel = uploadExcel.fields([{ name: 'excelFile', maxCount: 1 }]);

app.use(cors({ exposedHeaders: '*' }));
app.use(express.json());

let toExcelResponse = '';
let type = {};
let nameOfExcel = 'Plantillas modelos impuestos UHY.xlsx';
app.post('/upload/:type/', uploadMultiple, (req, res) => {
  try {
    type = req.params.type;
    const dataOfFile = { type, names: nameOfFiles };
    console.log(JSON.stringify(dataOfFile));
    res.send({ data: true });
  } catch (error) {
    console.log(error);
  }
  // console.log(req.files);
});
app.post('/upload/:type/:excelName', uploadMultiple, (req, res) => {
  try {
    type = req.params.type;
    if (req.params.excelName) {
      nameOfExcel = req.params.excelName;
    }
    console.log(nameOfExcel);
    const dataOfFile = { type, names: nameOfFiles };
    console.log(JSON.stringify(dataOfFile));
    res.send({ data: true });
  } catch (error) {
    console.log(error);
  }
  // console.log(req.files);
});

app.post('/uploadExcel', uploadMExcel, (req, res) => {
  console.log('hola');
  try {
    type = req.params.id;
    const dataOfFile = { type, names: nameOfFiles };
    console.log(JSON.stringify(dataOfFile));
    res.send({ data: true });
  } catch (error) {
    console.log(error);
  }
  // console.log(req.files);
});
app.get('/convert', (request, response) => {
  pythonToExcelProcess = spawn('python', ['toexel.py']);

  let dataOfFile = { type, names: nameOfFiles };
  if (nameOfExcel !== 'Plantillas modelos impuestos UHY.xlsx') {
    dataOfFile = { ...dataOfFile, excelName: nameOfExcel };
  } else {
    fs.copyFile(
      './Plantillas modelos impuestos UHY.xlsx',
      './excels/Plantillas modelos impuestos UHY.xlsx',
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  }
  pythonToExcelProcess.stdout.on('data', (data) => {
    toExcelResponse += data.toString();
    console.log(toExcelResponse, 'data');
  });
  pythonToExcelProcess.stdin.write(JSON.stringify(dataOfFile));
  console.log(JSON.stringify(dataOfFile));
  pythonToExcelProcess.on('close', (code) => {
    console.log('code', code);
    dataOfFile = {};
  });
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
    `./excels/${nameOfExcel}`,
    `${nameOfExcel}`,

    (err) => {
      if (err) console.log(err);
    }
  );
});

app.delete('/delete', (request, response) => {
  console.log('hola');
  try {
    deleteFiles(nameOfFiles);
    deleteExcel(nameOfExcel);
    nameOfFiles = [];
  } catch (error) {
    if (err) console.log(err);
  }
});

const deleteFiles = (files) => {
  files.forEach((file) => {
    fs.unlink('./uploads/' + file, (err) => {
      if (err) throw err;
    });
  });
};

const deleteExcel = (file) => {
  fs.unlink('./excels/' + file, (err) => {
    if (err) throw err;
  });
};

app.listen(port, () => {
  console.log('conextion correcta', port);
});
