const canvas = document.querySelector('canvas') //selecionando o canvas
const ctx = canvas.getContext('2d') //adicionando o contexto de 2d

const score = document.querySelector('.score--value') //selecionar o span do score-value
const finalScore = document.querySelector('.final-score > span') //selecionar o span dentro do final.score
const menu = document.querySelector('.menu-screen') // selecionar o menu
const buttonPlay = document.querySelector('.btn-play')

const audio = new Audio('../assets/audio.mp3') //audio de comer 

const size = 30 //tamanho padrão

let snake = [ // array da cobra
    {x: 270, y: 240}, //as posições iniciais dever ser multiplas de 30
    {x: 300, y: 240},
]

const incrementScore = () => { //função para encrementar o score
    score.innerText = parseInt(score.innerText) + 10
}

const randomNumber = (min, max) => { //gerar numeros aleatorios
    return Math.round(Math.random() * (max - min) + min)
}

const randomPos = () => { //gerar numeros aleatorios
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30 //transforma o numero em um multiplo de 30 pra caber dentro dos grids de quadrados na tela
}

const randomColor = () => {
    return `rgb(${randomNumber(0, 255)}, ${randomNumber(0, 255)}, ${randomNumber(0, 255)})` //retorna um rgb aleatório
}

const food = {
    x: randomPos(), //posição aleatória
    y: randomPos(), //posição aleatória
    color: randomColor() //cor aleatória
}

let direction, loopId


const drawFood = () => { //função para desenhar a comida

    const {x, y, color} = food //desestruturando o objeto

    ctx.fillStyle = color //define a cor do retangulo da comida
    ctx.shadowColor = color //define a cor da combra
    ctx.shadowBlur = 6 //define a força da sombra
    ctx.fillRect(x, y, size, size) //desenhar o retangulo da comida
    ctx.shadowBlur = 0 //zerar o blur após desenhar a comida pra n afetar o resto do grid
}

const drawSnake = () => { //função para desenhar a cobra na tela
    ctx.fillStyle = '#ddd' //preenchendo a cor
    
    snake.forEach((position, index) => { //percorrendo todo o array

        if(index == snake.length - 1) { //verificando se é o ultimo quadrado
            ctx.fillStyle = 'white' //mudando a cor da "cabeça" da cobra
        }

        ctx.fillRect(position.x, position.y, size, size) //desenhando o retangulo em questão
    })
}

const moveSnake = () => {

    if (!direction) return //se não tiver nenhuma direção ele pula a função

    const head = snake[snake.length - 1] //selecionando o ultimo elemento (cabeça)

    snake.shift() //remove o primeiro elemento do array

    if(direction == 'right') {
        snake.push({x: head.x + size, y: head.y}) //adicionando um novo elemento sizePx mais a direita
    }

    if(direction == 'left') {
        snake.push({x: head.x - size, y: head.y}) //adicionando um novo elemento sizePx mais a esquerda
    }

    if(direction == 'down') {
        snake.push({x: head.x, y: head.y + size}) //adicionando um novo elemento sizePx mais a abaixo
    }

    if(direction == 'up') {
        snake.push({x: head.x, y: head.y - size}) //adicionando um novo elemento sizePx mais a acima
    }
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#191919'

    for (let i = 30; i < canvas.width; i += 30) {

        //linhas verticais
        ctx.beginPath() //inicio 
        ctx.lineTo(i, 0) // começar a desenhar do I até o 600
        ctx.lineTo(i, 600)
        ctx.stroke() //desenhar na tela


        //linhas horizontais
        ctx.beginPath() //inicio 
        ctx.lineTo(0, i) // começar a desenhar do 600 até o I
        ctx.lineTo(600, i)
        ctx.stroke() //desenhar na tela
    }
}

const checkEat = () => { //verifica se comeu a comida
    const head = snake[snake.length - 1] //pegando a cabeça da cobra

    if(head.x == food.x && head.y == food.y) { //verificando se a cabeça e a comida estão nas mesmas coordenadas
        snake.push(head) //adiciona a comida na largura da cobra
        audio.play() //tocar o som de comer
        incrementScore() // aumentar o score

        //cria duas posições aleatórias
        let x = randomPos()
        let y = randomPos()

        while (snake.find((position) => position.x == x && position.y == y)) { //se alguma das posições estiverem localizadas dentro da cobra até encontrar x e y possiveis
            x = randomPos()
            y = randomPos()
        }

        //atualizar os valores
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

const checkCollision = () => { //verifica as colisões
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length-2 // pega o index do bloco atrás da cabeça

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit //verifica se a cobrinha bateu em algum canto da tela

    const selfCollision = snake.find((position, index) => { //verifica se a cobra bateu nela mesma ignorando a cabeça
        return index < neckIndex && position.x == head.x && position.y == head.y
    })


    if (wallCollision || selfCollision) { // se colidiu com ela mesma ou com a parede
        gameOver() // chama a função de game over
    }
 
}

const gameOver = () => { //função de game over
    direction = undefined // impede a cobra de andar
    menu.style.display = 'flex' //mostrar o menu
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(4px)"

}

const gameLoop = () => { //loop principal do jogo

    clearInterval(loopId) //limpando o interval para evitar bugs

    ctx.clearRect(0, 0, 600, 600) //limpando a tela do canvas
    drawGrid() //desenhar o grid
    drawFood() //desenhando a comida
    moveSnake() //desenha a cobra
    drawSnake() //move a cobra
    checkEat() //checa se comeu a comida e aumenta o tamanho da cobra
    checkCollision() //checa a colisão

    loopId = setTimeout(() => {
        gameLoop() //chama a função pra sempre
    }, 100);
}


gameLoop() //inicia o gameLoop

document.addEventListener("keydown", (Event) => {  //adicionando um evento listener para capturar as teclas e definir a direção
    if(Event.key == "ArrowRight" && direction != 'left') { 
        direction = 'right' 
    }

    if(Event.key == "ArrowLeft"  && direction != 'right') {
        direction = 'left'
    }

    if(Event.key == "ArrowDown"  && direction != 'up') {
        direction = 'down'
    }

    if(Event.key == "ArrowUp"  && direction != 'down') {
        direction = 'up'
    }
})

buttonPlay.addEventListener("click", () => {
    score.innerText = '00' //zerar o score
    menu.style.display = 'none' //esconder a tela de game over
    canvas.style.filter = 'none' //retirar o blur

    snake = [ // array da cobra
    {x: 270, y: 240}, //as posições iniciais dever ser multiplas de 30
    {x: 300, y: 240},
]
})


