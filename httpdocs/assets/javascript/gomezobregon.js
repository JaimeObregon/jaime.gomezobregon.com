import { posts } from './posts.js?1'

    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }

const load = async (url, contents) => {
    const slug = url.split('/')[1]
    document.querySelector('head base').remove()
    document.head.innerHTML += `<base href="/posts/${slug}/">`
    const response = await fetch(`/posts/${slug}/index.html`)

    if (!response.ok) {
        console.log('404')
    }
    else {
        document.body.classList.add('article')
        const content = await response.text()
        document.querySelector(contents).innerHTML = content

        const header = document.createElement('header')

        const h1 = document.querySelector(contents).querySelector('h1').innerHTML
        const date = new Date(posts[slug].date).toLocaleDateString('es-ES', options)

        header.innerHTML = `
            <h1>${h1}</h1>
            <time>${date}</time>
        `

        document.querySelector(contents).querySelector('h1').replaceWith(header)

        const title = posts[slug].title
        history.pushState({}, title, url)
    }
}

((menu, contents) => {

    const nav = document.querySelector(menu)


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

    nav.addEventListener('click', event => {
        const a = event.target.closest('a')
        if (!a) {
            return
        }

        const url = new URL(a.href)

        event.preventDefault()

        load(url.pathname, contents)
    })

})('nav', 'main div')


document.querySelector('button').addEventListener('click', event => {
    document.body.classList.toggle('article')
    // history.back()
    history.pushState({}, '', '/')
})

const slug = document.location.pathname.split('/')[1]

if (posts[slug]) {
    load('/' + slug, 'main div')
}
