# instaling-bot
Bot dla automatycznego rozwiązywania słówek na instaling.pl

Przetestowany na Node 15.10.0

# Instalacja
1. Pobierz i zainstaluj Node.js (15+) https://nodejs.org/en/
2. Sklonuj repozytorium:
```
git clone https://github.com/PanSzelescik/instaling-bot.git
```
3. Wpisz komendę:
```
npm install
```
4. W pliku `config/Config.json` w polu `login` wpisz swój login lub e-mail, a w polu `password` swoje hasło
5. Aby uruchomić wpisz:
```
npm run start
```

# Sposób działania
- Logowanie za pomocą danych w `config/Config.json` (`login`, `password`)
- Uruchomienie nauki słówek
- Udzielanie odpowiedzi na podane słówka
  - Domyślnie odpowiedź jest udzielana dla wszystkich słówek, możesz to zmienić ustalając `chance` w `config/Config.json` (`1` - `100%`, `0.85` - `85%`...)
  - Słówko musi być dostępne w `config/SavedWords.json`
  - Jeśli nie jest dostępne zostanie zapisane prawidłowe tłumaczenie, w celu udzielania poprawnych odpowiedzi później
- Gdy nauka słówek się zakończy __nie zamykaj okna przeglądarki!__ Przeglądarka zamknie się sama i zapisze poznane słówka
