const express = require('express');
const app = express();
let cors = require('cors');
var router = express.Router();

const port = process.env.PORT || 3000;
const spawn = require('child_process').spawn;

app.use(cors({ exposedHeaders: '*' }));
app.use(express.json());

const pythonToExcelProcess = spawn('python', ['toexel.py']);

let toExcelResponse = '';

app.get('/convert', function (request, response) {
  response.setHeader(
    'Content-Disposition',
    "attachment; filename='Plantillas modelos impuestos UHY.xlsx'; filename*=UTF-8''Plantillas modelos impuestos UHY.xlsx"
  );
  response.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  console.log('se hizo algo');
  pythonToExcelProcess.stdin.write('prueba fichero');
  pythonToExcelProcess.stdout.on('data', (data) => {
    toExcelResponse += data.toString();
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
