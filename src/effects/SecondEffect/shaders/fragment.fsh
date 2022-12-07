varying vec2 vUv;
varying vec3 pos;
varying vec3 norm;

uniform vec3 eyePos;

uniform float time;
uniform float travel;
uniform int width;
uniform int depth;

struct Material {
    float specularIntensity;
    float specularPower;
};

uniform Material material;

struct BaseLight {
    vec3 color;
    float ambientIntensity;
    float diffuseIntensity;
};

struct DirectionalLight {
    vec3 color;
    float ambientIntensity;
    vec3 direction;
    float diffuseIntensity;
};

uniform DirectionalLight directionalLight;

struct Attenuation {
    float constant;
    float linear;
    float exp;
};

struct PointLight {
    vec3 color;
    float ambientIntensity;
    float diffuseIntensity;
    vec3 position;
    Attenuation attenuation;
};

uniform PointLight pointLight;

uniform sampler2D lightNormalMap;

// Base light calculation
vec4 calcFromLightComponents(vec3 lightColor, float ambientIntensity, float diffuseIntensity, vec3 lightDirection, vec3 normal) {
    vec4 ambientColor = vec4(lightColor * ambientIntensity, 1.0);
    float diffuseFactor = max(dot(normal, -lightDirection), 0.0);
    vec4 diffuseColor = vec4(lightColor * diffuseIntensity * diffuseFactor, 1.0);
    vec3 vertexToEye = normalize(eyePos - pos);
    vec3 lightReflect = normalize(reflect(lightDirection, normal));
    float specularFactor = pow(max(dot(vertexToEye, lightReflect), 0.0), material.specularPower);
    vec4 specularColor = vec4(lightColor * material.specularIntensity * specularFactor, 1.0);
    return ambientColor + diffuseColor + specularColor;
}

// Directional light calculation
vec4 calcDirectionalLight(DirectionalLight light, vec3 normal) {
    return calcFromLightComponents(light.color, light.ambientIntensity, light.diffuseIntensity, light.direction, normal);
}

// Point light calculation
vec4 calcPointLight(PointLight light, vec3 normal) {
    vec3 lightDirection = normalize(pos - light.position);
    float distance = length(lightDirection);
    lightDirection = normalize(lightDirection);
    vec4 color = calcFromLightComponents(light.color, light.ambientIntensity, light.diffuseIntensity, lightDirection, normal);
    float attenuation = light.attenuation.constant + light.attenuation.linear * distance + light.attenuation.exp * distance * distance;
    return color / attenuation;
}

// Fog calculation
vec3 applyFog(  in vec3  color,         // original color of the pixel
                in float distance,      // camera to point distance
                in vec3  rayOri,        // camera position
                in vec3  rayDir ) {     // camera to point vector
    float a = 0.1; // in-scattering constant
    float b = 0.005; // extinction constant
    float fogAmount = a * exp(-rayOri.z * b)*(1.0 - exp(-distance * rayDir.z * b)) / rayDir.z;
    vec3  fogColor  = vec3(0, 0, 0);
    return mix(color, fogColor, fogAmount);
}

void main() {
//    vec3 accent = vec3(173.0, 254.0, 0.0);
    vec3 brown = normalize(vec3(51.0, 36.0, 25.0));
    vec4 tex = normalize(vec4(sqrt(float(depth) - pos.z) * 32.0, pos.z * 255.0, pos.y * 255.0, 0.0)) * (0.25 + pos.z / float(depth));

    tex = vec4(mix(tex.rgb, brown.rgb, 1.0 - norm.y), 1.0);

    vec4 sampled = texture2D(lightNormalMap, vec2(vUv.x, vUv.y + travel * 0.25));
    vec3 normal = normalize(sampled.xyz * 2.0 - 1.0);

    vec4 totalLight = calcDirectionalLight(directionalLight, normal);
    totalLight += calcPointLight(pointLight, normal);

    vec4 color = tex * totalLight;
    color = vec4(applyFog(color.rgb, length(eyePos - pos), eyePos, normalize(eyePos - pos)), 1.0);

    gl_FragColor = color;
}