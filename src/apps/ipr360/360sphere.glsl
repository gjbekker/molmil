{
  "attributes": {
    "in_Normal": -1
  },
  "uniforms": {
    "modelViewMatrix": -1,
    "projectionMatrix": -1,
    "radius": -1,
    "textureMap": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float radius;

attribute vec3 in_Normal;
varying vec3 ex_Normal;

void main() {
  vec3 pos = in_Normal*radius;
  pos.x = -pos.x;
  gl_Position = projectionMatrix * modelViewMatrix* vec4(pos, 1.0);
  ex_Normal = in_Normal;
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

uniform sampler2D textureMap;

const float PI = 3.1415926535897932384626433832795;

#ifdef PICKING_MODE
vec4 encodeFloat16(float x, float y) {
	vec4 color;
	color.r = floor(x / 255.0);
  color.g = x-(color.r*255.0);
  color.b = floor(y / 255.0);
  color.a = y-(color.b*255.0);
	return color/255.0;
}
#endif

void main() {
  vec3 normal = normalize(ex_Normal);
  float u = 1.0 - (0.5 + (atan(normal.z, normal.x)/(2.0*PI)));
  float v = 1.0 - (0.5 - (asin(normal.y)/PI));
#ifdef PICKING_MODE
  gl_FragColor = encodeFloat16(u*65535.0, (1.0-v)*65535.0);
#else
  gl_FragColor = texture2D(textureMap, vec2(u, v));
#endif
}
