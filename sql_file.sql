SHOW DATABASES;
drop database attendance_tracking;
use attendance_tracking;
create database attendance_tracking;
CREATE TABLE Admins (
    Email VARCHAR(100) UNIQUE NOT NULL,
    AdminName VARCHAR(100) NOT NULL,
    Password VARCHAR(50) NOT NULL
);

-- Default Admin
insert into Admins ( AdminName, Email, Password ) values ( "Ayush Jangid" , "ayush.admin@poornima.org" , "123" );
select * from Admins;
delete from Admins;

CREATE TABLE Branches (
    BranchID INT PRIMARY KEY AUTO_INCREMENT,
    BranchName VARCHAR(100) NOT NULL
    -- Add other relevant fields as needed
);
insert into Branches (BranchName) values ("Computer Science");
insert into Branches (BranchName) values ("Information Technology");
insert into Branches (BranchName) values ("Civil");
insert into Branches (BranchName) values ("Electronics and Communication");
insert into Branches (BranchName) values ("Machenical");
select * from Branches;
select * from Faculties;

CREATE TABLE Sections (
    SectionID INT PRIMARY KEY AUTO_INCREMENT,
    SectionName VARCHAR(100) NOT NULL
    -- Add other relevant fields as needed
);
insert into Sections (SectionName) values ("A");
insert into Sections (SectionName) values ("B");
insert into Sections (SectionName) values ("C");
insert into Sections (SectionName) values ("D");
select * from Sections where SectionID = 1;

CREATE TABLE Faculties (
    Email VARCHAR(100) UNIQUE NOT NULL,
    Name VARCHAR(100) NOT NULL,
    BranchID INT,
    Password VARCHAR(50) NOT NULL,
    Phone VARCHAR(15),
    FOREIGN KEY (BranchID) REFERENCES Branches(BranchID) ON DELETE SET NULL
);


CREATE TABLE Students (
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    BranchID INT,
    SectionID INT,
    Password VARCHAR(50) NOT NULL,
    Phone VARCHAR(15),
    DOB DATE,
    encoding blob,
    FOREIGN KEY (BranchID) REFERENCES Branches(BranchID) ON DELETE SET NULL,
    FOREIGN KEY (SectionID) REFERENCES Sections(SectionID) ON DELETE SET NULL
);
insert into Students values ("Anant Jain" , "2020anant@poornima.org" , 1 , 1 , "123" , "1234567890" , "2002-09-01");
select * from Classes;

SELECT * FROM Students JOIN Sections ON Students.SectionID = Sections.SectionID JOIN Branches ON Students.BranchID = Branches.BranchID WHERE Email = "w@ef";


SELECT * FROM Faculties JOIN Branches ON Faculties.BranchID = Branches.BranchID;


select * from Classes;


select * from Classes;



select * from Students;
CREATE TABLE Classes (
    ClassID INT PRIMARY KEY AUTO_INCREMENT,
    FacultyID VARCHAR(100),
    SubjectName VARCHAR(100) NOT NULL,
    DateScheduled DATE NOT NULL,
    Timing INT NOT NULL,
    SectionID INT,
    ClassLocationID VARCHAR(100) NOT NULL,
    FOREIGN KEY (FacultyID) REFERENCES Faculties(Email) ON DELETE SET NULL,
    FOREIGN KEY (SectionID) REFERENCES Sections(SectionID) ON DELETE SET NULL
);





drop table Classes;

SELECT * FROM Classes JOIN Sections ON Classes.SectionID = Sections.SectionID WHERE FacultyID = 'wdwd@ede' AND DATE(DateScheduled) = CURDATE() ORDER BY Timing ASC;

SELECT * FROM Faculties;

CREATE TABLE Attendance (
    ClassID INT,
    StudentID VARCHAR(100),
    IsPresent BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Students(Email) ON DELETE CASCADE
);
UPDATE Attendance SET IsPresent = false where ClassID = 6 AND StudentID = "ayush@poornima.org";
select * from Attendance;

CREATE TABLE CameraID (
    ClassRoomID VARCHAR(100),
    CameraID INT
);

insert into CameraID ( ClassRoomID , CameraID) values ( "CS-A" , 1 );
insert into CameraID ( ClassRoomID , CameraID) values ( "CS-B" , 2 );
insert into CameraID ( ClassRoomID , CameraID) values ( "CS-C" , 3 );
insert into CameraID ( ClassRoomID , CameraID) values ( "CS-D" , 4 );

select * from Students;

DROP TRIGGER insert_attendance_trigger;

DELIMITER $$

CREATE TRIGGER insert_attendance_trigger AFTER INSERT ON Classes
FOR EACH ROW
BEGIN
    -- Insert attendance records for all students in the same section as the newly inserted class
    INSERT INTO Attendance (ClassID, StudentID, IsPresent)
    SELECT NEW.ClassID, Students.Email, FALSE
    FROM Students
    JOIN Sections ON Students.SectionID = Sections.SectionID
    JOIN Faculties ON NEW.FacultyID = Faculties.Email
    WHERE Sections.SectionID = NEW.SectionID
    AND Students.BranchID = Faculties.BranchID;
END$$

DELIMITER ;





delete from Classes;

select * from Classes;
select * from Attendance;

SELECT * FROM Students JOIN Sections ON Students.SectionID = Sections.SectionID JOIN Branches ON Students.BranchID = Branches.BranchID;
-- show tables;
-- drop table Branches;
SELECT Classes.SubjectName, 
Faculties.Name AS FacultyName, 
Classes.ClassLocationID, 
Classes.Timing, 
Attendance.IsPresent;

SELECT Classes.SubjectName, Faculties.Name AS FacultyName, Classes.ClassLocationID, Classes.Timing, Attendance.IsPresent FROM Classes 
JOIN Faculties ON Classes.FacultyID = Faculties.Email 
JOIN Sections ON Classes.SectionID = Sections.SectionID 
JOIN Students ON Sections.SectionID = Students.SectionID AND Students.Email = "ayush@poornima.org" AND Students.BranchID = Faculties.BranchID
LEFT JOIN Attendance ON Classes.ClassID = Attendance.ClassID AND Attendance.StudentID = "ayush@poornima.org"
WHERE DATE(DateScheduled) = CURDATE() 
ORDER BY Timing ASC;

select * from Students;




SELECT DISTINCT s.Name, s.Email, s.sectionID, s.BranchID
FROM Students s
JOIN Sections sec ON s.SectionID = sec.SectionID
JOIN Classes c ON sec.SectionID = c.SectionID
JOIN Faculties f ON c.FacultyID = f.Email
JOIN Branches b1 ON s.BranchID = b1.BranchID
JOIN Branches b2 ON f.BranchID = b2.BranchID
WHERE c.ClassID = 6
AND b1.BranchID = b2.BranchID;

SELECT DISTINCT s.Name, s.Email, s.sectionID, s.BranchID, c.ClassLocationID
FROM Students s
JOIN Sections sec ON s.SectionID = sec.SectionID
JOIN Classes c ON sec.SectionID = c.SectionID
JOIN Faculties f ON c.FacultyID = f.Email
JOIN Branches student_branch ON s.BranchID = student_branch.BranchID
JOIN Branches faculty_branch ON f.BranchID = faculty_branch.BranchID
WHERE c.ClassID = 6
AND student_branch.BranchID = faculty_branch.BranchID;


SELECT DISTINCT s.Name, s.Email, s.SectionID, s.BranchID, c.ClassLocationID, ci.CameraID
FROM Students s
JOIN Sections sec ON s.SectionID = sec.SectionID
JOIN Classes c ON sec.SectionID = c.SectionID
JOIN Faculties f ON c.FacultyID = f.Email
JOIN Branches student_branch ON s.BranchID = student_branch.BranchID
JOIN Branches faculty_branch ON f.BranchID = faculty_branch.BranchID
JOIN CameraID ci ON c.ClassLocationID = ci.ClassRoomID
WHERE c.ClassID = 6
AND student_branch.BranchID = faculty_branch.BranchID;

select * from CameraID;

SELECT ci.CameraID
FROM Classes c
JOIN CameraID ci ON c.ClassLocationID = ci.ClassRoomID
WHERE c.ClassID = 6;



SELECT DISTINCT s.Name, s.Email, s.encoding FROM Students s JOIN Sections sec ON s.SectionID = sec.SectionID
JOIN Classes c ON sec.SectionID = c.SectionID
JOIN Faculties f ON c.FacultyID = f.Email
JOIN Branches student_branch ON s.BranchID = student_branch.BranchID
JOIN Branches faculty_branch ON f.BranchID = faculty_branch.BranchID
WHERE c.ClassID = 6
AND student_branch.BranchID = faculty_branch.BranchID;







SELECT 
    Classes.SubjectName,
    Faculties.Name AS FacultyName,
    Classes.ClassLocationID,
    Classes.Timing,
    Attendance.IsPresent 
FROM 
    Classes 
JOIN 
    Faculties ON Classes.FacultyID = Faculties.Email 
JOIN 
    Sections ON Classes.SectionID = Sections.SectionID 
JOIN 
    Students ON Sections.SectionID = Students.SectionID 
LEFT JOIN 
    Attendance ON Classes.ClassID = Attendance.ClassID 
                AND Attendance.StudentID = "anant@poornima.org"
WHERE 
    Students.Email = "anant@poornima.org"
    AND Students.BranchID = (
        SELECT BranchID 
        FROM Faculties 
        WHERE Email = Classes.FacultyID
    )
    AND DATE(DateScheduled) = CURDATE() 
ORDER BY 
    Timing ASC;


select * from Classes;



select * from Attendance;


-- create database attendance_tracking;
-- use attendance_tracking;
-- drop database attendance_tracking;
