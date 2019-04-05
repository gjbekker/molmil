{
  "attributes": {
    "in_Position": -1
  },
  "uniforms": {
    "stereoLeft": -1,
    "stereoRight": -1
  }
}
//#vertex

attribute vec2 in_Position;

varying highp vec2 textureCoord;

const vec2 madd=vec2(0.5,0.5);

void main() {
  gl_Position = vec4(in_Position, 0.0, 1.0);
  textureCoord = in_Position*madd+madd;
}

//#fragment

precision highp float;

uniform sampler2D stereoLeft;
uniform sampler2D stereoRight;

varying highp vec2 textureCoord;


void main() {
	vec4 leftFrag = texture2D(stereoLeft, textureCoord);
	leftFrag = vec4(1.0, leftFrag.g, leftFrag.b, 1.0);
	vec4 rightFrag = texture2D(stereoRight, textureCoord);
	rightFrag = vec4(rightFrag.r, 1.0, 1.0, 1.0);
	gl_FragColor = vec4(leftFrag.rgb * rightFrag.rgb, 1.0); 
}
