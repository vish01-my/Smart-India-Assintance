from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-for-sessions')

# 1. Initialize Firebase Admin SDK
# Note: You will need to download your serviceAccountKey.json from Firebase Console
# Project Settings > Service Accounts > Generate New Private Key
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Firebase initialization error: {e}")
    print("Make sure you have serviceAccountKey.json in the root directory.")

db = firestore.client()

# --- Middleware for Auth ---
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    try:
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            return user_doc.to_dict()
    except:
        return None
    return None

# --- Routes ---

@app.route('/')
def index():
    """Home page: List all scholarships"""
    scholarships_ref = db.collection('scholarships')
    scholarships = [doc.to_dict() for doc in scholarships_ref.stream()]
    user = get_current_user()
    return render_template('index.html', scholarships=scholarships, user=user)

@app.route('/api/scholarships', methods=['GET'])
def get_scholarships():
    scholarships_ref = db.collection('scholarships')
    docs = scholarships_ref.stream()
    return jsonify([{**doc.to_dict(), 'id': doc.id} for doc in docs])

@app.route('/api/scholarships', methods=['POST'])
def add_scholarship():
    """Admin only: Add a new scholarship"""
    user = get_current_user()
    if not user or user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    data['createdAt'] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection('scholarships').add(data)
    return jsonify({'id': doc_ref[1].id, 'message': 'Scholarship added successfully'})

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    """Submit a new complaint"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Login required'}), 401
    
    data = request.json
    data['userId'] = user_id
    data['status'] = 'Pending'
    data['createdAt'] = datetime.utcnow().isoformat()
    
    db.collection('complaints').add(data)
    return jsonify({'message': 'Complaint submitted successfully'})

@app.route('/admin/complaints')
def manage_complaints():
    """Admin only: View all complaints"""
    user = get_current_user()
    if not user or user.get('role') != 'admin':
        return redirect(url_for('index'))
    
    complaints_ref = db.collection('complaints').order_by('createdAt', direction=firestore.Query.DESCENDING)
    complaints = [{**doc.to_dict(), 'id': doc.id} for doc in complaints_ref.stream()]
    return render_template('admin_complaints.html', complaints=complaints, user=user)

@app.route('/login', methods=['POST'])
def login():
    """Handle login (Token verification from Firebase JS SDK)"""
    id_token = request.json.get('idToken')
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        session['user_id'] = uid
        
        # Ensure user exists in Firestore
        user_ref = db.collection('users').document(uid)
        if not user_ref.get().exists:
            user_ref.set({
                'uid': uid,
                'email': decoded_token.get('email'),
                'displayName': decoded_token.get('name', 'User'),
                'role': 'user', # Default role
                'createdAt': datetime.utcnow().isoformat()
            })
            
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
