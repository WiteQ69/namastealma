# Namaste Alma — Chwila dla siebie

Lokalna aplikacja Next.js z App Routerem. Mobilna ścieżka obejmuje check-in, plan, animację oddechu, refleksję, afirmację, intencję, przestrzeń na dziś i wieczorne podsumowanie. Sklep pokazuje zapowiedź talii. Treści kart są przykładowe.

## Uruchomienie

Potrzebujesz Node.js 20.9 lub nowszego i menedżera pakietów npm.

```powershell
cd C:\Users\wikto\Desktop\namaste
npm ci
npm run dev
```

Otwórz http://localhost:3000. Bez konfiguracji Supabase aplikacja działa jako demo i zapisuje dane tylko w lokalnej pamięci tej przeglądarki. Do sprawdzenia wyglądu na telefonie uruchom `npm run dev -- --hostname 0.0.0.0` i otwórz adres IP komputera z telefonu w tej samej sieci. Instalację jako aplikacji webowej sprawdź pod docelowym adresem HTTPS.

## Podłączenie Supabase

1. Załóż projekt Supabase. W SQL Editor uruchom raz plik `supabase/001_ritual.sql`. Zawiera schemat, przykładowe talie i reguły RLS. Dziennik i losowania są przypisane do zalogowanej osoby.
2. Skopiuj `.env.example` do `.env.local`. Wstaw Project URL i publiczny klucz `sb_publishable_…` z sekcji Connect.
3. W ustawieniach Auth włącz logowanie e-mailem. W szablonie **Magic Link** użyj `{{ .Token }}`, by wysyłać kod jednorazowy, który użytkowniczka wpisuje w aplikacji. Dla testów z zewnętrznymi użytkowniczkami skonfiguruj własny SMTP.
4. Uruchom ponownie serwer. Zaloguj się na dwóch kontach i sprawdź, czy każde widzi wyłącznie swoje wpisy. Dane z trybu demo zostają w przeglądarce i nie migrują automatycznie.

Manifest i ikony umożliwiają dodanie aplikacji do ekranu początkowego po udostępnieniu pod HTTPS. W Safari użyj „Udostępnij”, następnie „Dodaj do ekranu początkowego” i „Otwórz jako aplikację internetową”.

W tej wersji sklep jest zapowiedzią. Abonament i płatności są osobnym etapem.
