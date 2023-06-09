const express = require('express');
const app = express();
let cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
require('dotenv').config();

const port = process.env.PORT || 3000;
let pythonToExcelProcess;

let nameOfFiles = [];
let filesToDelete = [];
let toExcelResponse = '';
let type = {};
let nameOfExcel = 'Plantillas modelos impuestos UHY.xlsx';

// const excels = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'excels');
//   },
//   filename: function (req, file, cb) {
//     let name = `${file.originalname}`;
//     nameOfExcel = name;

//     console.log(nameOfFiles);
//     cb(null, name);
//   },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    let name = `${file.originalname}`;

    nameOfFiles.indexOf(name) === -1 ? nameOfFiles.push(name) : null;

    cb(null, name);
  },
});

const upload = multer({ storage: storage });
const uploadMultiple = upload.fields([{ name: 'file-6', maxCount: 15 }]);
// const uploadExcel = multer({ storage: excels });
// const uploadMExcel = uploadExcel.fields([{ name: 'excelFile', maxCount: 1 }]);

app.use(cors({ exposedHeaders: '*' }));
app.use(express.json());

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
// app.post('/upload/:type/:excelName', uploadMultiple, (req, res) => {
//   try {
//     type = req.params.type;
//     if (req.params.excelName) {
//       nameOfExcel = req.params.excelName;
//     }
//     console.log(nameOfExcel);
//     const dataOfFile = { type, names: nameOfFiles };
//     console.log(JSON.stringify(dataOfFile));
//     res.send({ data: true });
//   } catch (error) {
//     console.log(error);
//   }
//   // console.log(req.files);
// });

// app.post('/uploadExcel', uploadMExcel, (req, res) => {
//   console.log('hola');
//   try {
//     type = req.params.id;
//     const dataOfFile = { type, names: nameOfFiles };
//     console.log(JSON.stringify(dataOfFile));
//     res.send({ data: true });
//   } catch (error) {
//     console.log(error);
//   }
//   // console.log(req.files);
// });

app.get('/convert', (request, response) => {
  pythonToExcelProcess = spawn('python', ['toexel.py']);
  console.log('comenzo a convertir');
  let dataOfFile = { type, names: nameOfFiles };

  if (!fs.existsSync('./excels/Plantillas modelos impuestos UHY.xlsx')) {
    // dataOfFiles = { ...dataOfFile, excelName: nameOfExcel };

    fs.copyFile(
      './Plantillas modelos impuestos UHY.xlsx',
      './excels/Plantillas modelos impuestos UHY1.xlsx',
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
    filesToDelete = nameOfFiles;
    nameOfFiles = [];
    console.log(filesToDelete);
    deleteFiles(filesToDelete);
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

const events = [
  {
    "id": 386,
    "userid": "auth0|62e3bfafb2fe435aad95bb48",
    "eventdatecreated": "2022-10-19T04:00:00.000Z",
    "programid": 3,
    "programname": "NYS CMP",
    "eventname": "Alexei Calendar",
    "eventdate": "2022-11-20T05:00:00.000Z",
    "eventstarttime": "13:00:00",
    "eventfinishtime": "14:00:00",
    "eventlocationtypeid": null,
    "eventlocationtypename": "",
    "eventtypeid": null,
    "eventtypename": "",
    "folderurl": null,
    "folderpath": null,
    "healthareaoffocusid": [
        "6",
        "1"
    ],
    "healthareaoffocusname": [
        "HIV/AIDS",
        "Breast cancer"
    ],
    "qrcode": "data:image/png;base64,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",
    "nysactivity": "Campus Approach",
    "nysactivityother": "",
    "onlineinpersoneventtype": "Online",
    "inpersoneventtypename": "",
    "onlineeventtypename": "Meeting",
    "eventdescription": "alexei calendaralexei calendar",
    "inpersoneventtypeid": null,
    "onlineeventtypeid": 1,
    "additionalmaterials": "alexei calendaralexei calendaralexei calendar",
    "createdbyname": "Alexei",
    "createdbylastname": "Garban",
    "workarea": "Buffalo",
    "workareaother": "",
    "locationname": "Black Health Office",
    "locationnameother": "",
    "eventzipcode": 33166,
    "locationaddress": "215 W. 125th Street",
    "icsurlfile": "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Black Health v1.0//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:Events - Black Health\nX-MS-OLK-FORCEINSPECTOROPEN:TRUE\nBEGIN:VTIMEZONE\nTZID:America/New_York\nTZURL:http://tzurl.org/zoneinfo-outlook/America/New_York\nX-LIC-LOCATION:America/New_York\nBEGIN:DAYLIGHT\nTZOFFSETFROM:-0500\nTZOFFSETTO:-0400\nTZNAME:CEST\nDTSTART:19700329T020000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:-0400\nTZOFFSETTO:-0500\nTZNAME:CET\nDTSTART:19701025T030000\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\nEND:STANDARD\nEND:VTIMEZONE\nBEGIN:VEVENT\nDTSTAMP:20220129T115020Z\nDTSTART:20221120T1300\nDTEND:20221120T1400\nSTATUS:CONFIRMED\nSUMMARY:Alexei Calendar\nDESCRIPTION:Online - Meeting - alexei calendaralexei calendar\nORGANIZER;CN=Black Health:MAILTO:info@meetup.com\nCLASS:PUBLIC\nLOCATION:215 W. 125th Street, Black Health Office, 33166\nSEQUENCE:2\nUID:event_283355921@black_health_data_app_management\nEND:VEVENT\nEND:VCALENDAR",
    "borough": "",
    "posteventreportid": null
},{
  "id": 208,
  "userid": "auth0|630e2de59ecfbf1957a9ca36",
  "eventdatecreated": "2022-10-05T04:00:00.000Z",
  "programid": 3,
  "programname": "NYS CMP",
  "eventname": "Syracuse: Onondaga Community College",
  "eventdate": "2022-11-16T05:00:00.000Z",
  "eventstarttime": "11:00:00",
  "eventfinishtime": "13:00:00",
  "eventlocationtypeid": null,
  "eventlocationtypename": "College/School/Trades school/community-based learning center",
  "eventtypeid": null,
  "eventtypename": "",
  "folderurl": null,
  "folderpath": null,
  "healthareaoffocusid": [
      "6",
      "1",
      "3",
      "7",
      "2"
  ],
  "healthareaoffocusname": [
      "HIV/AIDS",
      "Breast cancer",
      "COVID-19",
      "Mental health",
      "Cardiovascular disease"
  ],
  "qrcode": "data:image/png;base64,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",
  "nysactivity": "Campus Approach",
  "nysactivityother": "",
  "onlineinpersoneventtype": "In-person",
  "inpersoneventtypename": "",
  "onlineeventtypename": "",
  "eventdescription": "Black Health along with other community organization partnered with Onondaga Community College to offer community resources to student that are not assessable on campus.",
  "inpersoneventtypeid": null,
  "onlineeventtypeid": null,
  "additionalmaterials": "",
  "createdbyname": "Marlo",
  "createdbylastname": "Judge",
  "workarea": null,
  "workareaother": null,
  "locationname": null,
  "locationnameother": null,
  "eventzipcode": null,
  "locationaddress": null,
  "icsurlfile": null,
  "borough": null,
  "posteventreportid": null
},{
  "id": 216,
  "userid": "auth0|62f3a1d9d27173e38278d57f",
  "eventdatecreated": "2022-10-11T04:00:00.000Z",
  "programid": 3,
  "programname": "NYS CMP",
  "eventname": "Syracuse: Test Event ",
  "eventdate": "2022-10-26T04:00:00.000Z",
  "eventstarttime": "10:00:00",
  "eventfinishtime": "14:30:00",
  "eventlocationtypeid": null,
  "eventlocationtypename": "",
  "eventtypeid": null,
  "eventtypename": "",
  "folderurl": null,
  "folderpath": null,
  "healthareaoffocusid": [
      "6"
  ],
  "healthareaoffocusname": [
      "HIV/AIDS"
  ],
  "qrcode": "data:image/png;base64,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",
  "nysactivity": "Conscientious Clinician™",
  "nysactivityother": "",
  "onlineinpersoneventtype": "Online",
  "inpersoneventtypename": "",
  "onlineeventtypename": "Webinar",
  "eventdescription": "Event description Event description Event description",
  "inpersoneventtypeid": null,
  "onlineeventtypeid": 3,
  "additionalmaterials": "Additional materials (to be completed by data and evaluation team)\nAdditional materials (to be completed by data and evaluation team)\nAdditional materials (to be completed by data and evaluation team)\n",
  "createdbyname": "Platformable",
  "createdbylastname": "Team",
  "workarea": "Syracuse",
  "workareaother": "",
  "locationname": "Black Health Office",
  "locationnameother": "",
  "eventzipcode": 10027,
  "locationaddress": "215 W. 125th Street",
  "icsurlfile": null,
  "borough": null,
  "posteventreportid": null
},
{
  "id": 198,
  "userid": "auth0|630e2de59ecfbf1957a9ca36",
  "eventdatecreated": "2022-10-03T04:00:00.000Z",
  "programid": 3,
  "programname": "NYS CMP",
  "eventname": "Syracuse: Onondaga Community College",
  "eventdate": "2022-10-19T04:00:00.000Z",
  "eventstarttime": "11:00:00",
  "eventfinishtime": "13:00:00",
  "eventlocationtypeid": null,
  "eventlocationtypename": "College/School/Trades school/community-based learning center",
  "eventtypeid": null,
  "eventtypename": "",
  "folderurl": null,
  "folderpath": null,
  "healthareaoffocusid": [
      "6",
      "3",
      "7",
      "1"
  ],
  "healthareaoffocusname": [
      "HIV/AIDS",
      "COVID-19",
      "Mental health",
      "Breast cancer"
  ],
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAsEAAALBCAYAAAC5sXx0AAAAAklEQVR4AewaftIAABezSURBVO3BgQ1lOaIrOMmo/FPWTgDvAwUPek/fMcnuPwIAAA85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOZP/gttw7/bttxqG/7OtvyatvnCttxqm1vb8mva5ta2fKFt+Dvb8oW2ubUtX2ibW9tyq234d9uWWycAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDH/MlHtoW/0zYv2ZYvtM2ttrm1Lbfa5ta23GqbW23zhba5tS232ubXtM1LtuVW29xqmy9syxfa5ta2/Jpt4e+0zRdOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAj/mTH9Q2v2Zbfs223GqbW21za1tubcuttrnVNre25Vbb/JptudU2v2ZbbrXNrW35Qtv8mm35Qtvwv6ttfs22/JoTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY/4E/h/a5gvbcqttbm3LrW251Ta32ubWttxqm1vbcqttvtA2t7blJW3zhW251TZf2JZb2/KStrm1LfB/OQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmT+Bfpm1+TdvA/6Vtfk3b3NqWW23zkra5tS232gZITgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI/5kx+0Lfy7bcuvaZtb2/KFtuGfty2/pm1ubcuttrm1LV/Yllttc2tbbrXNrW3h321b+OedAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHvMnH2kb+L+0za1t+TVtc2tbbrXNrW251Ta3tuVW23yhbW5tC3+nbW5tC3+nbW5ty622ubUtX2gb/t1OAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAj/mT/8K28L9rW35N29zalltt82u25Vbb8He2hb/TNl9omy+0za/ZlpdsC/+7TgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI/p/iMPaZtb2/KFtrm1LV9om1+zLbfa5tdsy69pG/i/bMsX2uYL23KrbW5ty622ubUtv6Ztfs223GqbL2zLrRMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBj/uS/0Da3tuVW29zali+0za1tudU2X9iWW23D39mWW23za7blVtt8YVtutc2v2ZZf0za3tuVW29xqm1+zLfzv2pZbbfOFEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGP+5CNt84W2+TVtw7/bttxqm1ttc2tbvtA2t9rm1rbcaptbbXNrW261Df9u2/Jr2uYL23KrbW5tyxe25Vbb8HdOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAj/mT/8K2fKFtbm3Lrbb5wra8ZFu+0Db887blVtvcapsvbMuttvnCtvC/q21ubctL2ubWttxqm5dsyxdOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAj+n+Ix9om1vbcqttbm3LF9rmC9vyhbb5wrbcaptb23Krbb6wLV9om1vbcqttvrAt/J22ubUtt9rm1rbcapuXbMsX2uYl23KrbW5tyxdOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAj/mT/0Lb8M/bli+0zRe2hb+zLV9oG/7Otvyatvk123KrbW5ty622ubUtX2ibW9vyhba5tS232ubWttxqm1ttc2tbbrXNrW25dQIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHhM9x/5QNt8YVtutc2tbbnVNre25Vbb8He25Qttc2tbbrXNrW251TZf2JYvtM2tbbnVNre25de0za1t4e+0za1tudU2X9iWW23zkm35wgkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxf8L/L9rm1rbcaptb23KrbX7NtnyhbW5ty622ubUtt9rm1rZ8oW1ubcutbbnVNl9omy9sy61t+ULbfGFbvrAtt9rm1rbcaptfsy2/pm1ubcutEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGP+5L/QNre25Vbb/JptudU2X2ibL2zLF9rmC9vya9rm1rbcaptb23JrW/g72/KFtuF/17Z8YVtutc2tbbnVNre25Qvb8oUTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY/7kI21za1tutc2tbfnCttxqm5e0za1tudU2X2ibX9M2v6Ztfs22fKFtbm3LrW251Ta3tuULbfNr2ubWtnyhbW5tyxe25Qttc2tbvnACAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4TPcf+UDbwP9lW17SNl/Yli+0za/Zll/TNre25Vbb3NqWW23zhW251Ta/Zltutc2v2ZZbbcM/b1tunQAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB7zJx/Zllttc2tbbrXNrW35Qtvc2pYvtM2v2ZYvbMuttvk12/KFtrm1Lb+mbb7QNre25Vbb3GqbW9tyq21+zbbcapuXbAv/vBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjuv/Ipba5tS1faBv+edtyq22+sC232ubXbMuttvnCttxqG/552/KStrm1LV9oG/53bcsX2uYL23LrBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8Jg/+S9sy622ubUtv2Zbfk3bfGFb+DvbcqttvrAtv2Zbfk3b/Jq2ubUtt9rm1rbcaptb23JrW35N29zall/TNl9om5ecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHvMnP6htXtI2t7aFf9623GqbL2zLrba51Ta3tuXXtM2tbfnCttxqmy+0za1tudU2v6ZtvrAtv6Ztbm3LF9rmC9tyq22+cAIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMn3xkW261za1tudU2X9iWX9M2X9iWL7TNr2mbW9vyhbb5Ndvya9rm1rbcaptb2/JrtuXXbMtLtuXXbMsX2ubXnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB7zJx9pm1vb8mva5iXbcqttbrXNrW35wra8pG1+Tdvwd9rm17TNF9qGf17b8M/blltt84UTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY/6Ev7Ytt9rm1rbwz2ubW9tyq21+Tdt8YVtutQ1/Z1tutc2tbXnJttxqm1vbcqttbm3LrW35Qtvc2pZbbXOrbW5ty622+TUnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx3T/kR/TNr9mW261za1tudU2t7blVtvc2pYvtM2tbXlJ29zalltt84Vt+ULb/Jpt4Z/XNre25Qtt84Vt+TVt82u25QsnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx3T/kUtt84Vt4e+0za1t+ULbfGFbfk3bfGFbXtI2v2ZbbrXNrW15Sdv8mm251Ta3tuULbfOFbeHf7QQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYP/nIttxqmy9syxfa5te0Df+8bbnVNrfa5gvb8oVtudU2t7aFf7dt+ULb3Gqbl2zLrba51TZf2Bb+zgkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxf/KDtuVW29xqmy9sy6/Zlpe0za1t4X/Xttxqm5e0zUu25Qvb8pK2+cK2fKFtbm3Lrba5tS1fOAEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmTz7SNvydtvnCttxqm1+zLbe25VbbfGFb+Dttc2tbbm3LF9rmVtvc2pYvtA3/vLbh77TNF9rm1rbcaptb23LrBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JjuP/Jj2ubWttxqmy9sy622ubUtL2mbL2wLf6dtbm3Lrbb5Ndvyhbb5wrb8mrZ5ybbcaptb23KrbW5ty622ubUt/J0TAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY/7kv9A2t7bl1ra8pG2+0Da/Zlu+sC1faJuXbAv/vLa5tS1faJtb2/KFbXlJ29zallttc2tbbrXNrW15Sdvc2pZbJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMf8yUfa5ta2fGFbfk3b/Jpt+cK23GqbW9vykm35Qtvc2hb+Ttv8mrb5wrbcaptb2/KSbfnCtrykbX7NCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DF/8l/Ylpe0za1tudU2X9iWW23za9rmC23zhW251Ta/Zlt+Tdt8YVtutc2tbbnVNre25VbbfGFbvtA2X2ibW9tyq21ubcuttrm1Lbfa5ta23GqbL5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAe0/1HPtA2L9kW/nltc2tbbrXNrW15Sdt8YVt+Tdvc2pZbbXNrW35N29zallttc2tbbrXNrW251TZf2JYvtM2tbbnVNre25SUnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx3T/kUttc2tbvtA2X9iWW23zhW35Qtv8mm251TZf2JZbbfOFbbnVNvydbbnVNre25Qttw9/Zli+0Df+8bflC29zallsnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx/zJf2Fbfs22/Jpt+ULb3NqWL2zLrba51Tb879qWX9M2v6Ztbm3LrW251Ta3tuULbXOrbW5tyxe25de0za1t4e+cAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHvMn/4W24d9tW25ty622+ULb3NqWW23DP69tfk3b3NqWX7Mt/J22+cK2fKFtfk3b3NqWL7TNr9mWL5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAe8ycf2Rb+Ttu8ZFv4O9tyq22+sC232ubXbMuvaRv+zrbcapsvtM2tbbm1Lbfa5gvb8mu25Qtt82tOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAj/mTH9Q2v2Zb+Dtt84VtubUtt9rmVtv8mra5tS232uZW27xkW77QNre25Qttc2tbbrXNrW15Sdvw79Y2t7bl1gkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxfwL/D21za1u+0DZfaBv+d23LF9rm1rZ8oW2+0Da3tuXWttxqm1vbwr/bttxqm1ttw985AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOZP4P9hW261za1tubUtt9rmC9tyq21ubcsX2uYL23KrbX5N29zallvbcqttbm3Lrbb5wrbcaptb2/KFtvk123KrbX7Nttxqm19zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMwJAAA85gQAAB5zAgAAjzkBAIDHnAAAwGNOAADgMScAAPCYEwAAeMyf/KBt4X9X23xhW261za22+ULbfGFbbrXNr9mWL7TNF9rm1ra8pG1+Tdv8mm35wrbcaptb2/KFbfk1JwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMf8yUfahv9d2/Jr2ubWtvyatvk123KrbW5tyxfa5ta23GqbW9vCP29bbrXNS9rmC9vyhba5tS232ubWtnzhBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JgTAAB4zAkAADzmBAAAHnMCAACPOQEAgMecAADAY04AAOAxJwAA8JjuPwIAAA85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOYEAAAecwIAAI85AQCAx5wAAMBjTgAA4DEnAADwmBMAAHjMCQAAPOb/Aw3xlwiC6z8EAAAAAElFTkSuQmCC",
  "nysactivity": "Campus Approach",
  "nysactivityother": "",
  "onlineinpersoneventtype": "In-person",
  "inpersoneventtypename": "Outreach/Community Event",
  "onlineeventtypename": "",
  "eventdescription": "Black Health along with other community organization offers community resources to students that are not accessible on campus.",
  "inpersoneventtypeid": 2,
  "onlineeventtypeid": null,
  "additionalmaterials": "",
  "createdbyname": "Marlo",
  "createdbylastname": "Judge",
  "workarea": null,
  "workareaother": null,
  "locationname": null,
  "locationnameother": null,
  "eventzipcode": null,
  "locationaddress": null,
  "icsurlfile": null,
  "borough": null,
  "posteventreportid": null
}
]

app.get('/report', (request, response) => {
      
  const context = {
    "month": "December",
    "masks": "32",
    "covidLiterature": "12",
    "vaccineRelatedLiterature": "65",
    "hivRelatedLiterature": "32",
    "hepCLiterature": "42",
    "saferSexkits": "",
    "healthDisparitiesLiterature": "21",
    "bagsBoxesFood": "4",
    "covidTests": "",
    "hivTests": "",
    "peopleTested": "",
    "womenTest": "",
    "menTested": "2",
    "blackPeople": "1",
    "hispanicPeople": 4,
    "americanIndianPeople": 21,
    "whitePeople": "21",
    "gayPeople": "",
    "bisexualPeople": "",
    "straightPeople": "",
    "minAge": "4",
    "maxAge": 21,
    "numberChallenges": "3"
  }
  pythonToExcelProcess = spawn('python', ['./monthlyReport.py']);
  console.log('comenzo a convertir');
  let dataOfFile = { type, names: nameOfFiles };

  pythonToExcelProcess.stdout.on('error', (err) => {
    console.log("err", err)
  });
  pythonToExcelProcess.stdout.on('data', (data) => {
    console.log("data", data.toString())
    // toExcelResponse += data.toString();
    // console.log(toExcelResponse, 'data');
  });
  pythonToExcelProcess.stdin.write(JSON.stringify(dataOfFile));
  console.log(JSON.stringify(dataOfFile));
  pythonToExcelProcess.on('close', (code) => {
    console.log('code', code);
    filesToDelete = nameOfFiles;
    nameOfFiles = [];
    console.log(filesToDelete);
    // deleteFiles(filesToDelete);
  });

  pythonToExcelProcess.stdin.end();
  pythonToExcelProcess.stdout.on('end', function () {
    response.send({ coverted: true });
  });
});

app.get('/create-license', (request, response) => {
  process = spawn('python', ['createlicense.py']);
  console.log('comenzo a convertir');
  let dataOfFile = { type, names: nameOfFiles };

  // if (!fs.existsSync('./docx/LicensePlantilla.docx')) {
  //   // dataOfFiles = { ...dataOfFile, excelName: nameOfExcel };

  //   fs.copyFile(
  //     './LicensePlantilla.docx',
  //     './docx/LicensePlantilla.docx',
  //     (err) => {
  //       if (err) {
  //         throw err;
  //       }
  //     }
  //   );
  // }
  process.stdout.on('data', (data) => {
    toExcelResponse += data.toString();
    console.log(toExcelResponse, 'data');
  });
  // process.stdin.write(JSON.stringify(dataOfFile));
  // console.log(JSON.stringify(dataOfFile));
  process.on('close', (code) => {
    // console.log('code', code);
    filesToDelete = nameOfFiles;
    nameOfFiles = [];
    console.log(filesToDelete);
    // deleteFiles(filesToDelete);
  });

  process.stdin.end();
  process.stdout.on('end', function () {
    response.send({ coverted: true });
  });
});

app.listen(port, () => {
  console.log('conextion correcta', port);
});

