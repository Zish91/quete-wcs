## **Requêter DNS avec DIG:**

**- Les adresses IP version 4 du site web de la Wild Code School ! www.wildcodeschool.com :**

Avec `dig A www.wildcodeschool.com` >> 199.60.103.225 et 199.60.103.31.

---

**- Les adresses IP version 6 d'odyssey et en déduire l'hébergeur de ton fournisseur de quête préféré :**

Avec dig `AAAA odyssey.wildcodeschool.com` >> 2a00:1450:400c:c09::79 CNAME	ghs.googlehosted.com. > google.

---

**- (Bonus) Les noms des serveurs de noms faisant autorité sur le domaine wildcodeschool.com et le serveur primaire :**

Avec `dig NS wildcodeschool.com` >> kim.ns.cloudflare.com et cash.ns.cloudflare.com.

---

**- (Bonus) Refaire les requêtes précédentes en précisant l'utilisation du serveur récursif quad9 (9.9.9.9 ou 2620:fe::9) :**

Avec `dig A www.wildcodeschool.com @9.9.9.9` les mêmes résultats rien ne change hormis le TTL (varie selon l'état du cache de chaque serveur).

---





