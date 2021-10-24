attribute vec4 vPosition;
const int MAX_CHARGES=20;
const float KE = 8.988; 
const float GRID_SPACING= 0.05;
uniform float utable_width;
uniform float utable_height;
uniform vec2 uCharges[MAX_CHARGES];
uniform float uVCharges[MAX_CHARGES];
varying vec4 fColor;

#define TWOPI 6.28318530718

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.0);
}

float getLength(vec2 vector){
    return sqrt(vector.x*vector.x+vector.y*vector.y);
}

vec2 setLength(vec2 vector,float length){
    vector = normalize(vector);
    vector = vector * vec2(length,length);
    return vector;
}
vec2 calculateEfield(vec4 vPosition, vec2 chargeP,float vCharge){
    vec2 eField = vec2(0.0,0.0);
    eField.x= vPosition.x-chargeP.x;
    eField.y= vPosition.y-chargeP.y;
    float fieldV = KE * vCharge/(pow(eField.x,2.0) + pow(eField.y,2.0))/400.0;
    eField = setLength(eField,fieldV);
    return eField;
}

void main()
{
    vec2 eField= vec2(0.0,0.0);
    gl_PointSize=4.0;
    for(int i = 0; i<MAX_CHARGES;i++){
            eField = eField + calculateEfield(vPosition, uCharges[i],uVCharges[i]);
        }
    if(vPosition.z==0.0){
        gl_Position = vPosition/ vec4(utable_width/2.0, utable_height/2.0,1.0,1.0);
        fColor=vec4(0.0,0.0,0.0,1.0);
    }
    else{
        if(getLength(eField)>GRID_SPACING*5.0/utable_width) eField = setLength(eField,GRID_SPACING*5.0/utable_width);
        gl_Position = (vPosition + vec4(eField,0.0,0.0)) / vec4(utable_width/2.0, utable_height/2.0,1.0,1.0);
        gl_Position.z=0.0;
        fColor=colorize(eField);
    }
}