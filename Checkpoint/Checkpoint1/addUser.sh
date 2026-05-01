#!/bin/bash

if [[ $# -eq 0 ]]; then
echo "Il manque les noms d'utilisateurs en argument - Fin du script"
exit 1
fi

if id "$username"
then
echo "L'utilisateur $username existe déjàé"
else

useradd "$username"

if [[ $? -eq 0 ]]

then
echo "L'utilisateur $username à été créer"
else
echo "Erreur à la création de l'utilisateur $username"
fi
