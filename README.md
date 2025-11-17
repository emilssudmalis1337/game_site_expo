Komandas dalībnieki: Sudmalis, Berbeņovs

Projekta nosaukums: Videospēļu mobilā lietotne "GameSite"

Lietotnes apraksts: GameSite ir mobilā lietotne, kas ļauj lietotājiem:

Apskatīt videospēļu katalogu ar detalizētu informāciju;
Meklēt spēles
Pārvaldīt spēļu saturu (izstrādātājiem un administratoriem).

Instalēšanas instrukcijas:

Lejupielādēt projektu kā ZIP failu no GitHub;
Atzipot mapi lietotājam ērtā lokācijā;
Pārbaudīt, vai ir instalētas visas nepieciešamās programmas: python, git, uv, kā arī Django, Node.js, npm un Expo Go uz mobilā tālruņa.
Ja tās nav instalētas, nepieciešams tās uzinstalēt, aplūkojot attiecīgo dokumentāciju.
Atvērt cmd;
Izmantojot python venv moduli, izveidot jaunu virtuālo vidi: python -m venv <virtuālās_vides_lokācija>
Palaist komandu cd <virtuālās_vides_lokācija>\Scripts\Activate
Palaist komandu cd <atzipotās_mapes_lokācija>\game_site-main\game_site_django
Palaist komandu python manage.py makemigrations
Palaist komandu python manage.py migrate
Palaist komandu python manage.py runserver 0.0.0.0:8000
Lai palaistu Expo aplikāciju, ir nepieciešams, ka telefons un dators ir uz viena un tā paša tīkla. Manā gadījumā, izmantoju USB tethering opciju no telefona.
Izmantojot cmd un komand ipconfig, nepieciešams uzzināt savu IP adresi, kas ir jāieraksta Expo failos. Ir jāatrod visas instances, kur parādās 192.168.42.41:8000 un jāaizvieto ar savu IP adresi:8000.

Ekrānšāviņi un īss apraksts:



Galvenais "GameSite" skats ar meklēšanas un filtrēšanas iespējām. image Jaunas spēles pievienošanas skats. image Izdzēstas spēles skats. image Pieslēgšanās kontam skats. image Jauna lietotāja reģistrācijas skats.

Izmantoto bibliotēku saraksts:

Projektā nav izmantotas trešo pušu bibliotēkas, taču ir izmantoti vairāki Django moduļi, piemēram, django.contrib.admin, django.urls, django.http u.c. Izmantoti arī standarta moduļi, kā datetime, uuid un os. Priekš grafiskā interfeisa, izmantots Bootstrap, kas ielādēts caur CDN.

Arhitektūras diagramma un apraksts:
image Šajā diagrammā attēloti galvenie sistēmas moduļi, kas izpilda atbilstošās prasības. Kopumā sistēmā ir 9 šādi moduļi, kas katrs atbild par savu funkcionalitāti, piemēram, modulis P1.1 "Lietotāja konta reģistrācija" atbild par jauna lietotāja reģistrāciju un pievienošanu datu bāzes Users tabulai, bet modulis P2.3 "Spēles dzēšana" atbild par jau eksistējošas spēles izdzēšanu no datu bāzes.

Idejas nākotnes uzlabojumiem:

Spēļu salīdzināšana - ļaut veikt vairāku spēļu salīdzināšanu side-by-side,
Diagrammu pievienošana - dažādus spēļu datus parādīt diagrammu veidā,
Izmantot reālus datus - izmantojot Steam vai kādu citu API iegūt reālus spēļu datus.
