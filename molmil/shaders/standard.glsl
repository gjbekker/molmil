{
  "attributes": {
    "in_Position": -1,
    "in_Colour": -1, 
    "in_Normal": -1
  },
  "uniforms": {
    "COR": -1,
    "modelViewMatrix": -1,
    "projectionMatrix": -1,
    "normalMatrix": -1,
    "focus": -1,
    "fogSpan": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 COR;

attribute vec3 in_Position;
attribute vec3 in_Normal;

#ifdef ALPHA_MODE
attribute vec4 in_Colour;
varying vec4 ex_Colour;
#else
attribute vec3 in_Colour;
varying vec3 ex_Colour;
#endif

varying vec3 ex_Normal;
varying vec3 vertPos;

varying float fogFactor;

uniform float focus;
uniform float fogSpan;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  
  vertPos = gl_Position.xyz / gl_Position.w;
  gl_Position = projectionMatrix * gl_Position;

  ex_Colour = in_Colour;
  ex_Normal = normalMatrix * in_Normal;
  
#ifdef ENABLE_FOG
  fogFactor = clamp((fogSpan - -vertPos.z) / (fogSpan - focus), 0.05, 1.0);
#endif
}

//#fragment

#ifndef GL_FRAGMENT_PRECISION_HIGH
precision mediump float;
precision mediump int;
#else
precision highp float;
precision highp int;
#endif

varying vec3 ex_Normal;
varying vec3 vertPos;

#ifdef ALPHA_MODE
varying vec4 ex_Colour;
#else
varying vec3 ex_Colour;
#endif

const vec3 lightPos = vec3(50.0,50.0,100.0);

varying float fogFactor;

const vec4 backgroundColor = vec4(0.0, 0.0, 0.0, 1.0);

void main() {
  vec3 normal = normalize(ex_Normal);
  vec3 lightDir = normalize(lightPos - vertPos);
  vec3 lightDir2 = lightPos - vertPos;

  float lambertian = min(max(dot(normal, lightDir), 0.0), 1.0);
  float specular = 0.0;
  
#ifndef DISABLE_SPECULAR
  if (lambertian > 0.0) {
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 viewDir = normalize(-vertPos);

    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    specular = pow(specAngle, 16.0)*.5;
  }
#endif
  
#ifdef ALPHA_MODE
  vec4 color = vec4(vec3(max(lambertian, 0.2)), 1.0)*ex_Colour + vec4(specular, specular, specular, 1.0);
#else
  vec4 color = vec4(max(lambertian, 0.2)*ex_Colour + specular, 1.0);
#endif

#ifdef ENABLE_FOG
  gl_FragColor = mix(backgroundColor, color, fogFactor);
#else
  gl_FragColor = color;
  //gl_FragColor = vec4(normalize(vertPos), 1.0);
#endif
}
