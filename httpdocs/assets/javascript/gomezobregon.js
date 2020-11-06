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

    main : null,

    close : null,

    /**
     * Inicializa la lógica del blog
     */
    init: function(options = {}) {
        const {
            nav = 'nav',
            main = 'article',
            close = 'button',
        } = options

        this.nav = document.querySelector(nav)
        this.main = document.querySelector(main)
        this.close = document.querySelector(close)

        const slug = document.location.pathname.split('/')[1]
        if (posts[slug]) {
            blog.load(slug)
        }

        setTimeout(() => document.body.classList.add('transition'), 500)

        const items = Object.entries(posts).map(([slug, post], order) => `
            <li style="--order: ${order + 1}">
                <a href="/${slug}" hreflang="${post.language}">
                    ${post.title}
                    <time>${new Date(post.date).toLocaleDateString('es-ES', this.dateFormat)}</time>
                </a>
            </li>
        `)

        this.nav.innerHTML = `
            <ol>
                ${items.join('')}
            </ol>
        `

        this.nav.addEventListener('click', event => {
            const a = event.target.closest('a')
            if (!a) {
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
    },

    /**
     * Carga un artículo
     */
    load: async function(slug) {
        document.querySelector('head base').remove()
        document.head.innerHTML += `<base href="/posts/${slug}/">`
        const response = await fetch(`/posts/${slug}/index.html`)

        if (!response.ok) {
            alert('Error')
        }
        else {
            document.body.classList.add('article')
            const content = await response.text()
            this.main.innerHTML = content

            const header = document.createElement('header')

            const h1 = this.main.querySelector('h1').innerHTML
            const date = new Date(posts[slug].date).toLocaleDateString('es-ES', this.dateFormat)

            header.innerHTML = `
                <h1>${h1}</h1>
                <time>${date}</time>
            `

            this.main.querySelector('h1').replaceWith(header)

            this.main.querySelectorAll('script').forEach(script => eval(script.innerText))
        }
    },

}

blog.init({
    nav: 'nav > div',
    main: 'article',
    close: 'main > button',
})
