{
  "attributes": {
    "in_Position": -1,
    "in_Colour": -1,
    "in_ScreenSpaceOffset": -1
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
attribute vec3 in_Colour;
attribute vec2 in_ScreenSpaceOffset;

varying vec3 ex_Colour;
varying vec2 ex_FragTexCoord;

void main() {
  vec4 P = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  P.xy += in_ScreenSpaceOffset*1.0;
  gl_Position = projectionMatrix*P;
  ex_Colour = in_Colour;
  ex_FragTexCoord = step(in_ScreenSpaceOffset, vec2(0.0, 0.0));
}

//#fragment

precision lowp float;

varying vec3 ex_Colour;
varying vec2 ex_FragTexCoord;

void main() {
  float d = distance(ex_FragTexCoord, vec2(.5, .5));
  if (d > .5) discard;
  float a = 1.0;
  if (d < .45) a = .25;
  
  gl_FragColor = vec4(ex_Colour, a);
}
/*
void main() {
  float d = distance(ex_FragTexCoord, vec2(.5, .5));
  if (d > .5 || d < .3) discard;

  float a;
  if (d < 0.4) a = (d - .3) * 10.0;
  else a = 1. - ((d -.4)*10.);

  gl_FragColor = vec4(ex_Colour, a);
}

*/