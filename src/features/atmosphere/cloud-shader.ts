export const cloudVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const cloudFragmentShader = /* glsl */ `
  precision highp float;

  #define CLOUD_STEPS 8
  #define LIGHT_STEPS 3

  uniform sampler2D weatherMap;
  uniform vec3 cameraWorldPosition;
  uniform vec3 sunDirection;
  uniform float time;
  uniform float innerRadius;
  uniform float outerRadius;

  varying vec3 vWorldPosition;

  const float PI = 3.14159265359;
  const float TAU = 6.28318530718;

  float hash(vec3 point) {
    point = fract(point * 0.3183099 + vec3(0.13, 0.37, 0.71));
    point *= 17.0;
    return fract(point.x * point.y * point.z * (point.x + point.y + point.z));
  }

  float valueNoise(vec3 point) {
    vec3 cell = floor(point);
    vec3 fraction = fract(point);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);
    float a = hash(cell);
    float b = hash(cell + vec3(1.0, 0.0, 0.0));
    float c = hash(cell + vec3(0.0, 1.0, 0.0));
    float d = hash(cell + vec3(1.0, 1.0, 0.0));
    float e = hash(cell + vec3(0.0, 0.0, 1.0));
    float f = hash(cell + vec3(1.0, 0.0, 1.0));
    float g = hash(cell + vec3(0.0, 1.0, 1.0));
    float h = hash(cell + vec3(1.0, 1.0, 1.0));
    return mix(mix(mix(a, b, fraction.x), mix(c, d, fraction.x), fraction.y), mix(mix(e, f, fraction.x), mix(g, h, fraction.x), fraction.y), fraction.z);
  }

  float fbm(vec3 point) {
    float total = 0.0;
    float amplitude = 0.58;
    total += valueNoise(point) * amplitude;
    point = point * 2.03 + vec3(11.7, 3.1, 7.9); amplitude *= 0.5;
    total += valueNoise(point) * amplitude;
    point = point * 2.01 + vec3(5.4, 17.3, 2.6); amplitude *= 0.5;
    total += valueNoise(point) * amplitude;
    return total;
  }

  vec2 weatherUv(vec3 point) {
    vec3 direction = normalize(point);
    return vec2(atan(direction.z, direction.x) / TAU + 0.5, asin(direction.y) / PI + 0.5);
  }

  float cloudDensity(vec3 point) {
    float altitude = (length(point) - innerRadius) / (outerRadius - innerRadius);
    float verticalProfile = smoothstep(0.03, 0.22, altitude) * (1.0 - smoothstep(0.72, 0.98, altitude));
    float coverage = texture2D(weatherMap, weatherUv(point)).a;
    vec3 windOffset = vec3(time * 0.018, time * 0.003, -time * 0.011);
    float baseShape = fbm(point * 3.9 + windOffset);
    float detail = fbm(point * 12.0 - windOffset * 2.4);
    float threshold = mix(0.62, 0.24, smoothstep(0.02, 0.64, coverage));
    return max(0.0, baseShape - threshold - (1.0 - detail) * 0.15) * verticalProfile * 3.1;
  }

  vec2 sphereIntersection(vec3 origin, vec3 direction, float radius) {
    float b = dot(origin, direction);
    float c = dot(origin, origin) - radius * radius;
    float discriminant = b * b - c;
    if (discriminant < 0.0) return vec2(1.0, -1.0);
    float root = sqrt(discriminant);
    return vec2(-b - root, -b + root);
  }

  float lightTransmittance(vec3 point) {
    float transmittance = 1.0;
    float stepSize = (outerRadius - innerRadius) / float(LIGHT_STEPS);
    for (int step = 0; step < LIGHT_STEPS; step++) {
      point += sunDirection * stepSize;
      transmittance *= exp(-cloudDensity(point) * stepSize * 9.0);
    }
    return transmittance;
  }

  void main() {
    vec3 rayDirection = normalize(vWorldPosition - cameraWorldPosition);
    vec2 outerHit = sphereIntersection(cameraWorldPosition, rayDirection, outerRadius);
    vec2 innerHit = sphereIntersection(cameraWorldPosition, rayDirection, innerRadius);
    float start = max(outerHit.x, 0.0);
    float end = innerHit.x > start ? innerHit.x : outerHit.y;
    if (end <= start) discard;

    float stepSize = (end - start) / float(CLOUD_STEPS);
    float transmittance = 1.0;
    vec3 scatteredLight = vec3(0.0);
    for (int step = 0; step < CLOUD_STEPS; step++) {
      vec3 point = cameraWorldPosition + rayDirection * (start + (float(step) + 0.5) * stepSize);
      float density = cloudDensity(point);
      if (density > 0.001) {
        float light = lightTransmittance(point);
        float phase = 0.55 + 0.45 * pow(max(dot(rayDirection, sunDirection), 0.0), 4.0);
        float extinction = density * stepSize * 11.0;
        float contribution = transmittance * (1.0 - exp(-extinction));
        scatteredLight += contribution * mix(vec3(0.58, 0.66, 0.78), vec3(1.0, 0.96, 0.84), light) * phase;
        transmittance *= exp(-extinction);
      }
    }
    float alpha = 1.0 - transmittance;
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(scatteredLight, alpha);
  }
`
