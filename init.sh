#!/bin/bash
# Charger les variables d'environnement
export $(cat .env | xargs)

# Lancer docker-compose
docker-compose up --build