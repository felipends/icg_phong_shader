// Criação do objeto Three.js que armazenará os dados da cena.
let scene = new THREE.Scene();

// Definição da câmera do Three.js
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;

// A câmera é adicionada a cena.
scene.add(camera);

// Criação do objeto Three.js responsável por realizar o rendering.
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Criação do objeto de controle (interação) da câmera.
let controls = new THREE.OrbitControls(camera, renderer.domElement);

//----------------------------------------------------------------------------
// 'geometry' : Variável que contém a geometria (informação sobre vértices
//     e arestas) do objeto a ser renderizado (um torus, neste caso). É importante 
//     observar que, de acordo com o Three.js, a geometria de um objeto não contém
//     ainda a informação sobre o seu material.
//----------------------------------------------------------------------------
let geometry = new THREE.TorusGeometry(10, 3, 16, 25);

//----------------------------------------------------------------------------
// Variáveis do tipo "uniform", enviadas pela CPU aos shaders :
//
// * 'Ip_position' : posição da fonte de luz pontual no Espaço do Universo.
// * 'Ip_ambient_color' : cor do componente ambiente da fonte de luz pontual.
// * 'Ip_diffuse_color' : cor do componente difuso da fonte de luz pontual.
// * 'k_a' : coeficiente de reflectância ambiente do objeto.
// * 'k_d' : coeficiente de reflectância difusa do objeto.
// * 'k_s' : coeficiente de reflectância especular do objeto.
//----------------------------------------------------------------------------
let rendering_uniforms = {
    Ip_position: { type: 'vec3', value: new THREE.Vector3(-20, 10, 10) },
    Ip_ambient_color: { type: 'vec3', value: new THREE.Color(0.3, 0.3, 0.3) },
    Ip_diffuse_color: { type: 'vec3', value: new THREE.Color(0.7, 0.7, 0.7) },
    k_a: { type: 'vec3', value: new THREE.Color(0.25, 0.25, 0.85) },
    k_d: { type: 'vec3', value: new THREE.Color(0.25, 0.25, 0.85) },
    k_s: { type: 'vec3', value: new THREE.Color(1, 1, 1) },
    expoent: { type: 'float', value: 16.0 },

}

//----------------------------------------------------------------------------
// Criação do material na forma de um Vertex Shader e um Fragment Shader customizados.
// Os shaders receberão valores da CPU (i.e. variáveis do tipo 'uniform') por meio da
// variável 'rendering_uniforms'.
//----------------------------------------------------------------------------
let material = new THREE.ShaderMaterial({
    uniforms: rendering_uniforms,
    vertexShader: '',
    fragmentShader: ''
});

const shaders = {
    'gouraud': {
        vertex: gouraudVertexShader,
        fragment: gouraudFragmentShader
    },
    'phong': {
        vertex: phongVertexShader,
        fragment: phongFragmentShader
    },
}

let selectedShader = shaders['phong'];

//----------------------------------------------------------------------------
// Vertex Shader
//----------------------------------------------------------------------------
material.vertexShader = selectedShader.vertex;

//----------------------------------------------------------------------------
// Fragment Shader
//----------------------------------------------------------------------------
material.fragmentShader = selectedShader.fragment;

//----------------------------------------------------------------------------
// 'object_mesh' : De acordo com o Three.js, um 'mesh' é a geometria acrescida do material.
//----------------------------------------------------------------------------
var object_mesh = new THREE.Mesh(geometry, material);
scene.add(object_mesh);

//----------------------------------------------------------------------------
// 'render()' : Função que realiza o rendering da cena a cada frame.
//----------------------------------------------------------------------------
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

// Chamada da função de rendering.

document.addEventListener('keypress', (event) => {
    const keyName = event.key;
    if (keyName === 'p') {
        selectedShader = selectedShader === shaders['gouraud'] ? shaders['phong'] : shaders['gouraud'];
        material.vertexShader = selectedShader.vertex;
        material.fragmentShader = selectedShader.fragment;
        material.needsUpdate = true;

        if(selectedShader === shaders['gouraud']){
            alert("Gouraud shader selected");
        } else {
            alert("Phong shader selected");
        }
    }
});


render();