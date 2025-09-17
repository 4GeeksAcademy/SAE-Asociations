#!/usr/bin/env bash
# exit on error
set -o errexit

# PRIMERO instalar pipenv
pip install pipenv

# LUEGO instalar dependencias Python
pipenv install

# FINALMENTE el build de Node.js y el upgrade
npm install
npm run build
pipenv run upgrade