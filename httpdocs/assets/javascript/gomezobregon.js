import { posts } from './posts.js?1'

((menu, contents) => {

    const nav = document.querySelector(menu)

    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }

    const items = Object.entries(posts).map(([slug, post]) => `
        <li>
            <a href="/${slug}" hreflang="${post.language}">
                ${post.title}
                <time>${new Date(post.date).toLocaleDateString('es-ES', options)}</time>
            </a>
        </li>
    `)

    nav.innerHTML = `
        <ol>
            ${items.join('')}
        </ol>
    `

    nav.addEventListener('click', async event => {
        const a = event.target.closest('a')
        if (!a) {
            return
        }

        event.preventDefault()
        document.querySelector('head base').remove()
        document.head.innerHTML += `<base href="/posts/la-locomotora-de-praga/">`
        const url = new URL(a.href)
        const response = await fetch(`/posts${url.pathname}/index.html`)
        const content = await response.text()
        document.querySelector(contents).innerHTML = content
    })

})('body > nav', 'main')
