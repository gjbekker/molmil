{
  "attributes": {
    "in_Normal": -1
  },
  "uniforms": {
    "modelViewMatrix": -1,
    "projectionMatrix": -1,
    "radius": -1,
    "textureMap": -1,
    "rooms_r1_squared_inv": -1,
    "rooms_r2_squared_inv": -1,
    "rooms_x": -1,
    "rooms_y": -1,
    "rooms_id": -1
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

uniform float rooms_x[ROOM_SIZE];
uniform float rooms_y[ROOM_SIZE];
uniform float rooms_r1_squared_inv[ROOM_SIZE];
uniform float rooms_r2_squared_inv[ROOM_SIZE];
uniform int rooms_id[ROOM_SIZE];

void main() {
  float dx, dy, r;
  vec3 normal = normalize(ex_Normal);
  float u = 1.0 - (0.5 + (atan(normal.z, normal.x)/(2.0*PI)));
  float v = 0.5 - (asin(normal.y)/PI);

#ifdef PICKING_MODE
  vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
#else
  vec4 color = texture2D(textureMap, vec2(u, 1.0-v));
#endif

  // now, deal with periodicity...
  for (int d=0; d<ROOM_SIZE; d++) {
    dx = abs(u-rooms_x[d]);
    dy = abs(v-rooms_y[d]);
    if (dx > .5) dx = 1.-dx;
    if (dy > .5) dy = 1.-dy;
    r = (dx*dx)*rooms_r1_squared_inv[d] + (dy*dy)*rooms_r2_squared_inv[d];
    if (r <= 1.0) {
#ifdef PICKING_MODE
      color = vec4(1.0/255.0,rooms_id[d]/255, 1.0, 1.0);
#else
      //if (r > 0.9) color.rgb = vec3(0.0, 0.0, 0.0);
      //else 
      color.rgb += 0.1;
#endif
      break;
    }
  }
  gl_FragColor = color;
}
