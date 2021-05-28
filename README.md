# ICG - Gouraud e Phong shading

### José Felipe Nunes da silva - 20170019610
### Rebeca Raab Bias Ramos - 20170070453

## Introdução

Neste trabalho serão implementados e explicados os métodos de _shading_ de Gouraud e Phong. Os modelos de Iluminação, também chamados modelos de reflexão, são técnicas usadas para calcular a intensidade da cor de um ponto a ser exibido. A diferença entre os modelos citados é que, Gouraud calcula a iluminação para cada vértice da primitiva, na etapa de _lighting_ que fica entre o _transform_ e o _primitive Assembly_, onde são realizados os cálculos de iluminação por vértice, e em seguida na rasterização, são interpolados os valores de iluminação dos vértices, sendo esta etapa realizada no componente denominado _vertex shader_. E o modelo de Phong a iluminação é calculada para cada fragmento, diretamente no processo de rasterização, onde são interpolados os atributos e calculada a iluminação para cada fragmento, no componente gráfico chamado _fragment shader_.

Os métodos de _shading_ citados aplicam o mesmo modelo matemático para o cálculo da iluminação, dos vértices no Gouraud e dos fragmentos no Phong. Este modelo é constituído pela soma de três termos gerais: termo ambiente, termo difuso e termo especular. Este somatório resulta na intensidade da iluminação em um dado vértice ou fragmento.

Termo ambiente $\rightarrow I_{a}K_{a}$

Termo difuso $\rightarrow I_{p}K_{d}(L \cdot N)$

Termo especular $\rightarrow I_{p}K_{s}(R \cdot V)^n$

Dessa forma:
$I = I_{a}K_{a} + I_{p}K_{d}(L \cdot N) + I_{p}K_{s}(R \cdot V)^n$

Onde:

* $I$: intensidade (cor) final calculada para o vértice ou fragmento.
* $I_{a}$: intensidade da luz ambiente.
* $K_{a}$: coeficiente de reflectância ambiente.
* $I_{p}$: intensidade da luz pontual/direcional.
* $K_{d}$: coeficiente de reflectância difusa.
* $N$: vetor normal.
* $L$: vetor que aponta para a fonte de luz pontual/direcional.
* $K_{s}$: coeficiente de reflectância especular.
* $R$: reflexão de $L$ sobre $N$.
* $V$: vetor que aponta para a câmera.
* $n$: tamanho do brilho especular.

## Implementação

Foi proposta a implementação de um algoritmo capaz de realizar a renderização de uma malha de triângulos formando um objeto geométrico conhecido como torus. Inicialmente foi provido pelo professor um código fonte na linguagem de programação JavaScript, utilizando a biblioteca de computação gráfica `Three.js`, capaz de renderizar tal objeto na cor vermelha, sem efeitos de iluminação. 

O objetivo da implementação apresentada neste relatório é alterar esse código fonte inicial para que sejam aplicados os efeitos de iluminação sugeridos. Tais efeitos são reproduzidos ao adicionar ao algoritmo os modelos de iluminação, relexão e interpolação de Gouraud e Phong (Gouraud Shading e Phong Shading).

A figura abaixo apresenta o torus renderizado inicialmente utilizando o código fonte provido pelo professor.

<img src="https://imgur.com/drbR4GT.png" alt="torus sem shading"/>

Para obter o resultado acima, é aplicado ao objeto um efeito do qual todos os fragmentos recebem a mesma cor. No caso específico deste relatório, utilizando a linguagem de shader da biblioca `Three.js`, isso pode ser feito adicionando ao componente _vertex shader_ o seguinte código fonte:

```glsl
// 'I' : Variável que armazenará a cor final (i.e. intensidade) do vértice, após a avaliação do modelo local de iluminação.
//     A variável 'I' é do tipo 'varying', ou seja, seu valor será calculado pelo Vertex Shader (por vértice)
//     e será interpolado durante a rasterização das primitivas, ficando disponível para cada fragmento gerado pela rasterização.
varying vec4 I;

// Programa principal do Vertex Shader.

void main() {
    // 'position' : variável de sistema que contém a posição do vértice (vec3) no espaço do objeto.
    // 'P_cam_spc' : variável que contém o vértice (i.e. 'position') transformado para o Espaço de Câmera.
    //     Observe que 'position' é um vetor 3D que precisou ser levado para o espaço homogêneo 4D 
    //     (i.e., acrescentando-se uma coordenada adicional w = 1.0) para poder ser multiplicado pela
    //     matriz 'modelViewMatrix' (que é 4x4).
    
    vec4 P_cam_spc = modelViewMatrix * vec4(position, 1.0);

    I = vec4(1, 0, 0, 1);

    // 'gl_Position' : variável de sistema que conterá a posição final do vértice transformado pelo Vertex Shader.
    
    gl_Position = projectionMatrix * P_cam_spc;
}
```

Já ao _fragment shader_ é adicionado o seguinte código fonte:

```glsl
// 'I' : valor de cor originalmente calculada pelo Vertex Shader, e já interpolada para o fragmento corrente.

varying vec4 I;

// Programa principal do Fragment Shader.

void main() {

    // 'gl_FragColor' : variável de sistema que conterá a cor final do fragmento calculada pelo Fragment Shader.
    
    gl_FragColor = I;
}
```

Para realizar a tarefa proposta, é necessário realizar alterações e/ou adições nesses dois códigos fonte. No código fonte provido pelo professor são disponibilizados os valores dos termos constantes da modelagem, como a seguir:

```js
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
    Ip_position: {type: 'vec3', value: new THREE.Vector3(-20, 10, 10)},
    Ip_ambient_color: {type: 'vec3', value: new THREE.Color(0.3, 0.3, 0.3)},
    Ip_diffuse_color: {type: 'vec3', value: new THREE.Color(0.7, 0.7, 0.7)},
    k_a: {type: 'vec3', value: new THREE.Color(0.25, 0.25, 0.85)},
    k_d: {type: 'vec3', value: new THREE.Color(0.25, 0.25, 0.85)},
    k_s: {type: 'vec3', value: new THREE.Color(1, 1, 1)}
}
```

Utilizando tais informações são explicadas as 2 principais fases para a realização da tarefa proposta a seguir.

## Gouraud Shading

Será exibida nesta seção a estratégia de implementação do modelo de iluminação de Gouraud, que é aplicado em cada vértice da primitiva, ainda no processo de rasterização. Dito isso, sua implementação acontece no componente denominado _vertex shader_ e a intensidade de luz atribuída a cada vértice é interpolada no decorrer da primitiva. 

Quando aplicado aos vértices apenas o termo ambiente ($I_a K_a$) do modelo matemático de iluminação, o resultado é como a seguir.

<!-- ambiente -->
<img src="https://imgur.com/ynB8KFQ.png" alt="termo ambiente"/>

Nota-se que a iluminação ambiente não é capaz de determinar sombras, tendo em vista que utiliza para o cálculo apenas $I_{a}$ que é a intensidade da luz ambiente e o coeficiente de reflectância ambiente $K_{a}$, ambos RGB. 

Em termos de implementação, é necessário alterar a atribuição ao parâmetro `vec4 I` para `I = vec4((Ip_ambient_color.xyz * k_a.xyz), 1.0);`.

Com a aplicação exclusiva do termo difuso se tem o seguinte resultado:

<!-- difuso -->
<img src="https://imgur.com/UbNljS1.png" alt="termo difuso"/>

Pode-se notar que a iluminação difusa, transmite a figura um aspecto mais natural, já que confere mais tonalidades. Passando um efeito visual de profundidade e realce em algumas partes do objeto, sendo assim, com menos descontinuidades.

Para obter este efeito faz-se no código:

```glsl
float diffuse = max(0.0, dot(L_cam_spc, N_cam_spc));
I = vec4((Ip_diffuse_color.xyz * k_d.xyz), 1.0) * diffuse;
```

Já com a aplicação apenas do termpo especular da equação, obtem-se:

<!-- especular  -->
<img src="https://imgur.com/C6m0cZZ.png" alt="termo especular"/>

A iluminação especular produz um efeito de reflexão através da adição de brilho em alguns pontos do objeto. Dessa forma, confere a imagem final um efeito mais agradavel, tendo em vista que proporciona maior destaque aos pontos que recebem mais luz como em objetos reais.

A atribuição do termo especular é dada no código por:

```glsl
loat specular = pow(max(0.0, dot(-R_cam_spc, normalize(-vec3(P_cam_spc)))), expoent);
I += vec4((Ip_diffuse_color.xyz * k_s.xyz), 1.0) * specular;
```

As alterações acima foram realizadas no trecho do código fonte referente ao _vertex shader_. Combinadas elas produzem o efeito exibido a figura a seguir, e sua combinação se dá pelo somatório das componentes citadas, alterando o código para que tenha o seguinte aspecto:

```glsl
// termo ambiente
I = vec4((Ip_ambient_color.xyz * k_a.xyz), 1.0);

// termo difuso
float diffuse = max(0.0, dot(L_cam_spc, N_cam_spc));
I += vec4((Ip_diffuse_color.xyz * k_d.xyz), 1.0) * diffuse;

// termo especular
float specular = pow(max(0.0, dot(-R_cam_spc, normalize(-vec3(P_cam_spc)))), expoent);
I += vec4((Ip_diffuse_color.xyz * k_s.xyz), 1.0) * specular;

```

Este resultado é interpolado para cada fragmento da primitiva, este processo se dá automaticamente ao declarar o vetor de intensidade da luz como `varying` e utilizá-lo no _vertex_ e _fragment shader_.

O resultado do cálculo de itensidade e interpolação resulta na figura abaixo.

<img src="https://imgur.com/IlytkMD.png" alt="gouraud"/>

Pode-se notar na imagem mostrada acima que, o cálculo da iluminação para um vértice ou ponto que se interpola na rasterização pode causar um efeito indesejado, pois pode deixar a imagem menos natural com a iluminação com efeito borrado. Porém, vale ressaltar que a aplicação do Gouraud exige um menor custo computacional, tendo em vista que, por exemplo, uma forma geométrica como um triângulo possui três vértices, mas pode ser dividida em vários fragmentos. Isso pode ser uma vantagem em relação ao modelo de Phong que será detalhado a seguir.

## Phong Shading

Este modelo como mencionado no tópico anterior propõe o cálculo da iluminação para os fragmentos, dessa forma, impoe um efeito mais natural e realista a imagem produzida.

<img src="https://imgur.com/kNOjOD7.png" alt="phong"/>

Como pode-se notar na imagem a iluminação tem um efeito visual mais agradavel que a produzida pelo modelo de Gouraud, entretanto como mencionado este modelo possui um custo computacional mais alto. Logo, deve-se levar em consideração a finalidade para a escolha mais adequada do modelo.

## Dificuldades e Possíveis Melhoras

Um das dificuldades encontradas foi a utilização da linguagem de shader para a implementação dos modelos de iluminação que dificultou a visualização dos resultados no processo de debug do código.

Uma melhora implementada em nosso trabalho foi a adição da possibilidade de trocar o shader utilizado, em tempo de execução, ao pressionar a tecla `p` do teclado. 

## Referências