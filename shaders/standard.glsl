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
    "fogSpan": -1,
    "uniform_color": -1,
    "backgroundColor": -1,
    "slabNear": -1,
    "slabFar": -1,
    "slabColor": -1,
    "alpha": -1
  }
}
//#vertex

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 COR;

attribute vec3 in_Position;
attribute vec3 in_Normal;


#ifdef UNIFORM_COLOR
#ifdef ALPHA_MODE
uniform vec4 uniform_color;
#else
uniform vec3 uniform_color;
#endif

#else
attribute vec4 in_Colour;

#endif

varying vec4 ex_Colour;


varying vec3 ex_Normal;
varying vec3 vertPos;

varying float fogFactor;
varying float Pz;

uniform float focus;
uniform float fogSpan;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  
  vertPos = gl_Position.xyz / gl_Position.w;
  gl_Position = projectionMatrix * gl_Position;

#ifdef UNIFORM_COLOR
#ifdef ALPHA_MODE
  ex_Colour = uniform_color;
#else
  ex_Colour = vec4(uniform_color, 1.0);
#endif
#else
  ex_Colour = in_Colour;
#endif
  ex_Normal = normalMatrix * in_Normal;
  
  Pz = -vertPos.z;

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

varying vec4 ex_Colour;

#ifdef ALPHA_SET
uniform float alpha;
#endif

const vec3 lightPos = vec3(50.0,50.0,100.0);

varying float fogFactor;
varying float Pz;

uniform vec4 backgroundColor;

#ifdef ENABLE_SLAB
uniform float slabNear, slabFar;
#endif

#ifdef ENABLE_SLABCOLOR
  uniform vec4 slabColor;
#endif

void main() {
#ifdef TRANSPARENT_ONLY
  if (ex_Colour.a == 1.0) discard;
#endif
#ifdef OPAQUE_ONLY
  if (ex_Colour.a < 1.0) discard;
#endif

#ifdef ENABLE_SLAB
  if (Pz < slabNear || Pz > slabFar+1.0) discard; // later change the slabFar functionality to a more fog-like function..
#endif

  vec3 normal = normalize(ex_Normal);
  vec3 lightDir = normalize(lightPos - vertPos);
  
  float lambertian = clamp(dot(normal, lightDir), 0.0, 1.0);
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
  vec4 color = vec4(vec3(max(lambertian*ex_Colour.a, 0.2)), 1.0)*ex_Colour + vec4(specular, specular, specular, 0.0);
#elif defined(ALPHA_SET)
  vec4 color = vec4(max(lambertian, 0.2)*ex_Colour.rgb + specular, 1.0)*alpha;
#else
  if (ex_Colour.a == 0.0) discard;
  vec4 color = vec4(max(lambertian, 0.2)*ex_Colour.rgb + specular, 1.0);
#endif

#ifdef ENABLE_FOG
  gl_FragColor = mix(backgroundColor, color, fogFactor);
#else
  gl_FragColor = color;
#endif


#ifdef ENABLE_SLAB
  if (Pz > slabFar) gl_FragColor = mix(backgroundColor, color, clamp((slabFar+1.-Pz) / (1.0), 0.00, 1.0));
  
#ifdef ENABLE_SLABCOLOR
  if (gl_FrontFacing == false) gl_FragColor = slabColor;
#endif
  
#endif

#ifdef ALPHA_MODE
  gl_FragColor.a = 1.0 - pow(max(1.0-ex_Colour.a,0.0), 1.0/max(abs(normal.z),0.01));
#endif

#ifdef ALPHA_SET
  gl_FragColor.a = 1.0 - pow(max(1.0-alpha,0.0), 1.0/max(abs(normal.z),0.01));
# endif



 #ifdef ENABLE_SLABCOLOR
  if (gl_FrontFacing == false) gl_FragColor = slabColor;
 #endif

}
