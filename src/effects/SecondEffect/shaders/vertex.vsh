varying vec2 vUv;
varying vec3 pos;
varying vec3 norm;

uniform float time;

void main() {
    vUv = uv;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

    pos = position.xzy;
    norm = normal.xzy;
    gl_Position = projectionMatrix * modelViewPosition;
}