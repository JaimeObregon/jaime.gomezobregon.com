import ResizeObserver from "https://cdn.skypack.dev/resize-observer-polyfill@1.5.1"
import html2canvas from "https://cdn.skypack.dev/html2canvas@1.0.0-rc.7"
import FileSaver from "https://cdn.skypack.dev/file-saver@2.0.5"
import { SVG } from "https://cdn.skypack.dev/@svgdotjs/svg.js"

const socialImageTitle = document.querySelector("svg h1")
const socialImageMeta = document.querySelector("svg h2")
const socialImageSVG = document.querySelector("svg")

const alignmentBtn = document.querySelector("button.alignment")
const shapesBtn = document.querySelector("button.shapes")
const colorBtn = document.querySelector("button.colors")
const saveBtn = document.querySelector("button.save")

let baseColorBlack
let baseColorWhite
let baseColor

let complimentaryColor1
let complimentaryColor2

let shapeColors

const alignmentOpts = ["flex-start", "flex-end", "center"]

const shapes = SVG(socialImageSVG).group()

setColors()
generate()

const resizeObserver = new ResizeObserver(generate)

resizeObserver.observe(socialImageTitle)
resizeObserver.observe(socialImageMeta)

function generate() {
    shapes.clear()

    const htmlRects = [
        relativeBounds(socialImageSVG, socialImageTitle),
        relativeBounds(socialImageSVG, socialImageMeta)
    ]

    const rects = generateRandomRects(htmlRects)

    for (const rect of rects.slice(2, rects.length)) {
        drawRandomShape(rect)
    }
}

function setColors() {
    const baseHue = random(0, 360)
    const saturation = random(60, 90)

    baseColor = `hsl(${baseHue}, ${saturation}%, 60%)`
    baseColorWhite = `hsl(${baseHue}, ${saturation}%, 97%)`
    baseColorBlack = `hsl(${baseHue}, 95%, 3%)`

    complimentaryColor1 = `hsl(${baseHue + 90}, ${saturation}%, 60%)`
    complimentaryColor2 = `hsl(${baseHue + 180}, ${saturation}%, 60%)`

    shapeColors = [complimentaryColor1, complimentaryColor2, baseColor]

    socialImageSVG.style.background = baseColorWhite
    socialImageSVG.style.color = baseColorBlack
}

function drawRandomShape({ x, y, width, height }) {
    const shapeChoices = ["rect", "ellipse", "triangle"]
    let shape

    switch (shapeChoices[~~random(0, shapeChoices.length)]) {
        case "ellipse":
            shape = shapes.ellipse(width, height).x(x).y(y)
            break
        case "triangle":
            shape = shapes
                .polygon(`0 ${height}, ${width / 2} 0, ${width} ${height}`)
                .x(x)
                .y(y)
            break
        default:
            shape = shapes.rect(width, height).x(x).y(y)
    }

    const color = randomColor()

    if (random(0, 1) > .25) {
        shape.fill(color)
    } else {
        shape.stroke({
            color,
            width: 16
        })
        .fill("transparent")
    }

    shape.node.classList.add("shape")
    shape.rotate(random(0, 90)).scale(.825)
    shape.opacity(random(.5, 1))
}

function randomColor() {
    return shapeColors[~~random(0, shapeColors.length)]
}

function randomAlignment() {
    return alignmentOpts[~~random(0, alignmentOpts.length)]
}

function generateRandomRects(existing) {
    const rects = [...existing]
    const tries = 250
    const maxShapes = 6

    for (let i = 0; i < tries; i++) {
        if (rects.length === maxShapes + existing.length) {
            break
        }

        const size = random(100, 600)

        const rect = {
            x: random(-size, 1200),
            y: random(-size, 630),
            width: size,
            height: size
        }

        if (!rects.some(r => detectRectCollision(r, rect))) {
            rects.push(rect)
        }
    }

    return rects
}

function random(min, max) {
    return Math.random() * (max - min) + min
}

function detectRectCollision(rect1, rect2, padding = 32) {
    return (
        rect1.x < rect2.x + rect2.width + padding &&
        rect1.x + rect1.width + padding > rect2.x &&
        rect1.y < rect2.y + rect2.height + padding &&
        rect1.y + rect1.height + padding > rect2.y
    )
}

function relativeBounds(svg, HTMLElement) {
    const { x, y, width, height } = HTMLElement.getBoundingClientRect()

    const startPoint = svg.createSVGPoint()
    startPoint.x = x
    startPoint.y = y

    const endPoint = svg.createSVGPoint()
    endPoint.x = x + width
    endPoint.y = y + height

    const startPointTransformed = startPoint.matrixTransform(
        svg.getScreenCTM().inverse()
    )
    const endPointTransformed = endPoint.matrixTransform(
        svg.getScreenCTM().inverse()
    )

    return {
        x: startPointTransformed.x,
        y: startPointTransformed.y,
        width: endPointTransformed.x - startPointTransformed.x,
        height: endPointTransformed.y - startPointTransformed.y
    }
}

// regenerate our shapes and shape positions
shapesBtn.addEventListener("click", generate)

// set new random color values and update the existing shapes with these colors
colorBtn.addEventListener("click", () => {
    setColors()

    // find all the shapes in our svg and update their fill / stroke
    socialImageSVG.querySelectorAll(".shape").forEach(node => {
        if (node.getAttribute("stroke")) {
            node.setAttribute("stroke", randomColor())
        }
        else {
            node.setAttribute("fill", randomColor())
        }
    })
})

// choose random new alignment options and update the CSS custom properties, regenerate the shapes
alignmentBtn.addEventListener("click", () => {
    socialImageSVG.style.setProperty(
        "--align-text-x",
        alignmentOpts[~~random(0, alignmentOpts.length)]
    )
    socialImageSVG.style.setProperty(
        "--align-text-y",
        alignmentOpts[~~random(0, alignmentOpts.length)]
    )
    generate()
})

// save our social image as a .png file
saveBtn.addEventListener("click", () => {
    const bounds = socialImageSVG.getBoundingClientRect()

    // on save, update the dimensions of our social image so that it exports as expected
    socialImageSVG.style.width = "1200px"
    socialImageSVG.style.height = "630px"
    socialImageSVG.setAttribute("width", 1200)
    socialImageSVG.setAttribute("height", 630)
    // this fixes an odd visual "cut off" bug when exporting
    window.scrollTo(0, 0)

    html2canvas(document.querySelector("main > div"), {
        width: 1200,
        height: 630,
        scale: 2 // export our image at 2x resolution so it is nice and crisp on retina devices
    }).then(canvas => {
        canvas.toBlob(function (blob) {
            // restore the social image styles
            socialImageSVG.style.width = "100%"
            socialImageSVG.style.height = "auto"
            socialImageSVG.setAttribute("width", "")
            socialImageSVG.setAttribute("height", "")

            FileSaver.saveAs(blob, "poster.png")
        })
    })
})
