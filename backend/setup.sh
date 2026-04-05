#!/bin/bash

# 1. Detect the correct Python command
if command -v python3 &>/dev/null; then
    PY_CMD="python3"
else
    PY_CMD="python"
fi

echo "Using $PY_CMD to create Virtual Environment..."
$PY_CMD -m venv venv

# 2. Activate based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Detecting Windows environment..."
    source venv/Scripts/activate
    ACTIVATE_CMD="source venv/Scripts/activate"
else
    echo "Detecting Linux/Mac environment..."
    source venv/bin/activate
    ACTIVATE_CMD="source venv/bin/activate"
fi

# 3. Install Requirements
echo "Upgrading pip and installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 4. Environment Check
if [ ! -f .env ]; then
    echo "WARNING: .env not found. Copying .env.example..."
    cp .env.example .env
fi

echo "------------------------------------------------"
echo "SETUP COMPLETE!"
echo "To start the API, run these two commands:"
echo "  $ACTIVATE_CMD"
echo "  uvicorn app.main:app --reload"