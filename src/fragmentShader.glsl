precision mediump float;
uniform vec4 color;
varying vec2 vPosition;

void main() {
    float alpha = (1.0 - abs(pow(vPosition.x, 2.0) / 1.0)) * (1.0 - abs(pow(vPosition.y, 2.0) / 1.0));
    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
}
