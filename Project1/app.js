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
let vCharges=[];
let chargesNum=0;
const MAX_CHARGES = 20;
const qCharge=1;
const KE = 8.988*Math.pow(10,9);

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

function rotate(time, charge){
    let x = charge[0];
    let y = charge[1];
    let radius = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
    return [Math.cos(time/1000)*(radius),Math.sin(time/1000)*(radius)];
}

function calculateEF(vertice){
    let eField=0;
    let xVertice= vertice[0];
    let yVertice = vertice[1];
    for(let i = 0; i<chargesNum;i++){
        let xCharge = charges[i][0];
        let yCharge= charges[i][1];
        let r = Math.sqrt(Math.pow(xVertice-xCharge,2)+Math.pow(yVertice-yCharge,2));
        eField = eField + KE*vCharges[i]/(r*r);
    }
    return eField;
}

function animate(time)
{
    bufferInit();
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //Grid
    gl.useProgram(program1);
    const dx1 = gl.getUniformLocation(program1,"utable_width");
    gl.uniform1f(dx1,table_width);
    const dx2 = gl.getUniformLocation(program1,"utable_height");
    gl.uniform1f(dx2,table_height);
    for(let i = 0; i <verticesNum;i++){
        const eField = gl.getUniformLocation(program1,"eField");
        gl.uniform1f(eField, calculateEF(vertices[i]));
        gl.drawArrays(gl.POINTS,i,1);
    }

    //Charges
    bufferInit2();
    gl.useProgram(program2);
    const dx3 = gl.getUniformLocation(program2,"utable_width2");
    gl.uniform1f(dx3,table_width);
    const dx4 = gl.getUniformLocation(program2,"utable_height2");
    gl.uniform1f(dx4,table_height);
    for(let i = 0; i<chargesNum;i++){
        let rotation =rotate(time, charges[i]); 
        var rotationL = gl.getUniformLocation(program2,"rotation");
        gl.uniform2fv(rotationL,rotation);
        gl.drawArrays(gl.POINTS,i,1);
    }
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag", "shader2.vert", "shader2.frag"]).then(s => setup(s));
