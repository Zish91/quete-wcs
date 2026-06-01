```
::1 - - [30/May/2026:23:49:44 +0200] "GET /xavierdelapegrecorse HTTP/1.1" 404 432 "-" "curl/8.5.0"
::1 - - [01/Jun/2026:22:20:35 +0200] "GET /bricehortefeu HTTP/1.1" 404 432 "-" "curl/8.5.0"
::1 - - [01/Jun/2026:22:20:35 +0200] "GET /minjhaposeplusdequestionwtf HTTP/1.1" 404 432 "-" "curl/8.5.0"
::1 - - [01/Jun/2026:22:20:35 +0200] "GET /cedrickennydesouthparkpckilestinvincible HTTP/1.1" 404 432 "-" "curl/8.5.0"
::1 - - [01/Jun/2026:22:20:35 +0200] "GET /gregalccolique HTTP/1.1" 404 432 "-" "curl/8.5.0"

```


- Alors on voit l'addresse IP en l'occurence la loopback en IPV6, puis le timestampt de la requête avec le fuseau horaire (utc+2
- Puis le get pour récupérer une ressource et la version du protocole HTTP1.1. 
- 404 code erreur page non trouvée
- 432 la taille de la réponse en octets
- "curl/8.5.0" l'outil utilisé pour faire la requête.
