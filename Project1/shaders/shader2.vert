uniform float utable_width;
uniform float utable_height;
attribute vec4 vPosition;

void main()
{
    gl_PointSize=20.0;
    gl_Position = vPosition / vec4(utable_width/2.0, utable_height/2.0,1.0,1.0);
}