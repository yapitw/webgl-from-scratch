import { createFrameBufferObject } from './createFrameBufferObject'

interface initWebGLArgs {
    canvas: HTMLCanvasElement
    vertexShaderScript: string
    fragmentShaderScript: string
    options?: WebGLContextAttributes
}
/**
 * Init WebGL
 */
export const initWebGL = ({ canvas, vertexShaderScript, fragmentShaderScript, options }: initWebGLArgs) => {
    const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2', options)
    if (!gl) throw Error('WebGL init failed')
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertexShader) throw Error('VertexShader creation failed')
    gl.shaderSource(vertexShader, vertexShaderScript)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragmentShader) throw Error('FragmentShader creation failed')

    gl.shaderSource(fragmentShader, fragmentShaderScript)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()
    if (!program) throw Error('Program creation failed')
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    return { gl, program }
}

export const resizeGl = (gl: WebGL2RenderingContext) => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}

export const getSize = (gl: WebGL2RenderingContext) => {
    return {
        width: gl.canvas.width,
        height: gl.canvas.height,
    }
}

// A WebGL integration class
export class YapiGL {
    gl: WebGL2RenderingContext
    program: WebGLProgram
    constructor(canvas: HTMLCanvasElement, vertexShaderScript: string, fragmentShaderScript: string) {
        const { gl, program } = initWebGL({
            canvas,
            vertexShaderScript,
            fragmentShaderScript,
            options: { preserveDrawingBuffer: true },
        })

        this.gl = gl
        this.program = program
    }

    createFrameBufferObject = () => {
        return createFrameBufferObject(this.gl, this.gl.canvas.width, this.gl.canvas.height)
    }

    createBuffer = (options?: { target?: number; data?: Float32Array; usage?: number }) => {
        const gl = this.gl
        const { target = gl.ARRAY_BUFFER, data, usage = gl.STATIC_DRAW } = options ?? {}
        const buffer = gl.createBuffer()
        if (!buffer) throw Error('Buffer creation failed')
        gl.bindBuffer(target, buffer)
        if (data) {
            gl.bufferData(target, data, usage)
        }
        return this
    }

    bindFramebuffer = (fbo: WebGLFramebuffer | null) => {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo)
        return this
    }

    clear = (color?: [r: number, g: number, b: number, a?: number]) => {
        const [r = 0, g = 0, b = 0, a = 1] = color ?? []
        const gl = this.gl
        gl.clearColor(r, g, b, a)
        gl.clear(gl.COLOR_BUFFER_BIT)
        return this
    }

    enableCullFace = () => {
        this.gl.enable(this.gl.CULL_FACE)
        return this
    }

    readPixels = (x: number, y: number) => {
        const gl = this.gl
        const pixels = new Uint8Array(4)
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        return { pixels }
    }

    setPointerAttribute = (
        attribute: string,
        options: {
            size: number
            type: number
            normalized?: boolean
            stride?: number
            offset?: number
        },
    ) => {
        const gl = this.gl
        const { size, type, normalized = false, stride = 0, offset = 0 } = options

        const attributeIndex = gl.getAttribLocation(this.program, attribute)
        gl.vertexAttribPointer(attributeIndex, size, type, normalized, stride, offset)
        gl.enableVertexAttribArray(attributeIndex)

        return this
    }
}
