var canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)

var gl = canvas.getContext('webgl')
gl.clearColor(1, 0, 1, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

var vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader,
    /* glsl */`
    attribute vec2 position;
    void main() {
        gl_position = vec4(position, 0.0, 1.0);
    }
    `
)