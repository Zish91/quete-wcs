**1. Ajout du PV et doublement du VG**

![VG étendu à 78,30G avec 2 PV](lvmdoublesize.png)

**2. Création du snapshot du LV home**

![Snapshot welcometomaiami créé](lvmsnapshot.png)

**3. Montage du snapshot sur /home-snap**

![Snapshot monté sur /home-snap](mountsnap.png)

**4. Contenu identique entre /home et /home-snap**

![ls -l /home et /home-snap identiques](copysnapconstat.png)

**5. Démontage de /home-snap**

![/home-snap n'apparaît plus dans les mountpoints](umountsnap.png)

**6. Destruction du snapshot**

![welcometomaiami supprimé, LV home intact](removesnap.png)
