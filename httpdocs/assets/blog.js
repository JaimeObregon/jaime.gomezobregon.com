export const blog = {

    /**
     * Formato de las fechas
     */
    dateFormat: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    },

    /**
     * Elemento del DOM en el que se mostrará el índice de artículos
     */
    nav: null,

    /**
     * Elemento donde se cargará el contenido de cada artículo
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
    slug: location => new URL(location).pathname.split('/')[1],

    /**
     * Inicializa la lógica del blog
     */
    init: async function(options = {}) {
        const {
            nav = 'nav',
            close = 'button',
            article = 'article',
            feed = '/posts/index.json',
        } = options

        this.nav = document.querySelector(nav)
        this.close = document.querySelector(close)
        this.article = document.querySelector(article)

        const response = await fetch(feed)
        const json = await response.json()
        this.posts = json.items

        this.title = document.title
        this.url = document.querySelector('meta[property="og:url"]').getAttribute('content')
        this.description = document.querySelector('meta[name=description]').getAttribute('content')

        const slug = this.slug(document.location)
        slug && blog.load(slug) && this.nav.parentNode.classList.add('hidden')

        // Queremos transiciones suaves al cargar un artículo,
        // pero no cuando se accede directamente a uno por su URL
        setTimeout(() => document.body.classList.add('transition'), 500)

        // La lista de artículos es larga. Apliquemos la demora estética solo en
        // los primeros artículos, para que la lista completa no tarde demasiado en cargar.
        // Mientras carga, Safari en iOS requiere un doble tap, que así evitamos.
        const howManyAnimate = 12
        const items = this.posts.map((post, order) => `
            <li style="--delay: ${order < howManyAnimate ? order + 1 : 0}">
                <a href="/${post.id}" hreflang="${post.language}">
                    ${post.title}
                    <time datetime="${post.date_published}">
                        ${new Date(post.date_published).toLocaleDateString('es-ES', this.dateFormat)}
                    </time>
                </a>
            </li>
        `)

        this.nav.innerHTML = `
            <ol>
                ${items.join('')}
            </ol>
        `

        this.nav.addEventListener('click', event => {
            // Discriminemos el control+clic o clic con el botón central,
            // para que el usuario pueda seguir abriendo los enlaces en nuevas pestañas
            const leftButtonClick = event.which === 1 && !event.ctrlKey && !event.metaKey

            const a = event.target.closest('a')
            if (!a || !leftButtonClick) {
                return
            }

            event.preventDefault()
            const slug = this.slug(a.href)

            history.pushState(null, this.posts.find(i => i.id === slug).title, `/${slug}`)
            this.load(slug)
        })

        this.close.addEventListener('click', event => {
            history.pushState(null, '', '/')
            this.menu()
        })

        window.addEventListener('popstate', event => {
            // En iOS y Safari hay dos formas de navegar por el historial: pulsando los botones del
            // navegador o haciendo un gesto ("swipe"). Este segundo método va acompañado de una
            // animación que provoca un efecto visual feo si no desactivamos temporalmente la nuestra...
            document.body.classList.remove('transition')

            // ...pero volvamos a activarla unos instantes después, cuando la animación del navegador
            // ha concluido
            setTimeout(() => document.body.classList.add('transition'), 500)

            const slug = this.slug(document.location)
            slug ? this.load(slug) : this.menu()
        })

        document.querySelector('header').addEventListener('transitionend', event => {
            if (event.target.tagName === 'HEADER' && event.propertyName === 'margin-left') {
                const element = document.body.classList.contains('article') ? this.nav : this.article
                element.parentNode.classList.add('hidden')
            }
        })

        window.addEventListener('resize', this.resizeVideos)
    },

    /**
     * Cierra la vista de artículo y presenta el índice de artículos
     */
    menu: function() {
        window.scrollTo(0, 0)
        document.body.classList.remove('article')

        document.title = this.title
        document.querySelector('meta[name=description]').setAttribute('content', this.description)
        document.querySelector('meta[property="og:description"]').setAttribute('content', this.description)
        document.querySelector('meta[property="og:title"]').setAttribute('content', this.title)
        document.querySelector('meta[property="og:url"]').setAttribute('content', this.url)

        this.nav.parentNode.classList.remove('hidden')
    },

    /**
     * Carga un artículo y lo presenta al usuario para su lectura
     */
    load: async function(slug) {
        if (!this.posts.find(i => i.id === slug)) {
            return this.error()
        }

        const response = await fetch(`/posts/${slug}/index.html`)
        if (!response.ok) {
            return this.error()
        }

        const post = this.posts.find(i => i.id === slug)

        const base = document.querySelector('head base')
        base.setAttribute('href', `/posts/${slug}/`)

        document.title = post.title
        document.querySelector('meta[name=description]').setAttribute('content', post.content_text)
        document.querySelector('meta[property="og:description"]').setAttribute('content', post.content_text)
        document.querySelector('meta[property="og:title"]').setAttribute('content', post.title)
        document.querySelector('meta[property="og:url"]').setAttribute('content', post.url)

        document.body.classList.add('article')
        this.article.innerHTML = await response.text()
        this.article.setAttribute('lang', post.language)

        this.article.parentNode.classList.remove('hidden')

        const h1 = this.article.querySelector('h1').innerHTML
        const date = new Date(post.date_published).toLocaleDateString('es-ES', this.dateFormat)
        const header = document.createElement('header')
        header.innerHTML = `
            <h1>${h1}</h1>
            <time datetime="${post.date_published}">${date}</time>
        `

        this.article.querySelector('h1').replaceWith(header)

        window.scrollTo(0, 0)

        this.resizeVideos('figure iframe[src*="youtube-nocookie\.com"]')

        this.renderTweets('blockquote.tweet[data-id]', {
            align: 'center',
        })
    },

    /**
     * Fuerza que los vídeos de YouTube se vean a ancho completo y en proporción 16:9
     */
    resizeVideos: selector => {
        const videos = document.querySelectorAll(selector)
        videos.forEach(iframe => {
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

        tweets.forEach(tweet => {
            tweet.innerHTML = ''
            tweet.classList.add('rendered')
            twttr.widgets.createTweet(tweet.dataset.id, tweet, options)
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
    }

}
