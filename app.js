class Spotlight{
    connectedCallback () {
        this.classList.add('spotlight')
        this.innerHTML = /*html*/ `
        <div class="spotlight active">
		    <div class="spotlight-bar">
			    <input type="text">
			    <ul class="spotlight-suggestions" hidden>
				 
			    </ul>
		    </div>
	    </div>
        `
        this.input = this.querySelector('input')
        window.addEventListener('keydown', this.shortcutHandler)
        window.addEventListener('blur', this.hide)

        this.input.addEventListener('keydown', this.inputShortcutHandler)
        this.suggestions = this.querySelector('.spotlight-suggestions')

        this.items = Array.from(document.querySelectorAll(this.getAttribute('target'))).map(a => {
            const title = a.innerText.trim()
            if (title === '') {
                return null;
            }
            const item = new SpotlightItem(title, a.getAttribute('href'))
            this.suggestions.appendChild(item.element)
            return item
        }).filter(i => i !== null)

        this.input.addEventListener('input', this.onInput)
    }

    disconnectedCallback () {
        window.removeEventListener('keydown')
    }

    shortcutHandler = (e) => {
        if (e.key === 'k' && e.ctlKey === true) {
            e.preventDefault()
            this.classList.add('active')
            this.input.value = ''
            this.onInput()
            this.input.focus()
        }
    }

    hide = (e) => {
        this.classList.remove('active')
    }

    onInput = () => {
        const search = this.input.value.trim()

        if (search === "") {
            this.temes.forEach(i => i.hide())
            this.matchedItems = []
            this.suggestions.setAttribute('hidden', 'hidden')
            return 
        }

        let regexp = '^(.*)'

        for (const i in search) {
            regexp += `(${search[i]})(.*)`
        }
        regexp +='$'
        regexp = new RegExp(regexp, 'i')
        this.matchedItems =  this.items.filter(i => i.match(regexp))

        if (this.matchedItems > 0) {
        	this.suggestions.removeAttribute('hidden')
            this.setActiveIndex(0)
        }else {
        	this.suggestions.setAttribute('hidden', 'hidden')
        }
    }

    setActiveIndex = (n) => {
        if (this.activeItem) {
            this.activeItem.unselect()
        }

        if (n > this.matchedItems.length) {
            n = 0   
        }

        if (n < 0) {
            n = this.matchedItems.length - 1 
        }

        this.matchedItems[0].select()
        this.activeItem = this.matchedItems[n]
    }

    inputShortcutHandler = (e) => {
        if (e.key === 'Escape') {
            this.input.blur()
        }else if (e.key === "ArrowDown") {
            const index = this.matchedItems.findIndex(e => e === this.activeItem)
            this.setActiveIndex(index+1)
        }else if (e.key === "ArrowUp") {
            const index = this.matchedItems.findIndex(e => e === this.activeItem)
            this.setActiveIndex(index-1)
        }else if (e.key === "Enter") {
           this.activeItem.follow()
        }
    }
}


class SpotlightItem
{
    constructor(title, href)
    {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.innerText = title
        a.setAttribute('href', href)
        li.append(a)
        this.element = li
        this.hide()
        this.title = title
        this.href = href
    }

    match = (regexp) => {
        const matches = this.title.match(regexp)
        if (matches === null) {
            this.hide()
            return false
        }

        this.element.firstElementChild.innerHTML = matches.reduce(
            (acc, match, index) => {
                if (index ===0) {
                    return acc
                }
                return acc + (index % 2 === 0 ? `<mark>${match}</mark>` : match)
            },
            ''
        )
        this.element.removeAttribute('hidden')
        return true
    }

    hide = () => {
        this.element.setAttribute('hidden', "hidden")
    }

    select = () => {
        this.element.classList.add('active')
    }

    unselect = () => {
        this.element.classList.remove('active')
    }

    follow = () => {
        window.location.href = href
    }
}

customElements.define('spotlight-bar', Spotlight)
