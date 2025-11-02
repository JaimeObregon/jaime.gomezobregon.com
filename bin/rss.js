import fs from 'fs'
import path from 'path'
import { escape } from '../httpdocs/modules/strings.js'

/**
 * Formatea una fecha ISO 8601 a RFC 822 para RSS
 */
function formatRfc822(dateString) {
  return new Date(dateString).toUTCString().replace('GMT', '+0000')
}

/**
 * Procesa el HTML para el feed RSS:
 * - Convierte URLs relativas a absolutas
 * - Elimina tags no permitidos (style, script, iframe, embed, object)
 */
function processHtmlForRss(html, baseUrl, postId) {
  const postBaseUrl = `${baseUrl}/posts/${postId}/`

  // Eliminar tags no permitidos (con cierre y self-closing)
  html = html.replace(/<style\b[^>]*>.*?<\/style>/gis, '')
  html = html.replace(/<script\b[^>]*>.*?<\/script>/gis, '')
  html = html.replace(/<iframe\b[^>]*(?:\/>|>.*?<\/iframe>)/gis, '')
  html = html.replace(/<embed\b[^>]*(?:\/>|>.*?<\/embed>)/gis, '')
  html = html.replace(/<object\b[^>]*>.*?<\/object>/gis, '')

  // Convertir URLs relativas a absolutas en src y href
  html = html.replace(/(src|href)=["']([^"']+)["']/gi, (match, attr, url) => {
    // Si ya es una URL absoluta, no hacer nada
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('//') ||
      url.startsWith('mailto:') ||
      url.startsWith('#')
    ) {
      return match
    }
    // Si es una URL relativa, convertirla a absoluta
    const absoluteUrl = url.startsWith('/')
      ? `${baseUrl}${url}`
      : `${postBaseUrl}${url}`
    return `${attr}="${absoluteUrl}"`
  })

  return html
}

;(async () => {
  // Leer index.json
  const feedJson = JSON.parse(fs.readFileSync('./httpdocs/index.json', 'utf8'))

  // Filtrar solo posts con fecha de publicación válida y no programados
  const now = new Date()
  const posts = feedJson.items
    .filter((item) => {
      if (!item.date_published) return false
      const pubDate = new Date(item.date_published)
      return pubDate <= now
    })
    .sort((a, b) => {
      // Ordenar por fecha descendente (más recientes primero)
      return (
        new Date(b.date_published).getTime() -
        new Date(a.date_published).getTime()
      )
    })
    .slice(0, 15) // Tomar los últimos 15

  // Leer contenido HTML de cada post
  const items = []
  for (const post of posts) {
    const htmlPath = path.join('./httpdocs/posts', post.id, 'index.html')

    if (!fs.existsSync(htmlPath)) {
      console.warn(`Warning: ${htmlPath} not found, skipping`)
      continue
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8')

    // Extraer el contenido del body/article
    let content = htmlContent.trim()

    // Quitar el h1 si está al inicio
    content = content.replace(/^<h1>.*?<\/h1>\s*/i, '')

    items.push({
      ...post,
      htmlContent: content,
    })
  }

  // Generar RSS XML
  const baseUrl = feedJson.home_page_url

  const rssItems = items
    .map((item) => {
      const pubDate = formatRfc822(item.date_published)
      const url = item.url || `${baseUrl}/${item.id}`
      const guid = url

      // Procesar el HTML: convertir URLs y eliminar tags no permitidos
      const processedHtml = processHtmlForRss(
        item.htmlContent,
        baseUrl,
        item.id,
      )

      return `
        <item>
          <title>${escape(item.title)}</title>
          <link>${escape(url)}</link>
          <guid isPermaLink="true">${escape(guid)}</guid>
          <pubDate>${pubDate}</pubDate>
          <description>${escape(item.content_text || '')}</description>
          <content:encoded><![CDATA[${processedHtml}]]></content:encoded>
        </item>
      `
    })
    .join('\n')

  const feedUrl = `${baseUrl}/rss.xml`

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escape(feedJson.title)}</title>
        <link>${escape(baseUrl)}</link>
        <description>${escape(feedJson.description)}</description>
        <language>${escape(feedJson.language)}</language>
        <lastBuildDate>${formatRfc822(new Date().toISOString())}</lastBuildDate>
        <pubDate>${formatRfc822(new Date().toISOString())}</pubDate>
        <atom:link href="${escape(feedUrl)}" rel="self" type="application/rss+xml" />
        ${rssItems}
      </channel>
    </rss>`

  // Asegurar que el directorio build existe
  if (!fs.existsSync('./build')) {
    fs.mkdirSync('./build', { recursive: true })
  }

  // Escribir RSS
  fs.writeFileSync('./build/rss.xml', rssXml, 'utf8')
  console.log(`RSS feed generated: ${items.length} items`)
})()
