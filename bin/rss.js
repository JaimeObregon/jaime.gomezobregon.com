import fs from 'fs'
import path from 'path'
import { escape } from '../httpdocs/modules/strings.js'

/**
 * Formatea una fecha ISO 8601 a RFC 822 para RSS
 */
function formatRfc822(dateString) {
  return new Date(dateString).toUTCString().replace('GMT', '+0000')
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

      return `
        <item>
          <title>${escape(item.title)}</title>
          <link>${escape(url)}</link>
          <guid isPermaLink="true">${escape(guid)}</guid>
          <pubDate>${pubDate}</pubDate>
          <description>${escape(item.content_text || '')}</description>
          <content:encoded><![CDATA[${item.htmlContent}]]></content:encoded>
        </item>
      `
    })
    .join('\n')

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>${escape(feedJson.title)}</title>
        <link>${escape(baseUrl)}</link>
        <description>${escape(feedJson.description)}</description>
        <language>${escape(feedJson.language)}</language>
        <lastBuildDate>${formatRfc822(new Date().toISOString())}</lastBuildDate>
        <pubDate>${formatRfc822(new Date().toISOString())}</pubDate>
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
