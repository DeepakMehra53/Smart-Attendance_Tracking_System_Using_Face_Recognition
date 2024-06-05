from pythonMySQL import connection  
import dlib
import numpy as np
import os
import pickle
def get_file_by_prefix(directory, prefix):
    files = os.listdir(directory)
    for file in files:
        if file.startswith(prefix):
            return os.path.join(directory, file)
# function Load the image of the person you want to recognize
def encodeStudent(sid):
    sidImageLocation = get_file_by_prefix( os.path.join(os.getcwd() , 'studentpic'),sid)
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("./shape_predictor_68_face_landmarks.dat")
    face_recognizer = dlib.face_recognition_model_v1("./dlib_face_recognition_resnet_model_v1.dat")
    img = dlib.load_rgb_image(sidImageLocation)
    faces = detector(img)
    
    for face in faces:
                shape = predictor(img, face)
                embedding = face_recognizer.compute_face_descriptor(img, shape)
                cursor = connection.cursor()
                #print(embedding)
                query = "UPDATE Students SET encoding = %s WHERE Email = %s"
                identifier = sid
                encoding = np.array(embedding)
                encoding_bytes = pickle.dumps(encoding)
                #print(pickle.loads(encoding_bytes))
                try:
                    cursor.execute(query, (encoding_bytes,identifier))
                    connection.commit()
                    print("Data inserted successfully!")
                except Exception as e:
                    print("Error:", e)
                cursor.close()
sid = input()
encodeStudent(sid)