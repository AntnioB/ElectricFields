precision highp float;

varying float charge;

void main()
{
    if(charge>0.0){
        gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        if(pow(gl_PointCoord.x-0.5,2.0)+(pow(gl_PointCoord.y-0.5,2.0)) >= 0.25)
            discard;
        if(gl_PointCoord.y<0.6 &&  gl_PointCoord.y>0.4 && gl_PointCoord.x<0.8 && gl_PointCoord.x>0.2|| gl_PointCoord.x<0.6 && gl_PointCoord.x>0.4 && gl_PointCoord.y<0.8 && gl_PointCoord.y>0.2)
            discard;
    }
    else{
        gl_FragColor = vec4(0.0,1.0,0.0,1.0);
        if(pow(gl_PointCoord.x-0.5,2.0)+(pow(gl_PointCoord.y-0.5,2.0)) >= 0.25)
            discard;
        if(gl_PointCoord.y<0.6 &&  gl_PointCoord.y>0.4 && gl_PointCoord.x<0.8 && gl_PointCoord.x>0.2) 
            discard;

    }
}