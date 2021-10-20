uniform float utable_width;
uniform float utable_height;
attribute vec4 vPosition;
varying vec4 fColor;

void main()
{
    gl_PointSize=4.0;
    gl_Position = vPosition / vec4(utable_width/2.0, utable_height/2.0,1.0,1.0);
    fColor=gl_Position*0.5+0.5;
}