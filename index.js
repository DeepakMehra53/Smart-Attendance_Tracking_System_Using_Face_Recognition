const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer  = require('multer');
const Excel = require('exceljs');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
let user = undefined;

const app = express();

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());
// Parse incoming requests with URL-encoded payloads
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'front')));
// Simple in-memory database for demonstration purposes

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'studentpic'))
  },
  filename: function (req, file, cb) {
    const extension=file.originalname.split('.');
    const fn = user+'.'+extension[extension.length-1];
    cb(null, fn)
  }
})

const upload = multer({ storage: storage,
  fileFilter: function (req, file, cb) {
    // Check if the file extension is allowed
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true); // Allow the file to be uploaded
    } else {
        cb(new Error('Only images with jpeg, jpg, png, or gif extensions are allowed'));
    }
} 
})


// Create a MySQL database connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'project',
    password: 'Barwadia@2002',
    database: 'attendance_tracking'
  });


// Define a route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'Home.html'));
});

// Route for user login
// Handle POST request for login form submission
app.post('/admin-login', (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    user = email;
    const password = req.body.password;
    // Query the database to check if the user exists
    pool.query('SELECT * FROM Admins WHERE Email = ? AND Password = ?', [email, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }
        
        if (results.length === 1) {
        // User found, login successful
        res.sendFile(path.join(__dirname, 'front', 'admin.html'));
        console.log('Admin Login successful!');

      } else {
        // User not found or invalid credentials
        const htmlResponse = `
    <html>
      <body>
        <script>
          alert("Wrong Password ! ! ! ");
          window.location.href = "/admin-login.html";
        </script>
      </body>
    </html>
  `;
  res.send(htmlResponse);
      }
    });
  });

  app.post('/faculty-login', (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    user = email;
    const password = req.body.password;
    // Query the database to check if the user exists
    pool.query('SELECT * FROM Faculties WHERE Email = ? AND Password = ?', [email, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }
        
        if (results.length === 1) {
        // User found, login successful
        res.sendFile(path.join(__dirname, 'front', 'faculty.html'));
        console.log('Admin Login successful!');

      } else {
        // User not found or invalid credentials
        const htmlResponse = `
    <html>
      <body>
        <script>
          alert("Wrong Password ! ! ! ");
          window.location.href = "/admin-login.html";
        </script>
      </body>
    </html>
  `;
  res.send(htmlResponse);
      }
    });
  });
  
  app.post('/student-login', (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    user = email;
    const password = req.body.password;
    // Query the database to check if the user exists
    pool.query('SELECT * FROM Students WHERE Email = ? AND Password = ?', [email, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }
        console.log(results.length)
        if (results.length === 1) {
        // User found, login successful
        res.sendFile(path.join(__dirname, 'front', 'student.html'));
        console.log('Student Login successful!');
      } 
      else {
        // User not found or invalid credentials
        const htmlResponse = `
    <html>
      <body>
        <script>
          alert("Wrong Password ! ! ! ");
          window.location.href = "/admin-login.html";
        </script>
      </body>
    </html>
  `;
  res.send(htmlResponse);
      }
    });
  });

  app.post('/register-student', (req, res) => {
    console.log(req.body);
    const Branch = req.body.Branch;
    const Section = req.body.Section;
    const Student_Name = req.body.Student_Name;
    const Email = req.body.Email;
    const password = req.body.password;
    const phone = req.body.phone;
    const DOB = req.body.DOB;
    pool.query('SELECT * FROM Branches WHERE BranchName = ?;', [Branch], (error, SBranch) => {
      if (error) {
          console.error('Error querying database:', error);
          return res.status(500).send('Internal Server Error');
      } else {
        pool.query('SELECT * FROM Sections WHERE SectionName = ?;', [Section], (error, SSection) => {
          if (error) {
              console.error('Error querying database:', error);
              return res.status(500).send('Internal Server Error');
          } else {
            pool.query('INSERT INTO Students (Name, Email, BranchID, SectionID, Password, Phone, DOB) VALUES ( ?, ?, ?, ?, ?, ?, ?);', [Student_Name, Email, SBranch[0].BranchID , SSection[0].SectionID , password, phone, DOB], (error, results) => {
              if (error) {
                  console.error('Error querying database:', error);
                  return res.status(500).send('Internal Server Error');
              } else {
                  const htmlResponse = `
          <html>
            <body>
              <script>
                alert("Student Added Successfuly ! ! ! ");
                window.location.href = "/admin.html";
              </script>
            </body>
          </html>
        `;
        res.send(htmlResponse);
              }
          });
          }
      });
      }
  });
  });


  app.post('/register-faculty', (req, res) => {
    console.log(req.body);
    const Branch = req.body.Branch;
    const Name = req.body.Name;
    const phone = req.body.phone;
    const Email = req.body.Email;
    const password = req.body.password;
    pool.query('SELECT * FROM Branches WHERE BranchName = ?;', [Branch], (error, SBranch) => {
      if (error) {
          console.error('Error querying database:', error);
          return res.status(500).send('Internal Server Error');
      } else {
        pool.query('INSERT INTO Faculties (Email, Name, BranchID, Password, Phone) VALUES (?, ?, ?, ?, ?);', [Email, Name, SBranch[0].BranchID, password, phone], (error, results) => {
          if (error) {
              console.error('Error querying database:', error);
              return res.status(500).send('Internal Server Error');
          } else {
              const htmlResponse = `
      <html>
        <body>
          <script>
            alert("Faculty Added Successfuly ! ! ! ");
            window.location.href = "/facultyregister.html";
          </script>
        </body>
      </html>
    `;
    res.send(htmlResponse);
          }
      });
      }
  });
  });


  app.post('/add-class', (req, res) => {
    const Section = req.body.Section; 
    const Class_Room = req.body.Class_Room; 
    const Subject_Name = req.body.Subject_Name;
    const Timing = parseInt(req.body.Timing);
    const ClassDate = req.body.ClassDate;
    pool.query('SELECT * FROM Sections WHERE SectionName = ?;', [Section], (error, SSection) => {
      if (error) {
          console.error('Error querying database:', error);
          return res.status(500).send('Internal Server Error');
      } else {
          pool.query('INSERT INTO Classes (FacultyID, SubjectName, DateScheduled, Timing, SectionID, ClassLocationID) VALUES (?, ?, ?, ?, ?,?);', [user, Subject_Name, ClassDate, Timing, SSection[0].SectionID, Class_Room ], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        } else {
          console.log( results );
            const htmlResponse = `
    <html>
      <body>
        <script>
          alert("Class Added Successfuly ! ! ! ");
          window.location.href = "/addclass.html";
        </script>
      </body>
    </html>
  `;
  res.send(htmlResponse);
        }
    });
  }
});
  });
  

  // Route to fetch all faculty data
  app.get('/faculty-data', (req, res) => {
    const query = 'SELECT * FROM Faculties JOIN Branches ON Faculties.BranchID = Branches.BranchID;';
    // Use the pool to acquire a connection and execute the query
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching faculty data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

// Route to fetch all student data
app.get('/student-data', (req, res) => {
  const query = 'SELECT * FROM Students JOIN Sections ON Students.SectionID = Sections.SectionID JOIN Branches ON Students.BranchID = Branches.BranchID;';
  // Use the pool to acquire a connection and execute the query
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});



app.get('/faculty-schedule', (req, res) => {
  const query = 'SELECT * FROM Classes JOIN Sections ON Classes.SectionID = Sections.SectionID WHERE FacultyID = ? AND DATE(DateScheduled) = CURDATE() ORDER BY Timing ASC;';
  // Use the pool to acquire a connection and execute the query
  pool.query(query, [user], (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log(results);
    res.json(results);
  });
});


app.get('/student-schedule', (req, res) => {
  const query = 'SELECT Classes.SubjectName, Faculties.Name AS FacultyName, Classes.ClassLocationID, Classes.Timing, Attendance.IsPresent FROM Classes JOIN Faculties ON Classes.FacultyID = Faculties.Email JOIN Sections ON Classes.SectionID = Sections.SectionID JOIN Students ON Sections.SectionID = Students.SectionID AND Students.Email = ? AND Students.BranchID = Faculties.BranchID LEFT JOIN Attendance ON Classes.ClassID = Attendance.ClassID AND Attendance.StudentID = ? WHERE DATE(DateScheduled) = CURDATE() ORDER BY Timing ASC;';
  // Use the pool to acquire a connection and execute the query
  pool.query(query, [user,user], (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log(results);
    res.json(results);
  });
});

// Route to fetch all student data
app.get('/student-info', (req, res) => {
  const query = 'SELECT * FROM Students JOIN Sections ON Students.SectionID = Sections.SectionID JOIN Branches ON Students.BranchID = Branches.BranchID WHERE Email = ?;';
  console.log(user);
  // Use the pool to acquire a connection and execute the query
  pool.query(query, [user], (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});
app.get('/faculty-name', (req, res) => {
  const query = 'SELECT * FROM Faculties where Email = ?;';
  // Use the pool to acquire a connection and execute the query
  pool.query(query, [user], (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.post('/student-photo', upload.single('imageFile'), (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }
  // File uploaded successfully
  const htmlResponse = `
    <html>
      <body>
        <script>
          alert("Image Modified Successfuly ! ! ! ");
          window.location.href = "/student.html";
        </script>
      </body>
    </html>
  `;
  let childProcess = exec(
    'python ' + path.join(__dirname, 'FaceReco', 'encodeStudent.py'),
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
  childProcess.stdin.write(user);
  childProcess.stdin.end(); // Close the input stream
  res.send(htmlResponse);
});
app.use('/images', express.static(path.join(__dirname, 'studentpic')));
/*app.get('/get-student-image', (req, res) => {
  // Assuming 'example.jpg' is the image you want to send
  const imagePath = path.join(__dirname, 'studentpic', user+".jpg");
  res.sendFile(imagePath);
});*/
app.get('/get-student-image', (req, res) => {

  //const user = req.query.user; // Assuming user is passed as a query parameter
  const imageDir = path.join(__dirname, 'studentpic');
  fs.readdir(imageDir, (err, files) => {
    console.log(imageDir)
      if (err) {
          console.error("Error reading directory:", err);
          return res.status(500).send("Internal Server Error");
      }
      const imageFile = files.find(file => file.startsWith(user));
      if (!imageFile) {
          return res.status(404).send("Image not found for the user");
      }
      res.sendFile(path.join(imageDir, imageFile));
  });
});


app.post('/generate_attendance_zip', (req, res) => {
  const query = `
  SELECT 
    Students.Name AS StudentName,
    Students.Email AS StudentEmail,
    Sections.SectionName AS Section,
    Classes.SubjectName AS Subject,
    Classes.ClassLocationID AS ClassLocation,
    Classes.Timing AS Timing,
    CASE WHEN Attendance.IsPresent THEN 'Present' ELSE 'Absent' END AS AttendanceStatus
  FROM 
    Classes
  JOIN 
    Faculties ON Classes.FacultyID = Faculties.Email
  JOIN 
    Sections ON Classes.SectionID = Sections.SectionID
  JOIN 
    Students ON Sections.SectionID = Students.SectionID
  LEFT JOIN 
    Attendance ON Classes.ClassID = Attendance.ClassID AND Attendance.StudentID = Students.Email
  WHERE 
    Faculties.Email = '${user}' -- Replace with the faculty email
  AND 
    DATE(Classes.DateScheduled) = DATE('${req.body.date}') -- Replace with the selected date
  ORDER BY 
    Sections.SectionName ASC, Students.Name ASC, Classes.Timing ASC;
  `;
  
  // Execute the query using the pool
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    const workbook = new Excel.Workbook();
    // Group the results by section
    const sections = {};
    results.forEach(row => {
      if (!sections[row.Timing]) {
        sections[row.Timing] = [];
      }
      sections[row.Timing].push(row);
    });
  
    // Create a worksheet for each section
    for (const classTiming in sections) {
      if (sections.hasOwnProperty(classTiming)) {
        const sectionRows = sections[classTiming];
        const firstRow = sectionRows[0];
        console.log(sectionRows);
        const worksheetName = `${firstRow.Section}_${firstRow.Timing}-${parseInt(firstRow.Timing) + 1}_${firstRow.Subject}_${firstRow.ClassLocation}`;
        const worksheet = workbook.addWorksheet(worksheetName);
  
        // Add headers
        const headers = ['StudentName', 'StudentEmail', 'AttendanceStatus'];
        worksheet.addRow(headers);
  
        // Add data
        sectionRows.forEach(row => {
          const rowData = headers.map(header => row[header]);
          worksheet.addRow(rowData);
        });
  
        // Set column widths to auto
        worksheet.columns.forEach((column, i) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            maxLength = Math.max(maxLength, (cell.value || '').toString().length);
          });
          column.width = maxLength < 10 ? 10 : maxLength + 2;
        });
      }
    }

    // Save the workbook
  /*const fileName = 'attendance.xlsx';
  workbook.xlsx.writeFile(fileName)
    .then(() => {
      console.log('Excel file created successfully:', fileName);
    })
    .catch((err) => {
      console.error('Error creating Excel file:', err);
    });
*/

    workbook.xlsx.writeBuffer().then(buffer => {
      // Set the response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance_'+req.body.date+'.xlsx"');
      
      // Send the workbook buffer to the client
      res.status(200).send(buffer);
      console.log("Attendance sent successfully > > > ")
    }).catch((err) => {
      console.log('Error:', err);
      res.status(500).send('Error generating workbook');
    });
  });
});




app.post('/change-password', (req, res) => {
  const oldpass = req.body.oldpass;
  const newpass = req.body.newpass;
  pool.query('SELECT * FROM Students WHERE Email = ? AND Password = ?', [user, oldpass], (error, results) => {
      if (error) {
          console.error('Error querying database:', error);
          return res.status(500).send('Internal Server Error');
      }
      if (results.length === 1) {
        pool.query('UPDATE Students SET Password=? WHERE Email=?;', [newpass, user], (error, results) => {
          if (error) {
              console.error('Error querying database:', error);
              return res.status(500).send('Internal Server Error');
          }
          else {
            const htmlResponse = `
    <html>
      <body>
        <script>
          alert("Password changed Successfuly ! ! ! ");
          window.location.href = "/changepassword.html";
        </script>
      </body>
    </html>
  `;
  res.send(htmlResponse);
          }
      });
    } else {
      pool.query('SELECT * FROM Faculties WHERE Email = ? AND Password = ?', [user, oldpass], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 1) {
          pool.query('UPDATE Faculties SET Password=? WHERE Email=?;', [newpass, user], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                return res.status(500).send('Internal Server Error');
            }
            else {
              const htmlResponse = `
      <html>
        <body>
          <script>
            alert("Password changed Successfuly ! ! ! ");
            window.location.href = "/changepassword.html";
          </script>
        </body>
      </html>
    `;
    res.send(htmlResponse);
            }
        });
      } else {
        const htmlResponse = `
      <html>
        <body>
          <script>
            alert("Credentials are incorrect ! ! ! ");
            window.location.href = "/changepassword.html";
          </script>
        </body>
      </html>
    `;
    res.send(htmlResponse);
      }
    });
    } 
  });
});


// Start the server
const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});