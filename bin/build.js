import fs from 'fs'
import { globby } from 'globby'
import { JSDOM } from 'jsdom'
;(async () => {
    const files = await globby([`./httpdocs/{posts,pages}/*/index.html`])

    const results = files.flatMap((file) => {
        console.log(file)

        const html = fs.readFileSync(file, 'utf8')

        const dom = new JSDOM(html)
        const items = dom.window.document.querySelectorAll('cite')
        const results = [...items]
            .map((link) =>
                link.textContent?.replace(/\s+/g, ' ').replace(/(^\s|\s$)/, '')
            )
            .sort((a, b) => a.localeCompare(b))

        const unique = [...new Set(results)]
        return unique
    })

    console.log(results)
})()
