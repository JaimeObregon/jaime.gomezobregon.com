import '../components/initial.js'
import { slugize } from './strings.js'

const blog = {
  /**
   * Formatea una fecha en castellano
   */
  formatDate: (date) =>
    new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),

  /**
   * Determina si una URL está o no está en el _feed_
   */
  isItem: (url) => {
    const { pathname } = new URL(url)
    const slug = pathname.replace(/^\//, '')
    const item = blog.feed.items.find((i) => i.id === slug)
    return Boolean(item)
  },

  /**
   * Intercepta los clics en los enlaces internos para despacharlos dinámicamente
   */
  clickHandler: function (event) {
    const a = event.target.closest('a')
    if (!a) {
      return
    }

    // No queremos interferir con CTRL+clic ni con el clic con el botón central,
    // para que el usuario pueda seguir abriendo los enlaces en nuevas pestañas
    const leftButtonClick = !event.button && !event.ctrlKey && !event.metaKey

    // Tampoco queremos interferir con los enlaces externos
    const isExternalLink = new URL(a.href).origin !== document.location.origin

    if (!leftButtonClick || isExternalLink) {
      return
    }

    if (this.isItem(a.href)) {
      this.dispatch(a.href)
      history.pushState(null, '', a.href)
      event.preventDefault()
    }
  },

  /**
   * Manejador del evento disparado al avanzar o retroceder por el historial del navegador
   */
  popstateHandler: function (event) {
    blog.dispatch(document.URL)
  },

  /**
   * Al redimensionar la ventana…
   */
  resizeHandler: () => {
    blog.resizeVideos()
  },

  /**
   * Fuerza que los vídeos de YouTube se vean a ancho completo y en proporción 16:9
   */
  resizeVideos: () => {
    const ratio = 16 / 9

    const videos = blog.article.querySelectorAll(
      'figure iframe[src*="youtube-nocookie.com"]',
    )

    videos.forEach((iframe) => {
      if (iframe instanceof HTMLElement) {
        iframe.style.width = '100%'
        iframe.style.height = `${iframe.offsetWidth / ratio}px`
      }
    })
  },

  /**
   * Carga los tuits que pudiera haber incrustados en un artículo
   */
  renderTweets: async (selector, options) => {
    const tweets = blog.article.querySelectorAll(selector)
    if (!tweets.length) {
      return
    }

    // Cargamos la librería de Twitter solo si no lo ha sido previamente
    // y la entrada contiene tuits
    if (!window.hasOwnProperty('twttr')) {
      // @ts-ignore
      await import('https://platform.twitter.com/widgets.js')
    }

    tweets.forEach((tweet) => {
      tweet.innerHTML = ''
      tweet.classList.add('rendered')
      // @ts-ignore
      twttr.widgets.createTweet(tweet.dataset.id, tweet, options)
    })
  },

  /**
   * Presenta las notas al pie, como las que hay en `/la-donacion`
   */
  renderFootnotes: async (notesSelector, callsSelector) => {
    const notes = blog.article.querySelectorAll(notesSelector)
    const calls = blog.article.querySelectorAll(callsSelector)

    if (!calls.length) {
      return
    }

    calls.forEach((call, i) => {
      const href = call.getAttribute('href')
      const index = [...notes].findIndex((note) => `#${note.id}` === href)

      if (index < 0) {
        throw new Error(`Nota al pie desconocida: ${href}`)
      }

      const number = index + 1
      const id = `nota-${i + 1}`

      const path = document.location.pathname

      call.outerHTML = `<a class="note" href="${path}${href}" id="${id}"><sup>${number}</sup></a>`
      notes[index].querySelector('p:last-of-type').innerHTML +=
        `<a class="ref" href="${path}#${id}">↩︎</a>`
    })
  },

  /**
   * La raya (_emdash_, —) es un signo distinto del guion (_hyphen_, -) y el
   * signo de restar (_endash, –). La raya se utiliza, entre otras cosas, para
   * hacer incisos. Estos incisos están enmarcados entre dos rayas, que deben
   * permanecer pegadas al caracter al que siguen o anteceden.
   *
   * Para evitar que en una línea queden rayas huérfanas separadas del inciso
   * utilizamos aquí el caracter Unicode `WORD JOINER` (U+2060)
   *
   * Véase https://www.fundeu.es/escribireninternet/la-raya-tambien-exist
   * Véase https://www.fundeu.es/recomendacion/guion-claves-para-usar-este-signo-1250/
   * Véase https://practicaltypography.com/hyphens-and-dashes.html
   * Véase https://www.fileformat.info/info/unicode/char/2060/index.htm
   */
  renderDashes: (selector) => {
    const element = document.querySelector(selector)
    element.innerHTML = element.innerHTML
      .replace(/(\s)—([^\s])/g, '$1—\u2060$2')
      .replace(/([^\s])—(\s)/g, '$1\u2060—$2')
  },

  renderInitials: async (selector) => {
    const paragraph = document.querySelector(selector)
    if (!paragraph) {
      return
    }

    const initial = paragraph.innerText.substring(0, 1)
    if (!initial.match(/[A-Z]/)) {
      return
    }

    const path = `/initials/${initial.toLowerCase()}.svg`

    const url = new URL(path, window.location.origin)
    const response = await fetch(url)
    const text = await response.text()

    paragraph.innerHTML = `
      <div class="initial">${text}</div>
      ${paragraph.innerHTML.replace(/^\s*(\w)/, '<span class="hidden">$1</span>')}
    `
  },

  /**
   *
   */
  renderHeadings: () => {
    const headings = document.querySelector('article')?.querySelectorAll('h2')
    if (!headings) {
      return
    }

    headings.forEach((heading) => {
      const id = slugize(heading.innerText)

      const url = new URL(document.URL)
      url.hash = id

      const href = url.toString()

      heading.setAttribute('id', id)
      heading.innerHTML = `<a href="${href}">${heading.innerHTML}</a>`
    })
  },

  /**
   *
   */
  renderHome: () => {
    const posts = blog.feed.items.filter((item) => item.date_published)

    const featured = posts
      .filter((item) => item.tags.includes('Destacado'))
      .filter((item) => new Date(item.date_published) < new Date())
      .map(
        (item) => `
                <li>
                    <a href="/${item.id}" hreflang="${item.language}">
                        <time datetime="${item.date_published}">
                            ${blog.formatDate(item.date_published)}
                        </time>
                        <cite>${item.title}</cite>
                        <p>${item.content_text}</p>
                    </a>
                </li>`,
      )

    const other = posts
      .filter((item) => !item.tags.includes('Destacado'))
      .filter((item) => new Date(item.date_published) < new Date())
      .map(
        (item) => `
                <li>
                    <a href="/${item.id}" hreflang="${item.language}">
                        <time datetime="${item.date_published}">
                            ${blog.formatDate(item.date_published)}
                        </time>
                        <cite>${item.title}</cite>
                    </a>
                </li>`,
      )

    blog.nav.innerHTML = `
            <ol class="featured">${featured.join('')}</ol>
            <hr />
            <ol>${other.join('')}</ol>
        `
  },

  updateDocumentMetadata: (metadata) => {
    const { title, description, url } = metadata

    document.title = title

    document
      .querySelector('meta[name=description]')
      ?.setAttribute('content', description)

    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description)

    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title)

    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', url)
  },

  /**
   * Carga y muestra la página de error
   */
  showError: async () => {
    const response = await fetch('/404.html')
    const text = await response.text()

    const parser = new DOMParser()
    const parsed = parser.parseFromString(text, 'text/html')

    document.head.innerHTML = parsed.head.innerHTML
    document.body.innerHTML = parsed.body.innerHTML
  },

  /**
   * Muestra la portada
   */
  showHome: function () {
    window.scrollTo(0, 0)
    document.body.classList.remove('article')

    this.updateDocumentMetadata({
      description: this.feed.description,
      url: this.feed.home_page_url,
      title: this.feed.title,
    })

    blog.nav?.parentNode.classList.remove('hidden')
  },

  /**
   * Enruta una petición.
   */
  dispatch: async function (url) {
    const { pathname } = new URL(url)

    if (pathname === '/') {
      this.showHome()
      return
    }

    const slug = pathname.replace(/^\/|\/$/g, '')
    const item = blog.feed.items.find((i) => i.id === slug)

    await this.load(item)
  },

  /**
   * Inicializa la lógica del blog
   */
  init: async function (options = {}) {
    this.nav = document.querySelector(options.nav)
    this.close = document.querySelector(options.close)
    this.article = document.querySelector(options.article)

    this.github = options.github

    const response = await fetch(options.feed)
    this.feed = await response.json()

    blog.dispatch(document.URL)

    // Queremos transiciones suaves al cargar un artículo,
    // pero no cuando se accede directamente a uno por su URL
    setTimeout(() => document.body.classList.add('transition'), 500)

    blog.renderHome()

    blog.renderDashes('div > header')

    blog.renderInitials('header > section > p:first-of-type')

    window.addEventListener('popstate', blog.popstateHandler.bind(this))
    window.addEventListener('resize', blog.resizeHandler.bind(this))
    document.addEventListener('click', blog.clickHandler.bind(this))

    this.close.addEventListener('click', function () {
      history.pushState(null, '', '/')
      blog.showHome()
    })

    document
      .querySelector('header')
      ?.addEventListener('transitionend', (event) => {
        if (
          event.target instanceof Element &&
          event.target.tagName === 'HEADER' &&
          event.propertyName === 'margin-left'
        ) {
          const element = document.body.classList.contains('article')
            ? this.nav
            : this.article

          element.parentNode.classList.add('hidden')
        }
      })
  },

  /**
   * Carga un artículo y lo presenta al usuario para su lectura
   */
  load: async function (item) {
    if (!item) {
      this.showError()
      return
    }

    const type = item.date_published ? 'post' : 'page'
    const folder = type === 'post' ? 'posts' : 'pages'

    const response = await fetch(`/${folder}/${item.id}/index.html`)

    if (!response.ok) {
      this.showError()
      return
    }

    const base = document.querySelector('head base')
    base?.setAttribute('href', `/${folder}/${item.id}/`)

    this.updateDocumentMetadata({
      description: item.content_text,
      title: item.title,
      url: item.url,
    })

    document.body.classList.add('article')

    blog.article.innerHTML = await response.text()
    blog.article.setAttribute('lang', item.language)
    blog.article.parentNode.classList.remove('hidden')

    if (type === 'post') {
      const h1 = this.article.querySelector('h1').innerHTML
      const date = this.formatDate(item.date_published)
      const header = document.createElement('header')

      const url = `${blog.github.url}/commits/${blog.github.branch}/httpdocs/posts/${item.id}/index.html`

      header.innerHTML = `
                <a href="/">Jaime Gómez-Obregón</a>
                <h1>${h1}</h1>
                <time datetime="${item.date_published}">
                    ${date}
                </time>
            `

      this.article.querySelector('h1').replaceWith(header)
    }

    this.resizeVideos()

    this.renderHeadings()

    this.renderDashes('main > article')

    this.renderTweets('blockquote.tweet[data-id]', {
      align: 'center',
      lang: 'es',
    })

    this.renderFootnotes('ol#notes li', 'a.note')

    this.renderInitials('main > article header > p:first-of-type')

    if (location.hash) {
      const id = location.hash.replace(/^#/, '')
      const fragment = document.getElementById(id)
      fragment?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  },
}

export { blog }
