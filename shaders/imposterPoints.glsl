{
  "attributes": {
    "in_Position": -1,
    "in_Colour": -1, 
    "in_ScreenSpaceOffset": -1,
    "in_radius": -1
  },
  "uniforms": {
    "COR": -1,
    "modelViewMatrix": -1,
    "projectionMatrix": -1,
    "normalMatrix": -1,
    "focus": -1,
    "fogSpan": -1,
    "uniform_color": -1,
    "backgroundColor": -1,
    "slabNear": -1,
    "slabFar": -1,
    "zNear": -1,
    "zFar": -1,
    "zInvDiff": -1,
    "zNearInv": -1, 
    "textureMap": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 COR;

attribute vec3 in_Position;
attribute float in_radius;
attribute vec2 in_ScreenSpaceOffset;


#ifdef UNIFORM_COLOR
#ifdef ALPHA_MODE
uniform vec4 uniform_color;
varying vec4 ex_Colour;
#else
uniform vec3 uniform_color;
varying vec3 ex_Colour;
#endif

#else
#ifdef ALPHA_MODE
attribute vec4 in_Colour;
varying vec4 ex_Colour;
#else
attribute vec3 in_Colour;
varying vec3 ex_Colour;
#endif

#endif


varying vec3 vertPos;

varying float fogFactor;

uniform float focus;
uniform float fogSpan;

varying float showAtom;
varying float radius;
varying float ex_atomFrustum;
varying float ex_showAtom;
varying vec2 ex_FragTexCoord;

uniform float zNear;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  
  gl_Position.xy += in_ScreenSpaceOffset*in_radius;
  
  vertPos = gl_Position.xyz / gl_Position.w;
  gl_Position = projectionMatrix  * gl_Position;
  radius = in_radius; 
  
  ex_atomFrustum = radius-abs(gl_Position.z+zNear);
  ex_showAtom = 1.0;
  if (gl_Position.z < -(zNear+radius)) ex_showAtom = 0.0;
  if (ex_atomFrustum > radius) ex_atomFrustum = 0.0;
  else ex_atomFrustum /= radius*2.0;
  
  ex_FragTexCoord = step(in_ScreenSpaceOffset, vec2(0.0, 0.0));
  
#ifdef UNIFORM_COLOR
  ex_Colour = uniform_color;
#else
  ex_Colour = in_Colour;
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

varying vec3 ex_Normal;
varying vec3 vertPos;

#ifdef ALPHA_MODE
varying vec4 ex_Colour;
#else
varying vec3 ex_Colour;
#endif

const vec3 lightPos = vec3(50.0,50.0,100.0);

varying float fogFactor;
varying float Pz;

uniform vec4 backgroundColor;

#ifdef ENABLE_SLAB
uniform float slabNear, slabFar;
#endif

varying float showAtom;
varying float radius;
varying float ex_atomFrustum;
varying float ex_showAtom;
varying vec2 ex_FragTexCoord;

uniform float zFar;
uniform sampler2D textureMap;

uniform float zNearInv;
uniform float zInvDiff;

void main() {
#ifdef ENABLE_SLAB
  if (Pz < slabNear || Pz > slabFar+1.0) discard; // later change the slabFar functionality to a more fog-like function..
#endif

  float d = distance(ex_FragTexCoord, vec2(.5, .5));
  if (d > .5) discard;

  if (d < ex_atomFrustum) {
    gl_FragColor = vec4(ex_Colour, 1.0);
    gl_FragDepthEXT = 0.0;
  }
  else {
    if (ex_showAtom == 0.0) discard;
    
    vec4 txt = texture2D(textureMap, 1.0-ex_FragTexCoord);
    float depth = (-vertPos.z-(radius*txt.z));
    
    gl_FragColor = vec4(max(txt.x, 0.2)*ex_Colour + txt.y, 1.0);
    
    gl_FragDepthEXT = ((1./depth)-zNearInv) * zInvDiff;
    
  }
}
