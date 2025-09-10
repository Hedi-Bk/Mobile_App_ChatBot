from flask import Flask ,request,jsonify
import os
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
from flask_cors import CORS



app =Flask(__name__)
CORS(app)  # Autorise toutes les origines

@app.route('/')
def index():
    return "APIs Is working fine 🟢"


################ 1. OCR API ################
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
modelOCR = ocr_predictor(pretrained=True)

def extract_text_from_image(file_path) :
    output =""
    doc =DocumentFile.from_images(file_path)
    print("Inference starting 🟢...")
    startingTime = time.time()
    result = modelOCR(doc)
    endingTime =time.time()
    print(f"Inference End ,Duration :{endingTime-startingTime}👌...")
    for block in result.pages[0].blocks :
        for line in block.lines :
            output = output +" ".join([word.value for word in line.words]) +","
    return output

# Dossier pour stocker temporairement les fichiers
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload_ocr_image',methods=['POST'])
def get_ocr():
    if "ocr_image" not in request.files :
        return jsonify({'error': 'Aucun fichier envoyé nommé image'}), 400
    image = request.files['ocr_image']
    print("1️⃣ IMGAE SAVED from upload_ocr_image API")

    filename = secure_filename(image.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    image.save(file_path) # Sauvegarde du fichier
    # Appel de ta fonction d’analyse
    print("2️⃣Start Extract Process from detect_object API ....")

    extracted_text = extract_text_from_image(file_path)
    print("3️⃣END Extract Process from detect_object API ....")

    return jsonify({'text': str(extracted_text)})









################ 2. Objet detetcion API ################
from ultralytics import YOLO
model = YOLO('yolov8n.pt')

@app.route("/detect_object",methods=['POST'])
def detect_object():
    if "obj_image" not in request.files :
        return jsonify({'error': 'Aucun fichier envoyé nommé image'}), 400
    image = request.files['obj_image']

    filename = secure_filename(image.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    # 🟩 Sauvegarde du fichier dans le dossier
    image.save(file_path)

    all_classes =set()
    print("Start Prediction ...")
    results = model(file_path)
    for result in results :
        boxes = result.boxes 
        for box in boxes :
            classId = box.cls
            className = model.names[int(classId)]
            all_classes.add(className)
    all_classes = list(all_classes)
    result = " , ".join(all_classes)
    print("We Got the prediction ...")
    output = {
        "classes" : result
    }
    extra =request.args.get('extra')
    if extra : 
        output["extra"]= extra


    return jsonify(output),200









################ 3. Similarity Match ################

from sentence_transformers import SentenceTransformer, util
import time 

modelMatch =SentenceTransformer('all-MiniLM-L6-v2')
@app.route("/match",methods=['POST'])
def match():

    data=request.get_json()
    text1 ,text2 =  data["ocr_text"],data["detected_obj"]
    emb1 = modelMatch.encode(text1, convert_to_tensor=True)
    emb2 = modelMatch.encode(text2, convert_to_tensor=True)

    startTime = time.time()
    score3 = (util.pytorch_cos_sim(emb1, emb2)[0][0]*100).item()
    endTime= time.time()

    print("End Trransformer test " , endTime-startTime)

    return jsonify({"score":round(score3,2)}),200






################ 4. RAG API ################

from flask import Flask, request, jsonify
from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.services.databases import Databases
import requests
import os
from dotenv import load_dotenv


# 🔹 Config Appwrite
client = Client()
client.set_endpoint("https://fra.cloud.appwrite.io/v1") \
      .set_project("6890ac0c0025fba392a6") \
      .set_key("standard_7f651bcd920398546e48d7b493066f4430d9a4cfce8d7c8254150e8c521852810b98919311afe685c20e7962eaf4923fd3724245c4880dfc98f7a51b662a4c46f53d626297c5a258decc604c66f8ffd8f02a881cd6a820d87275b539808a05185ad769cb1c63d601fe3358a29b2e0d042440bd78acc9f57dad116ec282678a79")


# 🔹 Services
users = Users(client)
db = Databases(client)


# 🔹 Route pour le RAG chatbot
@app.route("/rag_chat", methods=["POST"])
def rag_chat():
    data = request.json
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Question vide"}), 400

    # 🔹 Récupérer les données depuis Appwrite
    try:
        user_list = users.list()
        user_count = user_list.get("total", 0)
        docs_list = db.list_documents("notes-db", "user-historique")
        documents = docs_list.get("documents", [])
    except Exception as e:
        return jsonify({"error": f"Erreur Appwrite : {str(e)}"}), 500

    
    # ======================================================
    # 🔹 Construire le contexte des utilisateurs
    # ======================================================
    # 🔹 Construire le contexte JSON fusionné
    context = {
        "user_count": user_count,
        "users": [
            {
                "name": user.get("name"),
                "id": user.get("$id"),
                "email": user.get("email"),
                "is_admin": "admin" in user.get("labels", []),
                "created_at": user.get("$createdAt"),
                "updated_at": user.get("$updatedAt")
            }
            for user in user_list.get("users", [])
        ],
        "documents_count": len(documents),
        "documents": [
            {
                "user_id": doc.get("user_id"),
                "objectDetected": doc.get("objectDetected"),
                "OCR": doc.get("OCR"),
                "similarityScore": doc.get("similarityScore"),
                "created_at": doc.get("createdAt"),
                "updated_at": doc.get("$updatedAt")
            }
            for doc in documents
        ]
    }

    # 🔹 Prompt pour OpenRouter / OpenAI
    # 🔹 Prompt pour OpenRouter / OpenAI
    rag_prompt = f"""
    Tu es un assistant intelligent spécialisé dans l'analyse de la base de données d'une plateforme.
    Cette plateforme est utilisée par les clients pour enregistrer leurs factures (achats, ventes, produits)
    afin de conserver un historique des transactions.

    L'admin de la plateforme va te poser des questions concernant ces données.
    Ton rôle est de répondre uniquement en te basant sur le contexte JSON fourni.

    Structure du contexte :
    - "user_count" : nombre total des utilisateurs de la plateforme
    - "users" : tableau avec les informations des utilisateurs (id, name, email, is_admin, created_at, updated_at)
    - "documents_count" : nombre total des factures enregistrées par tous les utilisateurs
    - "documents" : tableau contenant l’historique des factures (objectDetected, OCR, similarityScore, dates)
        ⚠️ Important : chaque facture est reliée à un utilisateur via la correspondance entre
        "documents.user_id" et "users.id".

    Voici le contexte :
    {context}

    Question de l’admin : {question}

    Réponse (basée uniquement sur le contexte et en respectant la correspondance entre user_id et id) :
    """

    load_dotenv()

    # 🔹 Appel LLM via OpenRouter
    api_key = os.environ.get("OPENAI_API_KEY")
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-oss-20b:free",
                "messages": [{"role": "user", "content": rag_prompt}],
            },
        )
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]
        if "assistantfinal" in reply:
            reply = reply.split("assistantfinal")[-1].strip()

    except Exception as e:
        return jsonify({"error": f"Erreur LLM : {str(e)}"}), 500

    return jsonify({"response": reply})





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
