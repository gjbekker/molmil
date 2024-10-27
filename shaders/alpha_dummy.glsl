{
  "attributes": {
    "in_Position": -1,
    "in_Colour": -1
  },
  "uniforms": {
    "COR": -1,
    "modelViewMatrix": -1,
    "projectionMatrix": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 COR;

attribute vec3 in_Position;
attribute vec4 in_Colour;

varying float ex_alpha;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  gl_Position = projectionMatrix * gl_Position;
  gl_Position.z += 0.01;
  ex_alpha = in_Colour.a;
}

//#fragment

#ifndef GL_FRAGMENT_PRECISION_HIGH
precision mediump float;
precision mediump int;
#else
precision highp float;
precision highp int;
#endif

varying float ex_alpha;

void main() {
  if (ex_alpha == 0.0) discard;
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
