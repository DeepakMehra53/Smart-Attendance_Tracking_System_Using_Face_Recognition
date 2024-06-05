from pythonMySQL import connection
import cv2
import dlib
import numpy as np
import os
import pickle
from datetime import datetime

classId = input()

cursor = connection.cursor()
query = """SELECT DISTINCT s.Email, s.encoding FROM Students s JOIN Sections sec ON s.SectionID = sec.SectionID JOIN Classes c ON sec.SectionID = c.SectionID JOIN Faculties f ON c.FacultyID = f.Email JOIN Branches student_branch ON s.BranchID = student_branch.BranchID JOIN Branches faculty_branch ON f.BranchID = faculty_branch.BranchID WHERE c.ClassID = %s AND student_branch.BranchID = faculty_branch.BranchID;"""
cursor.execute(query,(classId,))
rows = cursor.fetchall()
known_face_encodings = []
known_face_names = []
for row in rows:
    if( row[1] ):
        known_face_names.append(row[0])
        known_face_encodings.append(pickle.loads(row[1]))
query = """SELECT ci.CameraID
FROM Classes c
JOIN CameraID ci ON c.ClassLocationID = ci.ClassRoomID
WHERE c.ClassID = %s;"""
cursor.execute(query,(classId,))
rows = cursor.fetchall()
camersID = rows[0][0]
address = "https://192.168.172.202:8080/video"


known_face_encodings = np.array(known_face_encodings)
known_face_names = np.array(known_face_names)
attendance = []

# Function to recognize faces in live camera feed
def recognize_faces(face_embeddings, labels):
    cap = cv2.VideoCapture(camersID-1)
    
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
    face_recognizer = dlib.face_recognition_model_v1("dlib_face_recognition_resnet_model_v1.dat")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(frame)
        
        for face in faces:
            shape = predictor(gray, face)
            embedding = face_recognizer.compute_face_descriptor(frame, shape)
            
            distances = np.linalg.norm(face_embeddings - embedding, axis=1)
            min_distance_idx = np.argmin(distances)
            min_distance = distances[min_distance_idx]
            threshold = 0.5  # Adjust as needed
            #print(min_distance)
            if min_distance < threshold:
                label = labels[min_distance_idx]
                if label not in attendance:
                    attendance.append(label)
            else:
                label = "Unknown"
            
            x, y, w, h = face.left(), face.top(), face.width(), face.height()
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        cv2.imshow('Face Recognition', cv2.resize(frame, (1280, 720))) # Maximize the output frame
        if cv2.waitKey(1) & datetime.now().minute == 55 :
            for StudentID in attendance:
                print(StudentID)
                query = """UPDATE Attendance SET IsPresent = true where ClassID = %s AND StudentID = %s;"""
                cursor.execute(query,(classId,StudentID))
            breakcap.release()
    cv2.destroyAllWindows()


recognize_faces(known_face_encodings, known_face_names)