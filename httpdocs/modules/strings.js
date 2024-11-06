// Solo para que prettier formatee los _template literals_.
const html = String.raw
const css = String.raw

// Toma `Una cadena «como esta»` y devuelve `una-cadena-como-esta`.
// Véase https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
const slugize = (string) => {
  return string
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u{0100}-\u{FFFF}]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export { css, html, slugize }
