import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

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
let chargesNum=0;
let vBuffer;
const maxChargeNum = 20;

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
            vertices.push(MV.vec2(x, y));
            verticesNum++;
        }
    }

    program1 = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    program2 = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);
    
    gl.viewport(0, 0, canvas.clientWidth, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    
    window.addEventListener("click", function(event){
        if(chargesNum<maxChargeNum){
            let x = (-1+(2*event.offsetX/canvas.width))*table_width/2;
            let y = (-1+(2*(canvas.height-event.offsetY)/canvas.height))*table_height/2;
            charges.push(MV.vec2(x, y));
            chargesNum++;
        }
        else {}
    })
    
    window.requestAnimationFrame(animate);

}

function bufferInit(){
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,MV.flatten(vertices),gl.STATIC_DRAW);
    const vPosition = gl.getAttribLocation(program1,"vPosition");
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
}

function bufferInit2(){
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(charges),gl.STATIC_DRAW);
    const vPosition= gl.getAttribLocation(program2,"vPosition");
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
}

function animate(time)
{
    bufferInit();
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);

    window.addEventListener("click", function(event){
        if(chargesNum<maxChargeNum){
            let x = (-1+(2*event.offsetX/canvas.width))*table_width/2;
            let y = (-1+(2*(canvas.height-event.offsetY)/canvas.height))*table_height/2;
            charges.push(MV.vec2(x, y));
            chargesNum++;
        }
        else {}
    })
    
    //Grid
    gl.useProgram(program1);
    const dx1 = gl.getUniformLocation(program1,"utable_width");
    gl.uniform1f(dx1,table_width);
    const dx2 = gl.getUniformLocation(program1,"utable_height");
    gl.uniform1f(dx2,table_height);
    gl.drawArrays(gl.POINTS,0,verticesNum);

    //Charges
    bufferInit2();
    gl.useProgram(program2);
    const dx3 = gl.getUniformLocation(program1,"utable_width2");
    gl.uniform1f(dx3,table_width);
    const dx4 = gl.getUniformLocation(program1,"utable_height2");
    gl.uniform1f(dx4,table_height);
    gl.drawArrays(gl.POINTS,0,chargesNum);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag", "shader2.vert", "shader2.frag"]).then(s => setup(s));
