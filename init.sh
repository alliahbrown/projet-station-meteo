#!/bin/bash
# Charger les variables d'environnement
export $(cat .env | xargs)

docker-compose up --build