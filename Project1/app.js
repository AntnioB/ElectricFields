import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;

let program;
let vertices=[];
let colors=[];
const table_width=3.0;
let table_height;
let verticesNum=0;
const grid_spacing= 0.05;
let charges=[];

function animate(time)
{
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const dx1 = gl.getUniformLocation(program, "utable_width");
    gl.uniform1f(dx1, table_width);

    const dx2 = gl.getUniformLocation(program, "utable_height");
    gl.uniform1f(dx2, table_height);

    

    gl.drawArrays(gl.POINTS,0,verticesNum);
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

    window.addEventListener("click", function(event){
        let x = 2*event.offsetX/canvas.width-1;
        let y = 2*(canvas.height-event.offsetY)/canvas.height-1;
        charges.push(MV.vec2(x, y))
    })

    for(let x = -table_width/2+grid_spacing/2; x <= table_width/2+grid_spacing/2; x += grid_spacing) {
        for(let y = -table_height/2+grid_spacing/2; y <= table_height/2+grid_spacing/2; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
            let red = -x/(table_width/2+grid_spacing/2)*0.5+0.5;
            let green = x/(table_width/2+grid_spacing/2)*0.5+0.5
            let blue = y/(table_height/2+grid_spacing/2)*0.5+0.5;
            colors.push(MV.vec4( red, green, blue,1.0));
            verticesNum++;
        }
    }

    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    gl.viewport(0, 0, canvas.clientWidth, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program,"vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(vPosition);
    
    const cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(colors), gl.STATIC_DRAW);

    const vColor = gl.getAttribLocation(program,"vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    const chargeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, chargeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(charges), gl.STATIC_DRAW);
    
    window.requestAnimationFrame(animate);

}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
