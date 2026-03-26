# Python Scholarship Portal (Flask + Firebase)

This is the Python version of the Scholarship Portal, built using **Flask** and **Firebase Admin SDK**.

## Prerequisites
1.  **Python 3.8+** installed.
2.  **Firebase Project**:
    *   Go to [Firebase Console](https://console.firebase.google.com/).
    *   Project Settings > Service Accounts.
    *   Click **Generate New Private Key**.
    *   Rename the downloaded file to `serviceAccountKey.json` and place it in the root directory.

## Setup Instructions
1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run the Application**:
    ```bash
    python app.py
    ```
    The app will start at `http://localhost:5000`.

## Key Features (Python Implementation)
-   **Firebase Admin SDK**: Securely manages Firestore data and User Authentication.
-   **Flask Routes**:
    -   `GET /`: Fetches and displays scholarships.
    -   `POST /api/scholarships`: Admin-only route to add new scholarships.
    -   `POST /api/complaints`: Allows users to submit complaints.
    -   `POST /login`: Verifies Firebase ID tokens and manages sessions.
-   **Security**: Role-based access control (RBAC) implemented in Python middleware.

## Note for College Submission
This Python code implements the **Backend-as-a-Service** pattern. It uses Python to handle all business logic, data validation, and database interactions, which satisfies the requirement for a Python-based application.
