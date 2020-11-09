import { posts } from './posts.js?1'

const blog = {

    /**
     * Formato de las fechas
     */
    dateFormat: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    },

    nav : null,

    article : null,

    close : null,

    title : document.querySelector('head title'),

    /**
     * Inicializa la lógica del blog
     */
    init: function(options = {}) {
        const {
            nav = 'nav',
            close = 'button',
            article = 'article',
        } = options

        this.nav = document.querySelector(nav)
        this.article = document.querySelector(article)
        this.close = document.querySelector(close)

        const slug = document.location.pathname.split('/')[1]
        if (slug) {
            blog.load(slug)
        }

        setTimeout(() => document.body.classList.add('transition'), 500)

        const items = Object.entries(posts).map(([slug, post], order) => `
            <li style="--order: ${order + 1}">
                <a href="/${slug}" hreflang="${post.language}">
                    ${post.title}
                    <time datetime="${post.date}">
                        ${new Date(post.date).toLocaleDateString('es-ES', this.dateFormat)}
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

            const slug = new URL(a.href).pathname.split('/')[1]
            this.load(slug)

            const title = posts[slug].title
            history.pushState(null, title, `/${slug}`)
        })

        this.close.addEventListener('click', event => {
            this.menu()
            history.pushState(null, '', '/')
        })

        window.addEventListener('popstate', event => {
            const slug = new URL(document.location).pathname.split('/')[1]
            slug ? this.load(slug) : this.menu()
        })
    },

    menu: function() {
        document.body.classList.toggle('article')

        this.title.innerText = this.title.dataset.placeholder
        delete this.title.dataset.placeholder
    },

    /**
     * Carga un artículo
     */
    load: async function(slug) {
        const response = await fetch(`/posts/${slug}/index.html`)

        if (!response.ok) {
            this.error()
        }
        else {
            const base = document.querySelector('head base')
            base.setAttribute('href', `/posts/${slug}/`)

            this.title.dataset.placeholder = this.title.innerText
            this.title.innerText = posts[slug].title

            document.body.classList.add('article')
            const content = await response.text()
            this.article.innerHTML = content

            const header = document.createElement('header')

            const h1 = this.article.querySelector('h1').innerHTML
            const post = posts[slug]
            const date = new Date(post.date).toLocaleDateString('es-ES', this.dateFormat)

            header.innerHTML = `
                <h1>${h1}</h1>
                <time datetime="${post.date}">${date}</time>
            `

            this.article.setAttribute('lang', post.language)

            this.article.querySelector('h1').replaceWith(header)

            // Fuerza que los vídeos de YouTube se vean a ancho completo y en proporción 16:9
            const resizeVideos = (element) => {
                const selector = 'figure iframe[src*="youtube-nocookie\.com"]'
                const videos = element.querySelectorAll(selector)
                videos.forEach(iframe => {
                    const ratio = 16 / 9
                    iframe.style.width = '100%'
                    iframe.style.height = `${iframe.offsetWidth / ratio}px`
                })
            }

            window.addEventListener('resize', () => resizeVideos(this.article))
            resizeVideos(this.article)
        }
    },

    /**
     * Muestra una página de error
     */
    error: async () => {
        const response = await fetch(`/error.html`)
        const content = await response.text()
        document.body.innerHTML = content
        document.head.innerHTML = `<style>${document.body.querySelector('style').innerText}</style>`
        document.body.querySelector('style').remove()
    }

}

blog.init({
    nav: 'body > header > nav',
    article: 'main > article',
    close: 'main > button',
})
