{
  "attributes": {
    "in_Position": -1,
    "in_ID": -1
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
attribute float in_ID;
varying float ex_ID;

void main() {
  vec4 P = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  gl_Position = projectionMatrix*P;
  gl_PointSize = 500.0/-P.z;
  ex_ID = in_ID;
}

//#fragment

precision mediump float;

//const float PRECISION = 16581375.;
const float PRECISION = 4228250625.;

varying float ex_ID;

const vec4 bit_shift = vec4(255.0*255.0*255.0, 255.0*255.0, 255.0, 1.0);
const vec4 bit_mask  = vec4(0.0, 1.0/255.0, 1.0/255.0, 1.0/255.0);

vec4 pack_float(const in float var) {
  vec4 res = fract(var * bit_shift);
  res -= res.xxyz * bit_mask;
  return res;
}

void main() {
  if (ex_ID == 0.) discard;
  gl_FragColor = pack_float(ex_ID/PRECISION);
}