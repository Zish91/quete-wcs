# Backup VM 306 | GLPI (Debian 13) | Veeam Agent for Linux

> **Date** : 16/06/2026
> **VM** : 306 `PG-04096-X00004` | Debian 13 | kernel `6.12.90+deb13.1-amd64` | IP `172.16.6.34/28` (VLAN13)
> **Serveur Veeam** : VM 310 `PG-00256-X00022` | `172.16.6.14`
> **Repository** : VM 311 `PG-00256-X00023` | `172.16.6.15` | `E:\Backups`
> **Build VAL** : `13.0.2.2`

---

## 1. Préparation de la VM 306

Vérifs préalables depuis la VM 310 en SSH vers `172.16.6.34` :

```bash
ssh root@172.16.6.34
df -h                      # 11 GB libres sur /dev/sda1
uname -r                   # 6.12.90+deb13.1-amd64
systemctl status mariadb   # active (running) | version 11.8.6
lsblk                      # une seule partition data (sda1 = /) → justifie "Entire computer"
```

---

## 2. Installation Veeam Agent for Linux (VAL) 13.0.2.2

### Étape 1 | Ajout du repo Veeam

Téléchargement du paquet `veeam-release-deb_13.0.2_amd64.deb` (7 KB) depuis la page officielle :
https://www.veeam.com/products/free/linux-download.html → Debian/Ubuntu | version 13 | x64

Transfert sur la VM 306 via SCP depuis la VM 310 (PowerShell) :

```powershell
scp $env:USERPROFILE\Downloads\veeam-release-deb_13.0.2_amd64.deb root@172.16.6.34:/root/
```

![Transfert SCP du paquet Veeam vers VM 306](./screenshots/envoiedupaquetveeamsur306.png)

Installation du paquet release + rafraîchissement du cache apt :

```bash
sudo dpkg -i veeam-release-deb_13.0.2_amd64.deb
sudo apt update
```

Ce paquet ne contient pas l'agent. Il ajoute uniquement :
- Le repo apt Veeam dans `/etc/apt/sources.list.d/veeam.list`
- La clé GPG Veeam pour la vérification des paquets

Vérification :

```bash
apt update | grep -i veeam
# Hit: https://repository.veeam.com/backup/linux/agent-13/dpkg/debian/public stable InRelease
```

### Étape 2 | Installation de l'agent + module noyau

```bash
sudo apt install blksnap veeam
```

Une seule commande | apt tire toutes les dépendances automatiquement (dkms, gcc, make, linux-headers, veeam-libs). DKMS compile les modules `veeamblksnap.ko` et `bdevfilter.ko` pour le kernel actif.

![Installation de l'agent Veeam et compilation DKMS](./screenshots/installationdelagentsur306.png)

### Étape 3 | Vérification post-install

```bash
systemctl status veeamservice   # active (running)
veeamconfig --version           # 13.0.2.2
```

### Étape 4 | Initial Setup Wizard

```bash
sudo veeam
```

| Étape | Action |
|---|---|
| Step 1 | Accept License Agreements | coché les 2 EULA (Veeam + 3rd party) |
| Step 2 | Recovery ISO | skippé (`Tab` → `Next`) | pas critique sur VM Proxmox |
| Step 3 | License | Free Edition | `Finish` sans renseigner de licence |

![Veeam Agent for Linux | TUI prête après l'initial setup](./screenshots/agentlinuxvm306.png)

---

## 3. Compte MariaDB dédié backup

Création d'un user MariaDB avec le strict minimum (privilège `RELOAD` uniquement) pour que Veeam puisse exécuter `FLUSH TABLES WITH READ LOCK` avant chaque snapshot :

```sql
mysql -u root -p

CREATE USER 'veeam-backup'@'localhost' IDENTIFIED BY 'Azerty1*';
GRANT RELOAD ON *.* TO 'veeam-backup'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

| Commande | Rôle |
|---|---|
| `CREATE USER` | Crée le compte avec mot de passe |
| `GRANT RELOAD ON *.*` | Autorise uniquement le `FLUSH TABLES` (pas de lecture/écriture de données) |
| `@'localhost'` | Connexion locale uniquement (principe de moindre privilège) |
| `FLUSH PRIVILEGES` | Applique immédiatement les changements |

![Création du user MariaDB dédié backup](./screenshots/ajoutuserveeamGLPI.png)

---

## 4. Création du job sur Veeam B&R (VM 310)

Chemin : `Home` → `Backup Job` → `Linux computer` → wizard

| Étape wizard | Choix |
|---|---|
| Job Mode | Server | **Managed by backup server** |
| Name | `AgentGLPI` | description `VM306-172.16.6.34` |
| Computers | `172.16.6.34` | creds SSH `root` |
| Backup Mode | **Entire computer** (une seule partition, 2.3 GB utilisés sur 14 GB) |
| Storage | VM 311 repo `E:\Backups` | rétention **7 jours** |
| Guest Processing | **Application-aware processing** activé |
| Guest Processing → MySQL | Creds MariaDB `veeam-backup` / `Azerty1*` |
| Schedule | Daily **03:00** everyday (décalé 1h après le job VM 308 à 02:00) |
| Retry | 3 tentatives | 10 min entre chaque |

### Application-Aware Processing

Veeam détecte MariaDB et gère automatiquement la cohérence de la base de données :

1. Avant le snapshot → `FLUSH TABLES WITH READ LOCK` (freeze MariaDB)
2. Snapshot du disque via module `blksnap`
3. Après le snapshot → `UNLOCK TABLES` (reprise MariaDB)

Résultat : backup **application-consistent** (pas juste crash-consistent).

Option choisie : **Require successful processing** → si le freeze MariaDB échoue, le backup est annulé (pas de backup corrompu silencieux).

![Application-aware processing activé](./screenshots/prefreezeMariaDB.png)

### Summary du job

![Summary du job AgentGLPI](./screenshots/summaryveeamGLPI.png)

---

## 5. Vérification

### Premier backup (lancé manuellement)

| Métrique | Valeur |
|---|---|
| Status | **Success** |
| Durée | 3 min 26 sec |
| Données lues | 5.7 GB |
| Données transférées | 1.7 GB (ratio compression **3.4×**) |
| Bottleneck | Réseau |
| Erreurs / Warnings | 0 / 0 |

![Premier backup GLPI | Success](./screenshots/glpiFirstJOBOK.png)

### Vérification côté repository (VM 311)

Fichier `.vbk` (full backup) présent dans `E:\Backups\AgentGLPI\` sur la VM 311.

![Dossier AgentGLPI sur le repository VM 311](./screenshots/vm311GLPIOK.png)

### Backups suivants

Les prochains backups seront **incrémentiels** (fichiers `.vib`) : uniquement les blocs modifiés depuis le dernier backup. Rétention de 7 jours avec merge automatique (Forever Forward Incremental).

---

## Docs de référence

| Sujet | Lien |
|---|---|
| Installation VAL v13 | https://helpcenter.veeam.com/docs/agentforlinux/userguide/installation_val.html?ver=13 |
| Initial Setup | https://helpcenter.veeam.com/docs/agentforlinux/userguide/val_first_steps.html?ver=13 |
| Recovery ISO (skippé) | https://helpcenter.veeam.com/docs/agentforlinux/userguide/val_first_steps_iso.html?ver=13 |
| MySQL Processing | https://helpcenter.veeam.com/docs/agentforlinux/userguide/backup_job_mysql.html?ver=13 |
