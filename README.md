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
  - Domyślnie odpowiedź jest udzielana dla wszystkich słówek, możesz to zmienić ustalając `valid_chance` w `config/Config.json` (`1` - `100%`, `0.85` - `85%`...)
  - Słówko musi być dostępne w `config/SavedWords.json`
  - Jeśli nie jest dostępne zostanie zapisane prawidłowe tłumaczenie, w celu udzielania poprawnych odpowiedzi później
- Gdy nauka słówek się zakończy __nie zamykaj okna przeglądarki!__ Przeglądarka zamknie się sama i zapisze poznane słówka

# Objaśnienie configu
- `login` - login
- `password` - hasło
- `sites` - używane strony
  - `login` - strona na której bot ma się zalogować
- `delays` - czas oczekiwania w milisekundach na podane czynności (1 s = 1000 ms), bot losuje czas oczekiwania między min a max
  - `click_min` - minimalny czas oczekiwania po kliknięciu w przycisk
  - `click_max` - maksymalny czas oczekiwania po kliknięciu w przycisk
  - `type_min` - minimalny czas wpisywania tekstu w pole tekstowe
  - `type_max` - maksymalny czas wpisywania tekstu w pole tekstowe
  - `selector` - czas oczekiwania na dowolny element na stronie, aby móc go np. przeczytać (jeśli masz naprawdę powolny internet to możesz spróbować zwiększyć tę wartość)
  - `wait_min` - minimalny czas oczekiwania po kliknięciu w przycisk gdy nie zmienia się adres strony, ale zmienia się jej zawartość
  - `wait_max` - maksymalny czas oczekiwania po kliknięciu w przycisk gdy nie zmienia się adres strony, ale zmienia się jej zawartość
  - `check_min` - minimalny czas oczekiwania na sprawdzenie poprawności wpisanego słówka
  - `check_max` - maksymalny czas oczekiwania na sprawdzenie poprawności wpisanego słówka
  - `next_word_min` - minimalny czas oczekiwania między słówkami
  - `next_word_max` - maksymalny czas oczekiwania między słówkami
- `valid_chance` - jaka część udzielonych odpowiedzi ma być prawidłowa (`1` - `100%`, `0.85` - `85%`...)
- `show_browser` - umożliwia widzenie przeglądarki na żywo, bądź jej ukrycie, przydatne jeśli bot jest uruchamiany na Linuxie gdzie nie mamy GUI (wtedy należy wpisać `false`, gdyż bot nie wystartuje)
- `open_devtools` - pozwala na otwarcie narzędzi deweloperskich razem ze startem bota (uwaga! `show_browser` jest wtedy traktowany jako `true`)
- `mute_audio` - pozwala na wyciszenie dźwięku z przeglądarki
