class Tooltip {
    container: HTMLElement
    tooltip: HTMLDivElement

    constructor(container: HTMLElement) {
        const hash = Date.now()
        const tooltip = document.createElement('div')
        tooltip.classList.add(`tooltip${hash}`)
        tooltip.style.position = 'absolute'
        tooltip.style.opacity = '0'
        tooltip.style.backgroundColor = 'rgb(240,240,240)'
        tooltip.style.borderRadius = '10px'
        tooltip.style.fontSize = '12px'
        tooltip.style.pointerEvents = 'none'
        tooltip.style.userSelect = 'none'
        tooltip.style.textTransform = 'uppercase'
        tooltip.style.padding = '0 5px'
        container.appendChild(tooltip)
        this.container = container
        this.tooltip = tooltip
    }
    setLocation = (
        location?: [x: number, y: number],
        options?: {
            text: string
            offset?: [x: number, y: number]
        },
    ) => {
        const { text = '', offset = [0, 0] } = options || {}
        while (this.tooltip.hasChildNodes()) {
            this.tooltip.firstChild?.remove()
        }
        if (location && text) {
            const textElement = document.createTextNode(text)
            const { left, top } = this.calcFitLocation(location)
            this.tooltip.style.opacity = '1'
            this.tooltip.style.top = `${(top ?? 0) + offset[1]}px`
            this.tooltip.style.left = `${(left ?? 0) + offset[0]}px`
            this.tooltip.appendChild(textElement)
        } else {
            this.tooltip.style.opacity = '0'
        }
    }

    calcFitLocation = (location: [x: number, y: number]) => {
        const [x, y] = location
        const containerRect = this.container.getBoundingClientRect()
        const rect = this.tooltip.getBoundingClientRect()
        let calcLeft = undefined
        let calcTop = undefined
        if (x > rect.width && x + rect.width / 2 < containerRect.width) {
            calcLeft = x - rect.width / 2
        } else if (x <= rect.width) {
            calcLeft = x
        } else if (x + rect.width / 2 >= containerRect.width) {
            calcLeft = x - rect.width
        }
        if (y > 2 * rect.height && y < containerRect.height) {
            calcTop = y - rect.height
        } else {
            calcTop = y
        }
        return {
            left: calcLeft,
            top: calcTop,
        }
    }
}

export default Tooltip
