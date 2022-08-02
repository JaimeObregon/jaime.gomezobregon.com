export const blog = {
    /**
     * Formatea las fechas
     */
    formatDate: (date) =>
        new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }),

    /**
     * Elemento del DOM en el que se mostrará el índice de artículos
     */
    nav: null,

    /**
     * Elemento donde se cargará el contenido del artículo a presentar
     */
    article: null,

    /**
     * Elemento con el control para volver al índice de artículos desde un artículo
     */
    close: null,

    /**
     * Valor original de `head > title`, para poder restaurarlo tras cambiarlo
     */
    title: null,

    /**
     * Valor original del atributo `content` de `<meta name="description">`,
     * para poder restaurarlo tras cambiarlo
     */
    description: null,

    /**
     * URL original, para ídem
     */
    url: null,

    // Devuelve `ruta` cuando se le pasa `https://jaime.gomezobregon.com/ruta/y/mas/cosas/opcionales`
    slug: (location) => new URL(location).pathname.split('/')[1],

    /**
     * Inicializa la lógica del blog
     */
    init: async function (options = {}) {
        const {
            nav = 'nav',
            close = 'button',
            article = 'article',
            feed = '/index.json',
        } = options

        this.nav = document.querySelector(nav)
        this.close = document.querySelector(close)
        this.article = document.querySelector(article)

        const response = await fetch(feed)
        const json = await response.json()
        this.items = json.items

        this.title = document.title
        this.url = document
            .querySelector('meta[property="og:url"]')
            .getAttribute('content')
        this.description = document
            .querySelector('meta[name=description]')
            .getAttribute('content')

        const slug = this.slug(document.location)
        slug && blog.load(slug) && this.nav.parentNode.classList.add('hidden')

        // Queremos transiciones suaves al cargar un artículo,
        // pero no cuando se accede directamente a uno por su URL
        setTimeout(() => document.body.classList.add('transition'), 500)

        const posts = this.items.filter((item) => item.date_published)

        const featured = posts
            .filter((item) => item.tags.includes('Destacado'))
            .filter((item) => new Date(item.date_published) < new Date())
            .map(
                (item, order) => `
                <li style="--delay: ${order + 1}">
                    <a href="/${item.id}" hreflang="${item.language}">
                        <time datetime="${item.date_published}">
                            ${blog.formatDate(item.date_published)}
                        </time>
                        <cite>${item.title}</cite>
                        <p>${item.content_text}</p>
                    </a>
                </li>`
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
                </li>`
            )

        this.nav.innerHTML = `
            <ol class="featured">${featured.join('')}</ol>
            <hr />
            <ol>${other.join('')}</ol>
        `

        document.addEventListener('click', (event) => {
            const a = event.target.closest('a')
            if (!a) {
                return
            }

            // No queremos interferir con CTRL+clic ni con el clic con el botón central,
            // para que el usuario pueda seguir abriendo los enlaces en nuevas pestañas
            const leftButtonClick =
                !event.button && !event.ctrlKey && !event.metaKey

            // Tampoco queremos interferir con los enlaces externos
            const isExternalLink =
                new URL(a.href).origin !== document.location.origin

            if (!leftButtonClick || isExternalLink) {
                return
            }

            event.preventDefault()
            const slug = this.slug(a.href)

            history.pushState(null, '', `/${slug}`)
            this.load(slug)
        })

        this.close.addEventListener('click', (event) => {
            history.pushState(null, '', '/')
            this.menu()
        })

        window.addEventListener('popstate', (event) => {
            if (document.location.hash) {
                return
            }

            // En iOS y Safari hay dos formas de navegar por el historial: pulsando los botones del
            // navegador o haciendo un gesto ("swipe"). Este segundo método va acompañado de una
            // animación que provoca un efecto visual feo si no desactivamos temporalmente la nuestra…
            document.body.classList.remove('transition')
            document.querySelector('header').classList.add('hidden')

            // …pero volvamos a activarla unos instantes después, cuando la animación del navegador
            // ha concluido
            setTimeout(() => document.body.classList.add('transition'), 500)

            const slug = this.slug(document.location)
            slug ? this.load(slug) : this.menu()
        })

        document
            .querySelector('header')
            .addEventListener('transitionend', (event) => {
                if (
                    event.target.tagName === 'HEADER' &&
                    event.propertyName === 'margin-left'
                ) {
                    const element = document.body.classList.contains('article')
                        ? this.nav
                        : this.article
                    element.parentNode.classList.add('hidden')
                }
            })

        window.addEventListener('resize', this.resizeVideos)
    },

    /**
     * Cierra la vista de artículo y presenta la portada
     */
    menu: function () {
        window.scrollTo(0, 0)
        document.body.classList.remove('article')

        document.title = this.title
        document
            .querySelector('meta[name=description]')
            .setAttribute('content', this.description)
        document
            .querySelector('meta[property="og:description"]')
            .setAttribute('content', this.description)
        document
            .querySelector('meta[property="og:title"]')
            .setAttribute('content', this.title)
        document
            .querySelector('meta[property="og:url"]')
            .setAttribute('content', this.url)

        this.nav.parentNode.classList.remove('hidden')
    },

    /**
     * Carga un artículo y lo presenta al usuario para su lectura
     */
    load: async function (slug) {
        const item = this.items.find((i) => i.id === slug)

        if (!item) {
            return this.error()
        }

        const type = item.date_published ? 'post' : 'page'
        const folder = type === 'post' ? 'posts' : 'pages'

        const response = await fetch(`/${folder}/${slug}/index.html`)
        if (!response.ok) {
            return this.error()
        }

        const base = document.querySelector('head base')
        base.setAttribute('href', `/${folder}/${slug}/`)

        document.title = item.title
        document
            .querySelector('meta[name=description]')
            .setAttribute('content', item.content_text)
        document
            .querySelector('meta[property="og:description"]')
            .setAttribute('content', item.content_text)
        document
            .querySelector('meta[property="og:title"]')
            .setAttribute('content', item.title)
        document
            .querySelector('meta[property="og:url"]')
            .setAttribute('content', item.url)

        document.body.classList.add('article')
        this.article.innerHTML = await response.text()
        this.article.setAttribute('lang', item.language)

        this.article.parentNode.classList.remove('hidden')

        if (type === 'post') {
            const h1 = this.article.querySelector('h1').innerHTML
            const date = this.formatDate(item.date_published)
            const header = document.createElement('header')

            const url = `https://github.com/JaimeObregon/jaime.gomezobregon.com/commits/master/httpdocs/posts/${item.id}/index.html`

            header.innerHTML = `
                <h1>${h1}</h1>
                <time datetime="${item.date_published}">
                    <a href="${url}">${date}</a>
                </time>
            `

            this.article.querySelector('h1').replaceWith(header)
        }

        window.scrollTo(0, 0)

        this.resizeVideos()

        this.renderTweets('blockquote.tweet[data-id]', {
            align: 'center',
            lang: 'es',
        })

        this.renderFootnotes('ol#notes li', 'a.note')
    },

    /**
     * Fuerza que los vídeos de YouTube se vean a ancho completo y en proporción 16:9
     */
    resizeVideos: () => {
        const videos = document.querySelectorAll(
            'figure iframe[src*="youtube-nocookie.com"]'
        )
        videos.forEach((iframe) => {
            const ratio = 16 / 9
            iframe.style.width = '100%'
            iframe.style.height = `${iframe.offsetWidth / ratio}px`
        })
    },

    /**
     * Carga los tuits que pudiera haber incrustados en un artículo
     */
    renderTweets: async (selector, options) => {
        const tweets = document.querySelectorAll(selector)
        if (!tweets.length) {
            return
        }

        // Cargamos la librería de Twitter solo si no lo ha sido previamente
        // y la entrada contiene tuits
        if (typeof window.twttr === 'undefined') {
            await import('https://platform.twitter.com/widgets.js')
        }

        tweets.forEach((tweet) => {
            tweet.innerHTML = ''
            tweet.classList.add('rendered')
            twttr.widgets.createTweet(tweet.dataset.id, tweet, options)
        })
    },

    /**
     * Presenta las notas al pie, como las que hay en `/la-donacion`
     */
    renderFootnotes: async (references, footnotes) => {
        const refs = document.querySelectorAll(references)
        const notes = document.querySelectorAll(footnotes)

        if (!notes.length) {
            return
        }

        notes.forEach((note, i) => {
            const href = note.getAttribute('href')
            const index = [...refs].findIndex((ref) => `#${ref.id}` === href)

            if (index < 0) {
                throw new Error(`Nota al pie desconocida: ${href}`)
            }

            const number = index + 1
            const id = `nota-${i + 1}`

            const path = document.location.pathname

            note.outerHTML = `<a class="note" href="${path}${href}" id="${id}"><sup>${number}</sup></a>`
            refs[index].querySelector(
                'p:last-of-type'
            ).innerHTML += `<a class="ref" href="${path}#${id}">↩︎</a>`
        })
    },

    /**
     * Muestra una página de error
     */
    error: async () => {
        const response = await fetch('/error.html')
        const content = await response.text()
        document.body.innerHTML = content
        document.head.innerHTML = `
            <style>
                ${document.body.querySelector('style').innerText}
            </style>
        `
        document.body.querySelector('style').remove()
        document.title = 'Error'
        return false
    },
}
