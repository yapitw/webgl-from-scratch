attribute vec2 position;
varying vec2 vPosition;
void main() {
    vPosition = position;
    gl_Position = vec4(position, 0.0, 1.0);
}
