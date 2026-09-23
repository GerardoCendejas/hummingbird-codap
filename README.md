# Hummingbird detective (CODAP plugin)

A step-by-step panel that runs inside CODAP. Each step is checked off
automatically when students do it (make a graph, drag the right columns,
turn on the trend line).

## Structure

```
index.html        -> redirects to en/
en/index.html     -> English page (one folder per language)
lang/en.js        -> all English text + CSV column names
assets/app.js     -> shared logic (same for every language)
assets/style.css  -> shared styles
```

## Add a language (e.g. Spanish)

1. Copy `lang/en.js` to `lang/es.js`, translate the text, set `code: "es"`,
   and set `attributes` to the column names used in the Spanish CSV.
2. Copy `en/index.html` to `es/index.html` and change two lines:
   `<html lang="es">` and `<script src="../lang/es.js">`.
3. Each language gets its own URL: `.../es/`, `.../zh/`.

## Test without CODAP

- `.../en/?preview`: click through every step to check text and layout.
- `.../en/?debug` (inside CODAP): shows what the panel detects.
