import './style.css'
import './sketches/basic1.ts'
import { sketch } from './sketches/pointer'

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)

sketch(canvas)
