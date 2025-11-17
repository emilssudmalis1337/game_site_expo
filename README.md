![Screenshot_20251117_194114_host exp exponent](https://github.com/user-attachments/assets/ef42ed00-933b-4076-8fdc-0b6dd596a51e)Komandas dalībnieki: Sudmalis, Berbeņovs

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

![Screenshot_20251117_194114_host exp exponent](https://github.com/user-attachments/assets/2f908d86-b17e-4524-ae30-7a8844fe37c3)  
Jauna lietotāja reģistrēšanās skats.  

![Screenshot_20251117_194052_host exp exponent](https://github.com/user-attachments/assets/1fef83b4-26e3-4e0a-a6f6-005a048be621)  
Homepage skats.  

![Screenshot_20251117_194104_host exp exponent](https://github.com/user-attachments/assets/6c51ead7-36af-4d54-89dc-698501434fe0)  
Jaunas spēles pievienošanas skats.  

Izmantoto bibliotēku saraksts:

Lai izmantotu šo programmu, nepieciešams ielādēt bibliotēkas un rīkus:  
Django REST framework;  
CORS headers.

Arhitektūras diagramma un apraksts:
<img width="675" height="343" alt="image" src="https://github.com/user-attachments/assets/0002f44d-38a4-4610-ab53-8576f592a589" />  

Šajā diagrammā attēloti galvenie sistēmas moduļi, kas izpilda atbilstošās prasības. Kopumā sistēmā ir 8 šādi moduļi, kas katrs atbild par savu funkcionalitāti, piemēram, modulis P1.1 "Lietotāja konta reģistrācija" atbild par jauna lietotāja reģistrāciju un pievienošanu datu bāzes Users tabulai, bet modulis P2.3 "Spēles dzēšana" atbild par jau eksistējošas spēles izdzēšanu no datu bāzes.

Idejas nākotnes uzlabojumiem:

Ļaut lietotājiem veikt arī spēļu filtrēšanu un kārtošanu;
Izmantot reālus datus - piemēram, no Steam.
