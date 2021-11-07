import vertexShader from '../shaders/basic.vert'
import circleFragShader from '../shaders/circle.frag'
import { initWebGL, resizeGl } from '../lib/webGL'

// Create Shape with DrawArrays
export const createShapeA = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    const vertices = new Float32Array([
        // eslint-disable-next-line prettier/prettier
        -1, 1,
        1, 1, 
        1, -1,  
        -1, 1,
        -1, -1,
        1, -1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const color = gl.getUniformLocation(program, 'color')
    gl.uniform4f(color, 0, 1, 0, 1.0)

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
}

// Create Shape with DrawElements
const createShapeB = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    const positions = new Float32Array(
        [
            // eslint-disable-next-line prettier/prettier
        -1, 1,
        -1, -1,
        1, -1,
        1, 1,
        ].map((d) => d / 1),
    )

    const indices = [0, 1, 2, 2, 3, 0]

    const SIZE = positions.BYTES_PER_ELEMENT

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, SIZE * 2, 0)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
}

export function sketch1(canvas: HTMLCanvasElement) {
    const { gl, program } = initWebGL({
        canvas,
        vertexShaderScript: vertexShader,
        fragmentShaderScript: circleFragShader,
    })

    const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        resizeGl(gl)
    }

    window.addEventListener('resize', resize)

    const draw = () => {
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        createShapeB(gl, program)
        requestAnimationFrame(draw)
    }

    draw()
}

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
