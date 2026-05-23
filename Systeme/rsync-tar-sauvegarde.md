# **Quête tar + sync :** 
---


## **I - Sauvegarder ses données avec tar :**         
---

### a) Télécharge le fichier suivant : Code source de tar (dernière version)    

### b) Décompresse l'archive chez toi :        

cd ~/Téléchargements    

```
tar -xzf tar-latest.tar.gz  
```
-x pour extriaire.   
-z pour décompresser via gzip.  
-f pour indiquer le fichier à traiter.  

### c) Ajoute la suggestion suivante en 3ème ligne du fichier TODO : *Make tar brew good coffee Suggested by YourName :

```
Possible de le faire simplement en graphique
```
### d) Créé une nouvelle archive nommée `tar-by-<YourName>.tar.bz2` :

```
tar -cjf tar-by-Zishan.tar.bz2 tar-1.35/
```
-c pour créer l'archive.    
-j compression bzip2.    
-f pour indiquer le fichier à traiter.    


---
---

## **II - Sauvegarder sur un serveur distant avec rsync :**   

### a) Client peut se connecter en ssh au serveur sans mot de passe :

```
ssh-keygen -t ed25519  
ssh-copy-id root@192.168.1.42  
```
On génère une paire de clés SSH avec ssh-keygen avec le type de chiffrement -t ed25519, on copie la clé publique sur le serveur distant pour avoir une connexion sans mot de passe.

### b) Installation de rsync sur les 2 sytèmes : 

```
sudo apt install rsync -y  
ssh user@IP "apt install rsync -y"  
```

### c) Création de dossier quelconques contenant des dossiers et fichiers : 

```
mkdir -p ~/sync-test/lelabdeminjha/bricetropvif
mkdir -p ~/sync-test/aymericdanscamille
mkdir -p ~/sync-test/jeremmytorsepoil
mkdir -p ~/sync-test/minjhamystere/anascriesurmarine
touch ~/sync-test/domvireanas.txt ~/sync-test/bricetrucdetruc.txt
touch ~/sync-test/saiarabe.txt ~/sync-test/gregproblemedepc.txt
```

### d) Rediriger sortie standard de la commande ls dans un fichier journal : 

```
ls -lR ~/sync-test/ >> ~/journal-rsync.txt
```
-l format liste longue.  
-R récursif (prends les sous dossiers).  
->> redirige et ajoute sans écraser.   

### e) SYnchroniser ce dossier avec un dossier distant sur le serveur ssh en journalisant : 

```
rsync -av ~/sync-test/ user@IP:/user/sync-test/ | tee -a ~/journal-rsync.txt
```
-a archive
-v verbose
-tee -a affiche et ajoute dans le journal simultanément

### f) SUr le serveur vérifier la copie du dossier et supprimer quelques fichiers :  

```
Utilisé la commande ssh user@IP
ls -lR /chemin/dudossier
rm /chemin/dudossier
exit
```
Pour relancer la synchronisation on utilisera la même commande qu'au point e).    
Pour ajouter des commentaires au fichier journal simplement `nano ~/chemindujournal.txt`  
Pour finir `cat ~/chemindujournal.txt`  


#  **!! DANKE SCHON !!**
