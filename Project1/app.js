import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'
import * as THREE from '../../libs/three.module.js'

/** @type {WebGLRenderingContext} */
let gl;

let program1;
let program2;
let vertices=[];
const table_width=3.0;
let table_height;
let verticesNum=0;
const grid_spacing= 0.05;
let charges=[];
let vCharges=[];
let chargesNum=0;
const MAX_CHARGES = 20;
const qCharge=1;
const KE = 8.988*Math.pow(10,9);
let opacity=1.0;

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");

    gl = UTILS.setupWebGL(canvas);

    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
    table_height = table_width*window.innerHeight/window.innerWidth;
    window.addEventListener("resize", function(event){
        //Event handler code
        canvas.setAttribute("width", window.innerWidth);
        canvas.setAttribute("height", window.innerHeight);
        table_height = table_width*window.innerHeight/window.innerWidth;
    })

    for(let x = -table_width/2+grid_spacing/2; x <= table_width/2+grid_spacing/2; x += grid_spacing) {
        for(let y = -table_height/2+grid_spacing/2; y <= table_height/2+grid_spacing/2; y += grid_spacing) {
            vertices.push(MV.vec3(randFloat(x-grid_spacing/5,x+grid_spacing/5),randFloat(y-grid_spacing/5,y+grid_spacing/5),0.0));
            verticesNum++;
            vertices.push(MV.vec3(x, y, 1.0));
            verticesNum++;
        }
    }

    program1 = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    program2 = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);
    
    gl.viewport(0, 0, canvas.clientWidth, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    
    window.addEventListener("click", function(event){
        if(chargesNum<MAX_CHARGES){
            let x = (-1+(2*event.offsetX/canvas.width))*table_width/2;
            let y = (-1+(2*(canvas.height-event.offsetY)/canvas.height))*table_height/2;
            if(event.shiftKey){
                charges.push(MV.vec2(x,y));
                chargesNum++;
                vCharges.push(-qCharge);
            }
            else{
                charges.push(MV.vec2(x, y));
                chargesNum++;
                vCharges.push(qCharge);
            }
        }
        else {}
    })

    window.addEventListener("keyup", function(event){
        if(event.keyCode==32){
            if(opacity==1.0)
                opacity=0.0;
            else
                opacity=1.0;
        }
    })
    
    window.requestAnimationFrame(animate);

}
function randFloat(low,high){
    return low + Math.random() * ( high - low );
}

function bufferInit(){
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,MV.flatten(vertices),gl.STATIC_DRAW);
    const vPosition = gl.getAttribLocation(program1,"vPosition");
    gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
}

function bufferInit2(){
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(charges),gl.STATIC_DRAW);
    //const vPosition= gl.getAttribLocation(program2,"vPosition");
    //gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    //gl.enableVertexAttribArray(vPosition);
}

function rotate(charge,value){
    let x = charge[0];
    let y = charge[1];
    let vcharge = new THREE.Vector2(x,y);
    vcharge.rotateAround(new THREE.Vector2(0,0),Math.PI/500*value);
    charge[0] = vcharge.getComponent(0);
    charge[1] = vcharge.getComponent(1);
    return charge;
}

function animate(time)
{
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //Grid
    bufferInit();
    gl.useProgram(program1);
    const dx1 = gl.getUniformLocation(program1,"utable_width");
    gl.uniform1f(dx1,table_width);
    const dx2 = gl.getUniformLocation(program1,"utable_height");
    gl.uniform1f(dx2,table_height);
    for(let i=0; i<chargesNum; i++) {
        const uCharges = gl.getUniformLocation(program1, "uCharges[" + i + "]");
        gl.uniform2fv(uCharges,MV.flatten(charges[i]));
        const uVCharges = gl.getUniformLocation(program1, "uVCharges[" + i + "]");
        gl.uniform1f(uVCharges,vCharges[i]);
    }
    gl.drawArrays(gl.LINES,0,verticesNum);

    //Charges
    bufferInit2();
    gl.useProgram(program2);
    const dx3 = gl.getUniformLocation(program2,"utable_width2");
    gl.uniform1f(dx3,table_width);
    const dx4 = gl.getUniformLocation(program2,"utable_height2");
    gl.uniform1f(dx4,table_height);
    for(let i = 0; i<chargesNum;i++){
        let rotation =rotate(charges[i],vCharges[i]); 
        var rotationL = gl.getUniformLocation(program2,"rotation");
        gl.uniform2fv(rotationL,rotation);
        if(opacity==1.0)
            gl.drawArrays(gl.POINTS,i,1);
    }
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag", "shader2.vert", "shader2.frag"]).then(s => setup(s));
