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
    "textureMap": -1,
    "point_depth": -1,
    "viewWidth": -1,
    "viewHeight": -1
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


varying mediump vec3 normalizedViewCoordinate;

uniform float zNear;

void main() {
  gl_Position = vec4(modelViewMatrix * vec4(in_Position, 1.0))-vec4(COR, 0.0);
  
  gl_Position.xy += in_ScreenSpaceOffset*in_radius;
  
  vertPos = gl_Position.xyz / gl_Position.w;
  gl_Position = projectionMatrix  * gl_Position;
  radius = in_radius; 
  
  normalizedViewCoordinate = (gl_Position.xyz / 2.0) + 0.5;
  
  //ex_atomFrustum = radius-abs(-vertPos.z-zNear);
  ex_atomFrustum = radius-abs(gl_Position.z+zNear);
  ex_showAtom = 1.0;
  //if (-vertPos.z < zNear) ex_showAtom = 0.0;
  if (gl_Position.z < -zNear) ex_showAtom = 0.0;
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

varying mediump vec3 normalizedViewCoordinate;

uniform float zFar;
uniform sampler2D textureMap;
uniform sampler2D point_depth;

uniform int viewWidth, viewHeight;

const vec4 unpackFactors = vec4( 1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0 );
const vec4 unpackFactors2 = vec4( 1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));

const mediump float oneThird = 1.0 / 3.0;

void main() {
#ifdef ENABLE_SLAB
  if (Pz < slabNear || Pz > slabFar+1.0) discard; // later change the slabFar functionality to a more fog-like function..
#endif

  float d = distance(ex_FragTexCoord, vec2(.5, .5));
  if (d > .5) discard;
  
  vec4 txt = texture2D(textureMap, 1.0-ex_FragTexCoord);
  vec2 texcoord = gl_FragCoord.xy / vec2(viewWidth, viewHeight); 
  vec4 depthVal = texture2D(point_depth, texcoord);

  highp float depth;
  
  if (ex_atomFrustum > 0.0 && d < ex_atomFrustum) {
    //depth = (-vertPos.z-(radius*txt.z)+(ex_atomFrustum*.0625))/zFar;
    
    depth = normalizedViewCoordinate.z - radius * txt.z;
    
  }
  else {
    if (ex_showAtom == 0.0) discard;
    //depth = (-vertPos.z-(radius*txt.z))/zFar;
    depth = normalizedViewCoordinate.z - radius * txt.z;
  }
  
  //if (depth < dot(depthVal,unpackFactors)) discard;
  //if (depth < dot(depthVal,unpackFactors2)) discard;
  
  //depth = dot(depthVal,unpackFactors);
  float previousDepthValue = (depthVal.r + depthVal.g + depthVal.b) * oneThird;
  float alphaComponent = step((depth - 0.004), previousDepthValue);
  
  
  //gl_FragColor = vec4(depth, depth, depth, 1.);
  
  vec3 normal = normalize(txt.xyz * 2.0 - 1.0);
  vec3 lightDir = normalize(lightPos - vertPos);
  float lambertian = clamp(dot(normal, lightDir), 0.0, 1.0);
  float specular = 0.0;
  if (lambertian > 0.0) {
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 viewDir = normalize(-vertPos);

    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    specular = pow(specAngle, 16.0)*.5;
  }
  
  gl_FragColor = vec4(max(lambertian, 0.2)*ex_Colour + specular, 1.0);
  
  //gl_FragColor = vec4(ex_Colour, 1.);
  //gl_FragColor = depthVal;
  
  
  //(0,1)  (1,1)
  //(0,0)  (1,0)
  
  /*
  if (ex_atomFrustum > 0.0 && d < ex_atomFrustum) {
    gl_FragDepthEXT = (-vertPos.z-(radius*txt.z)+(ex_atomFrustum*.0625))/zFar;
    gl_FragColor = vec4(ex_Colour, 1);
  }
  else {
    if (ex_showAtom == 0.0) discard;
    gl_FragDepthEXT = (-vertPos.z-(radius*txt.z))/zFar;
    
    vec3 normal = normalize(txt.xyz * 2.0 - 1.0);
    
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
    vec4 color = vec4(vec3(lambertian), 1.0)*ex_Colour + vec4(specular, specular, specular, 0.0);
#else
    vec4 color = vec4(max(lambertian, 0.2)*ex_Colour + specular, 1.0);
#endif


//color = vec4(normal, 1.0);

#ifdef ENABLE_FOG
    gl_FragColor = mix(backgroundColor, color, fogFactor);
#else
    gl_FragColor = color;
#endif


#ifdef ENABLE_SLAB
    if (Pz > slabFar) gl_FragColor = mix(backgroundColor, color, clamp((slabFar+1.-Pz) / (1.0), 0.00, 1.0));
#endif

#ifdef ALPHA_MODE
    gl_FragColor.a = 1.0 - pow(max(1.0-ex_Colour.a,0.0), 1.0/max(abs(normal.z),0.01));
#endif
   
  }
   */

  //gl_FragDepthEXT = P.z + (txt.z*radius);
}
