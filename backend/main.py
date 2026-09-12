"""
Root entry point for the EcoLeak Backend API server.
Allows starting the server via:
  - python main.py
  - uvicorn main:app --reload
  - uvicorn app.main:app --reload
"""
import sys
import os
import uvicorn

# Ensure the backend directory is in the Python search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
