#ifdef GL_ES
precision mediump float;
#endif

varying vec2 fragCoord;

void main() {
    vec2 uv = fragCoord - .5 + vec2(0, -0.07);
    float pct = smoothstep(0.15, 0.4, length(uv));
    pct = min(pct, 0.15);
    vec3 color = vec3(pct);
    gl_FragColor = vec4(color, 1.);
}