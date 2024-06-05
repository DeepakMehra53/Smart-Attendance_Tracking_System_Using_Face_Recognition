const mysql = require('mysql');
const Excel = require('exceljs');

// Create a connection pool to the database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'project',
  password: 'Barwadia@2002',
  database: 'attendance_tracking'
});

// Query to retrieve attendance information
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
  Faculties.Email = 'ashima.faculty@poornima.org' -- Replace with the faculty email
AND 
  DATE(Classes.DateScheduled) = DATE('2024-04-27') -- Replace with the selected date
ORDER BY 
  Sections.SectionName ASC, Students.Name ASC, Classes.Timing ASC;
`;

// Execute the query using the pool
pool.query(query, (err, results) => {
  if (err) {
    console.error('Error executing query:', err);
    return;
  }

  //console.log('Query results:');
  //console.log(results[0]);

  // Create a new workbook
  const workbook = new Excel.Workbook();

  console.log(results)

  // Group the results by section
  const sections = {};
  results.forEach(row => {
    if (!sections[row.Section]) {
      sections[row.Section] = [];
    }
    sections[row.Section].push(row);
  });

  // Create a worksheet for each section
  for (const sectionName in sections) {
    if (sections.hasOwnProperty(sectionName)) {
      const sectionRows = sections[sectionName];
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
  const fileName = 'attendance.xlsx';
  workbook.xlsx.writeFile(fileName)
    .then(() => {
      console.log('Excel file created successfully:', fileName);
    })
    .catch((err) => {
      console.error('Error creating Excel file:', err);
    });

  // Release the pool
  pool.end((err) => {
    if (err) {
      console.error('Error closing pool:', err);
    } else {
      console.log('Pool closed');
    }
  });
});
