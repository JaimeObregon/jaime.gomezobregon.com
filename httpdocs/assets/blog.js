export const blog = {
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
        const leftButtonClick =
            !event.button && !event.ctrlKey && !event.metaKey

        // Tampoco queremos interferir con los enlaces externos
        const isExternalLink =
            new URL(a.href).origin !== document.location.origin

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
        // En iOS y Safari hay dos formas de navegar por el historial: pulsando los botones del
        // navegador o haciendo un gesto («swipe»). Este segundo método va acompañado de una
        // transición que provoca un efecto visual feo si no desactivamos temporalmente la nuestra…
        document.body.classList.remove('transition')
        document.querySelector('header')?.classList.add('hidden')

        // …y volvemos a activarla unos instantes después, cuando la animación del navegador
        // ha concluido
        setTimeout(() => document.body.classList.add('transition'), 500)

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

        const videos = document.querySelectorAll(
            'figure iframe[src*="youtube-nocookie.com"]'
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
        const tweets = document.querySelectorAll(selector)
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
        const notes = document.querySelectorAll(notesSelector)
        const calls = document.querySelectorAll(callsSelector)

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
            notes[index].querySelector(
                'p:last-of-type'
            ).innerHTML += `<a class="ref" href="${path}#${id}">↩︎</a>`
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
        const response = await fetch('/error.html')
        const content = await response.text()

        const style = document.body.querySelector('style')
        if (style) {
            document.head.innerHTML = `<style>${style.innerText}</style>`
            style.remove()
        }

        document.title = 'Error'
        document.body.innerHTML = content
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

        const slug = pathname.replace(/^\//, '')
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

        if (blog.isItem(document.URL)) {
            blog.dispatch(document.URL)
        }

        // Queremos transiciones suaves al cargar un artículo,
        // pero no cuando se accede directamente a uno por su URL
        setTimeout(() => document.body.classList.add('transition'), 500)

        blog.renderHome()

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
                <h1>${h1}</h1>
                <time datetime="${item.date_published}">
                    <a href="${url}" title="Ver el historial de cambios en GitHub">
                        ${date}
                    </a>
                </time>
                <nav>
                    ${item.tags
                        .map((tag) => `<a href="/temas/${tag}">${tag}</a>`)
                        .join(', ')}
                </nav>
            `

            this.article.querySelector('h1').replaceWith(header)
        }

        this.resizeVideos()

        this.renderTweets('blockquote.tweet[data-id]', {
            align: 'center',
            lang: 'es',
        })

        this.renderFootnotes('ol#notes li', 'a.note')

        console.log(location.hash)
        if (location.hash) {
            const id = location.hash.replace(/^#/, '')
            const fragment = document.getElementById(id)
            fragment?.scrollIntoView()
        } else {
            window.scrollTo(0, 0)
        }
    },
}
