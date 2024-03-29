uniform float utable_width2;
uniform float utable_height2;
attribute float vCharge;
uniform vec2 rotation;
varying float charge;

void main()
{
    gl_PointSize=25.0;
    gl_Position =vec4(rotation,0.0,1.0) / vec4(utable_width2/2.0,utable_height2/2.0,1.0,1.0);
    charge = vCharge;
}