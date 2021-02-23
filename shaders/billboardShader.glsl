{
  "attributes": {
    "in_Position": -1,
    "in_ScreenSpaceOffset": -1
  },
  "uniforms": {
    "COR": -1,
    "modelViewMatrix": -1,
    "projectionMatrix": -1,
    "normalMatrix": -1,
    "focus": -1,
    "fogSpan": -1,
    "backgroundColor": -1,
    "slabNear": -1,
    "slabFar": -1,
    "textureMap": -1,
    "sizeOffset": -1,
    "positionOffset": -1,
    "scaleFactor": -1,
    "renderMode": -1,
    "disableFog": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 COR;

uniform vec2 sizeOffset;
uniform vec3 positionOffset;
uniform int renderMode;

uniform float scaleFactor;

attribute vec3 in_Position;
attribute vec2 in_ScreenSpaceOffset;

varying float fogFactor;
varying float Pz;

uniform float focus;
uniform float fogSpan;

varying float showAtom;
varying float radius;
varying float ex_atomFrustum;
varying float ex_showAtom;
varying vec2 ex_FragTexCoord;

uniform float zNear;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR-positionOffset, 0.0);

  vec3 delta = vec3(in_ScreenSpaceOffset*sizeOffset, 0.0)*scaleFactor*length(gl_Position);
 
  if (renderMode == 1) {
    vec3 z = -gl_Position.xyz;
    vec4 u = vec4(0.0, 1.0, 0.0, 1.0);
    vec3 x = normalize(cross(u.xyz, z));
    vec3 y = normalize(cross(z, x));
    mat3 m = mat3(x, y, vec3(0.0, 0.0, 1.0));
    gl_Position += vec4(m * delta, 0.0);
  }
  else gl_Position.xyz += delta;
  
  vec3 vertPos = gl_Position.xyz / gl_Position.w;
  gl_Position = projectionMatrix * gl_Position;
  
  ex_FragTexCoord = (in_ScreenSpaceOffset+1.0)*.5;
  
#ifdef ENABLE_SLAB
  Pz = -vertPos.z;
#endif

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

varying float fogFactor;
varying float Pz;

#ifdef ENABLE_SLAB
uniform float slabNear, slabFar;
#endif

#ifdef ENABLE_FOG
uniform bool disableFog;
#endif

varying vec2 ex_FragTexCoord;

uniform sampler2D textureMap;
uniform vec4 backgroundColor;

void main() {
#ifdef ENABLE_SLAB
  if (Pz < slabNear || Pz > slabFar+1.0) discard; // later change the slabFar functionality to a more fog-like function..
#endif

  vec4 fragColor = texture2D(textureMap, ex_FragTexCoord);

#ifdef ENABLE_FOG
  if (fragColor.a > 0.0 && ! disableFog) gl_FragColor = mix(backgroundColor, fragColor, fogFactor);
  else gl_FragColor = fragColor;
#else
  gl_FragColor = fragColor;
#endif

#ifdef ENABLE_SLAB
  if (Pz > slabFar) gl_FragColor = mix(backgroundColor, fragColor, clamp((slabFar+1.-Pz) / (1.0), 0.00, 1.0));
#endif
}
