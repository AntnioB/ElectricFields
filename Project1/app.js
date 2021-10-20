import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;

let program;
let vertices=[];
//let colors=[];
const table_width=3.0;
let table_height;
let verticesNum=0;
const grid_spacing= 0.05;
let charges=[];
let chargesNum=0;

const maxChargeNum = 20;

function animate(time)
{
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const dx1 = gl.getUniformLocation(program, "utable_width");
    gl.uniform1f(dx1, table_width);

    const dx2 = gl.getUniformLocation(program, "utable_height");
    gl.uniform1f(dx2, table_height);

    gl.drawArrays(gl.POINTS,0,verticesNum+chargesNum);
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");

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

    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    gl.viewport(0, 0, canvas.clientWidth, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program,"vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(vPosition);
    
    window.addEventListener("click", function(event){
        let x = (-1+(2*event.offsetX/canvas.width))*table_width/2;
        let y = (-1+(2*(canvas.height-event.offsetY)/canvas.height))*table_height/2;
        charges.push(MV.vec2(x, y));
        chargesNum++;
        const chargeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, chargeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, (verticesNum+maxChargeNum)*8, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0 ,MV.flatten(vertices));
        gl.bufferSubData(gl.ARRAY_BUFFER, verticesNum*8, MV.flatten(charges));
        const vPosition2 = gl.getAttribLocation(program,"vPosition");
        gl.vertexAttribPointer(vPosition2, 2, gl.FLOAT, false, 0,0);
        gl.enableVertexAttribArray(vPosition2);
    })
    
    window.requestAnimationFrame(animate);

}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
