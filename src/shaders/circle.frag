precision mediump float;
uniform vec4 color;
varying vec2 vPosition;

void main() {
    float x = vPosition.x;
    float y = vPosition.y;
    float alpha = floor(pow(pow(x, 2.0) + pow(y, 2.0), 0.5) / 0.5);
    gl_FragColor = vec4(vec3(1.0 - alpha), 1.0);
}
