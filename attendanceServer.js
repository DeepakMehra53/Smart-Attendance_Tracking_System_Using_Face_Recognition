const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer  = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
// MySQL connection configuration
const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'project',
  password: 'Barwadia@2002',
  database: 'attendance_tracking'
});
// Connect to MySQL database
dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

let underObservence = [];
let now = new Date();
function checkScheduledClasses() {
  now = new Date();
  console.log(now.getMinutes() )
  if( now.getMinutes() === 0 )
  underObservence=[];
  dbConnection.query('SELECT * FROM Classes WHERE DateScheduled = DATE(CURDATE()) AND Timing = ?;',[now.getHours()], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return;
    }
    results.forEach(schedule => {
      if( !underObservence.includes(schedule.ClassID) )
      {
        underObservence.push(schedule.ClassID)
        //funtion to observer class
        let childProcess = exec(
          'python ' + path.join(__dirname , 'FaceReco' , 'trackClass.py'),
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout:\n${stdout}`);
          }
        );
        // Pass input to the child process
      childProcess.stdin.write(schedule.ClassID.toString());
      childProcess.stdin.end(); // Close the input stream

        
      }
      
    });
    console.log('Database results:', results);
  });
}


// Set interval to run the checkDatabase function every 5 seconds
setInterval(checkScheduledClasses, 5000);