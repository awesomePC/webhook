const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Controller = require("./controller");

const port = 8080;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const connectDB = async () => {
    try {
      const conn = await mongoose.connect('mongodb+srv://rrr:kfuture@cluster0.em9vgx2.mongodb.net/PythonGame', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
  
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      // process.exit(1);
    }
};
connectDB()

app.get("/check", Controller.check);
app.get("/", (req, res) => {res.send("Hello")});
app.post("/update", Controller.update);
app.post("/gamelog", Controller.gamelog);

//google sheet 

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
  const GameLog = require("./GameLog");
  const sheets = google.sheets({version: 'v4', auth});
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId: '1zPQQ6IpdzYc7gjr62AnTQ_6iwBcQWYNSKulhhV5Gx1s',
//     range: 'Sheet1',
//   });
//   const rows = res.data.values;
//   if (!rows || rows.length === 0) {
//     console.log('No data found.');
//     return;
//   }
//   console.log('Name, Major:');
//   rows.forEach((row) => {
//     // Print columns A and E, which correspond to indices 0 and 4.
//     console.log(`${row[0]}, ${row[4]}`);
//   });
    let date = new Date();
    
    date.setHours(0, 0, 0, 0);
    
    all_log = await GameLog.find({date: date});
    let values = []
    all_log.forEach(element => {
      let row = []
      row.push(element['qr_code']);
      let month = parseInt(element.date.getMonth())+1;
      row.push((element.date.getDate()>=10?element.date.getDate():"0"+element.date.getDate())+'-'+(month>=10?month:"0"+month)+'-'+element.date.getFullYear());
      row.push(element['game_id']);
      if(element['is_restart'] == 'false') {
        row.push((element['start_time'].getHours()>=10?element['start_time'].getHours():"0"+element['start_time'].getHours())+":"+(element['start_time'].getMinutes()>=10?element['start_time'].getMinutes():"0"+element['start_time'].getMinutes())+":"+(element['start_time'].getSeconds()>=10?element['start_time'].getSeconds():"0"+element['start_time'].getSeconds()));
        row.push(" ");
      } else {
        row.push(" ");
        row.push((element['restart_time'].getHours()>=10?element['restart_time'].getHours():"0"+element['restart_time'].getHours())+":"+(element['restart_time'].getMinutes()>=10?element['restart_time'].getMinutes():"0"+element['restart_time'].getMinutes())+":"+(element['restart_time'].getSeconds()>=10?element['restart_time'].getSeconds():"0"+element['restart_time'].getSeconds()));
      }
      // row.push((element['restart_time'].getHours()>=10?element['restart_time'].getHours():"0"+element['restart_time'].getHours())+":"+(element['restart_time'].getMinutes()>=10?element['restart_time'].getMinutes():"0"+element['restart_time'].getMinutes()));
      let min = (parseInt(element['duration'])/60).toFixed(0);
      let sec = parseInt(element['duration'])%60;
      // console.log(parseInt(element['duration'])%60,element['duration'],min,sec)
      row.push((min>=10?min:"0"+min)+":"+(sec>=10?sec:"0"+sec));
      row.push(element['payment']);
      values.push(row);
      
    });
    console.log(values)
    // function(c) {
    //   c = c.born.getHours();
    //   return c;
    // }
    // let values = [ ['Chris', 'Male', '1. Freshman'],['Chris', 'Male', '1. Freshman'],['Chris', 'Male', '1. Freshman']];

    const resource = {
        values,
      };
    
    sheets.spreadsheets.values.append({
        spreadsheetId: '11zVLA4Jj647Z6c2aDHRzvXir6g2p02Axz4P1vQp-sHQ',
        //mine
        // spreadsheetId: '1zPQQ6IpdzYc7gjr62AnTQ_6iwBcQWYNSKulhhV5Gx1s',
        range: 'Sheet1',
        valueInputOption: 'RAW',
        resource,
    }, (err, result) => {
        if (err) {
            console.log(err);
            // response.end('An error occurd while attempting to save data. See console output.');
        } else {
            const responseText = `${result.data.updates.updatedCells} cells appended.`;
            console.log(responseText);
            // response.end(responseText);
        }
    });
}


setInterval(()=>{
  console.log("start send data to sheet!");
  authorize().then(listMajors).catch(console.error);
}, 6*1000);
// 4*60*
//end google sheet
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});




