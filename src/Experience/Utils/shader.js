export const fragmentShader = `
varying vec2 vUv;
// uniform sampler for texture video
uniform sampler2D video;

void main()
{
    gl_FragColor = texture2D(video, vUv);
}
`;

export const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float  uBigWavesElevation;
uniform vec2  uBigWavesFrequency;


void main()
{
vUv = uv;
vec4 modelPosition = modelMatrix * vec4(position, 1.0);
float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime) *
                  cos(modelPosition.z * uBigWavesFrequency.y + uTime) *
                      uBigWavesElevation;

    modelPosition.y += elevation;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
}
`;