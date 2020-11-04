import { posts } from './posts.js?1'

((menu, contents) => {

	const nav = document.querySelector(menu)

	const items = Object.entries(posts).map(([slug, post]) => `
        <li>
            <a href="/posts/${slug}">
                ${post.title}
            </a>
        </li>
	`)

	nav.innerHTML = `
		<ol>
			${items.join('')}
		</ol>
	`

	nav.addEventListener('click', async event => {
		document.querySelector('head base').remove()
		document.head.innerHTML += `<base href="/posts/la-locomotora-de-praga/">`
		event.preventDefault()
		const response = await fetch(`${event.target.href}/index.html`)
		const content = await response.text()
		document.querySelector(contents).innerHTML = content
	})

})('body > nav', 'main')