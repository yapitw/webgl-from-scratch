import { initWebGL } from '../lib/webGL'
import { pushItems } from '../utils/pushItem'

export function sketch2(canvas: HTMLCanvasElement) {
    const { gl, program } = initWebGL({
        canvas,
        vertexShaderScript: /* glsl */ `
        attribute vec4 a_Position;
        attribute float a_PointSize;
        void main() {
            gl_Position = a_Position;
            gl_PointSize = a_PointSize;
        }
    `,
        fragmentShaderScript: /* glsl */ `
        precision mediump float;
        uniform vec4 vColor;
        void main() {
        gl_FragColor = vColor;
        }
    `,
    })

    const draw = () => {
        const aPosition = gl.getAttribLocation(program, 'a_Position')
        // Method 1
        // gl.vertexAttrib3f(aPosition, 0.0, 0.0, 0.0)
        // Method 2
        const p = new Float32Array([0, 0, 0])
        gl.vertexAttrib3fv(aPosition, p)

        const aPointSize = gl.getAttribLocation(program, 'a_PointSize')
        gl.vertexAttrib1f(aPointSize, 20.0)

        const vColor = gl.getUniformLocation(program, 'vColor')
        // Method 1
        gl.uniform4f(vColor, 1.0, 1.0, 1.0, 1.0)
        // Method 2
        // gl.uniform4fv(vColor, new Float32Array([1.0, 0.0, 0.0, 1.0]));

        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.POINTS, 0, 1)
    }

    draw()
}

function createPoints(row: number, col: number, offset = [0, 0]) {
    const position: number[] = []
    const size: number[] = []
    const color: number[] = []
    const multiData: number[] = []

    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            const x = -1 + (2 * c) / (col - 1) + offset[0]
            const y = -1 + (2 * r) / (row - 1) + offset[1]
            const z = -1
            const s = ((c + r) * 10) / (col + row)
            const cR = (x + 1) / 2
            const cG = (y + 1) / 2
            const cB = (z + 1) / 2
            pushItems(position, x, y, z)
            pushItems(size, s)
            pushItems(color, cR, cG, cB)
            pushItems(multiData, x, y, z, cR, cG, cB, s)
        }
    }
    return {
        position: new Float32Array(position),
        size: new Float32Array(size),
        color: new Float32Array(color),
        multiData: new Float32Array(multiData),
    }
}

export function sketch3(canvas: HTMLCanvasElement) {
    const { gl, program } = initWebGL({
        canvas,
        vertexShaderScript: /* glsl */ `
        attribute vec4 position;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
            gl_Position = position;
            gl_PointSize = size;
            vColor = vec3(color);
        }
        `,
        fragmentShaderScript: /* glsl */ `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
        `,
    })

    const data = createPoints(10, 20, [0, -1])

    const draw = () => {
        const SIZE = data.multiData.BYTES_PER_ELEMENT // 4
        const buffer = gl.createBuffer()
        if (!buffer) throw Error('Buffer creation failed')

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data.multiData, gl.STATIC_DRAW)
        const position = gl.getAttribLocation(program, 'position')
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, SIZE * 7, 0)
        gl.enableVertexAttribArray(position)

        const color = gl.getAttribLocation(program, 'color')
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, SIZE * 7, SIZE * 3)
        gl.enableVertexAttribArray(color)

        const size = gl.getAttribLocation(program, 'size')
        gl.vertexAttribPointer(size, 1, gl.FLOAT, false, SIZE * 7, SIZE * 6)
        gl.enableVertexAttribArray(size)

        // Draw the points
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.POINTS, 0, 200)
    }

    draw()
}
