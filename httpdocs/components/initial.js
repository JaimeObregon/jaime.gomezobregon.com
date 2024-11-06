import { MyElement } from '../modules/element.js'
import { css } from '../modules/strings.js'

class Initial extends MyElement {
  static styles = css`
    :host {
      float: left;
      height: var(--initial-size);
      aspect-ratio: 1;
      margin-right: 0.15em;
      transform: translate(-4px, 4px);
    }

    svg {
      aspect-ratio: 1;
      background: var(--initial-flourishes);
      fill: var(--color-background);

      path.letter {
        fill: var(--initial-letter);
      }
    }
  `

  static html = ''

  async connectedCallback() {
    const initial = this.getAttribute('letter')
    if (!initial) {
      return
    }

    const letter = initial.toLowerCase()
    const url = new URL(`/initials/${letter}.svg`, window.location.origin)

    const response = await fetch(url)

    const text = await response.text()

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = text
    }
  }
}

customElements.define('x-initial', Initial)

export { Initial }
