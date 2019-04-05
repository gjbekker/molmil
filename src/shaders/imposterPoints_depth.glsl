{
  "attributes": {
    "in_Position": -1,
    "in_ScreenSpaceOffset": -1,
    "in_radius": -1
  },
  "uniforms": {
    "COR": -1,
    "modelViewMatrix": -1,
    "projectionMatrix": -1,
    "zNear": -1,
    "zFar": -1,
    "textureMap": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 COR;

attribute vec3 in_Position;
attribute float in_radius;
attribute vec2 in_ScreenSpaceOffset;

varying vec3 vertPos;

varying float radius;
varying float ex_atomFrustum;
varying float ex_showAtom;
varying vec2 ex_FragTexCoord;

varying mediump float normalizedDepth;

uniform float zNear;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  
  gl_Position.xy += in_ScreenSpaceOffset*in_radius;
  //gl_Position.z -= in_radius;
  
  vertPos = gl_Position.xyz / gl_Position.w;
  gl_Position = projectionMatrix  * gl_Position;
  radius = in_radius; 
  
  normalizedDepth = gl_Position.z / 2.0 + 0.5;
  
  //ex_atomFrustum = radius-abs(-vertPos.z-zNear);
  ex_atomFrustum = radius-abs(gl_Position.z+zNear);
  ex_showAtom = 1.0;
  //if (-vertPos.z < zNear) ex_showAtom = 0.0;
  if (gl_Position.z < -zNear) ex_showAtom = 0.0;
  if (ex_atomFrustum > radius) ex_atomFrustum = 0.0;
  else ex_atomFrustum /= radius*2.0;

  ex_FragTexCoord = step(in_ScreenSpaceOffset, vec2(0.0, 0.0));
}

//#fragment

#ifndef GL_FRAGMENT_PRECISION_HIGH
precision mediump float;
precision mediump int;
#else
precision highp float;
precision highp int;
#endif

varying vec3 vertPos;

varying float radius;
varying float ex_atomFrustum;
varying float ex_showAtom;
varying vec2 ex_FragTexCoord;

uniform float zFar;
uniform sampler2D textureMap;

const highp vec4 packFactors = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
const highp vec4 cutoffMask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);

const highp vec4 packFactors2 = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
const highp vec4 cutoffMask2  = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);

// this packing is not good enough...

varying mediump float normalizedDepth;

const lowp vec3 stepValues = vec3(2.0, 1.0, 0.0);

void main() {
  
  float d = distance(ex_FragTexCoord, vec2(.5, .5));
  if (d > .5) discard; // this is still rather slow...

  vec4 txt = texture2D(textureMap, 1.0-ex_FragTexCoord);
  
  highp float depth;
  
  if (ex_atomFrustum > 0.0 && d < ex_atomFrustum) {
    //depth = (-vertPos.z-(radius*txt.z)+(ex_atomFrustum*.0625))/zFar;
    depth = normalizedDepth - radius * txt.r;
    //depth = (-vertPos.z+(radius*(1.-txt.z))+(ex_atomFrustum*.0625))/zFar;
  }
  else {
    if (ex_showAtom == 0.0) discard;
    //depth = (-vertPos.z-(radius*txt.z))/zFar;
    depth = normalizedDepth - radius * txt.r;
    //depth = (-vertPos.z+(radius*(1.-txt.z)))/zFar;
  }
  
  //highp vec4 packedVal = vec4(fract(packFactors*depth));
  //gl_FragColor = packedVal - packedVal.xxyz*cutoffMask;
  
  //highp vec4 packedVal = vec4(fract(packFactors2*depth));
  //gl_FragColor = packedVal - packedVal.yzww*cutoffMask2;
  
  depth = depth * 3.0;
  lowp vec3 intDepthValue = vec3(depth) - stepValues;
  gl_FragColor = vec4(intDepthValue, 1.0);
  
  //gl_FragColor = vec4(ddd, ddd, ddd, 1.0);
  
}
