import { id2rgb, rgb2id } from '../lib/idConvertor'
import { YapiGL } from '../lib/webGL'
import { pushItems } from '../utils/pushItem'
import Tooltip from '../utils/tooltip'
import Color from 'color'

const VSHADER_SOURCE = /* glsl */ `
attribute vec4 position;
attribute vec4 color;
attribute float picking;
varying vec4 _color;

void main() {
  gl_Position = position;
  gl_PointSize = bool(picking) ? 40.0 : 20.0;
  _color = vec4(color.rgb, 1.0);
  
}`
const FSHADER_SOURCE = /* glsl */ `
precision mediump float;  // 表示着色器中配置的 float 对象会占用中等尺寸内存
varying vec4 _color;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5, 0.5));
  if(d < 0.5){
    gl_FragColor = _color;
  } else {
    discard;
  }
}`

const colors = '160f29-246a73-368f8b-f3dfc1-ddbea8'.split('-').map((d) => '#' + d)

const getRandomColor = () => {
    const i = Math.floor(Math.random() * colors.length)
    return colors[i]
}

const data: {
    x: number
    y: number
    color: number[]
    id: number
    msg: string
}[] = []

for (let i = 0; i < 100; i++) {
    const color = getRandomColor()
    data.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        color: Color(color).rgb().array(),
        id: i + 1,
        msg: color,
    })
}

export const sketch = (canvas: HTMLCanvasElement) => {
    const yapi = new YapiGL(canvas, VSHADER_SOURCE, FSHADER_SOURCE)
    const tooltip = new Tooltip(canvas.parentElement || document.body)

    const offScreenFBO = yapi.createFrameBufferObject()
    // offscreen buffer bind shader attributes
    const offScreenData = new Float32Array(
        data.reduce((points, color) => {
            const colorArr = id2rgb(color.id)
            pushItems(
                points, //
                color.x,
                color.y,
                -1,
                colorArr[0] / 255,
                colorArr[1] / 255,
                colorArr[2] / 255,
                0.0,
            )
            return points
        }, []),
    )

    const screenData = new Float32Array(
        data.reduce((points, color) => {
            const colorArr = color.color

            pushItems(
                points, //
                color.x,
                color.y,
                -1,
                colorArr[0] / 255,
                colorArr[1] / 255,
                colorArr[2] / 255,
                1.0,
            )
            return points
        }, []),
    )

    if (!offScreenFBO) throw Error('Failed to create frame buffer object')
    const SIZE = offScreenData.BYTES_PER_ELEMENT

    const drawFBO = () => {
        yapi.bindFramebuffer(offScreenFBO)
            .createBuffer({ data: offScreenData })
            .setPointerAttribute('position', {
                size: 3,
                type: yapi.gl.FLOAT,
                stride: 7 * SIZE,
                offset: 0 * SIZE,
            })
            .setPointerAttribute('color', {
                size: 4,
                type: yapi.gl.FLOAT,
                stride: 7 * SIZE,
                offset: 3 * SIZE,
            })
            .setPointerAttribute('picking', {
                size: 1,
                type: yapi.gl.FLOAT,
                stride: 7 * SIZE,
                offset: 6 * SIZE,
            })
        yapi.gl.drawArrays(yapi.gl.POINTS, 0, data.length)
        yapi.bindFramebuffer(null)
    }

    const drawScreen = () => {
        yapi.clear()
            .bindFramebuffer(null)
            .createBuffer({ data: screenData })
            .setPointerAttribute('position', {
                size: 3,
                type: yapi.gl.FLOAT,
                stride: 7 * SIZE,
                offset: 0 * SIZE,
            })
            .setPointerAttribute('color', {
                size: 4,
                type: yapi.gl.FLOAT,
                stride: 7 * SIZE,
                offset: 3 * SIZE,
            })

        yapi.gl.drawArrays(yapi.gl.POINTS, 0, data.length)
    }

    drawFBO()
    drawScreen()

    canvas.addEventListener('mousemove', (event) => {
        drawScreen()
        const x = event.clientX
        const y = event.clientY
        const rect = canvas.getBoundingClientRect()
        if (rect.left < x && x < rect.right && rect.top < y && y < rect.bottom) {
            const xInCanvas = x - rect.left
            const xInGL = xInCanvas
            const yInCanvas = y - rect.top
            const yInGL = rect.bottom - y

            yapi.bindFramebuffer(offScreenFBO)
            const { pixels } = yapi.readPixels(xInGL, yInGL)
            yapi.bindFramebuffer(null)
            const index = rgb2id(pixels)

            const text = data.find((item) => item.id === index)?.msg ?? ''

            tooltip.setLocation([xInCanvas, yInCanvas], { text, offset: [10, 0] })

            const emptyArr = new Array(data.length).fill(0)
            const pickingArr = emptyArr.map((_, i) => (data[i].id === index ? 1 : 0))
            yapi.bindFramebuffer(null)
                .createBuffer({
                    data: new Float32Array(pickingArr),
                })
                .setPointerAttribute('picking', {
                    size: 1,
                    type: yapi.gl.FLOAT,
                })
            yapi.gl.drawArrays(yapi.gl.POINTS, 0, data.length)
        }
    })
}
