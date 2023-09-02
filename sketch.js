// Importação das classes e funções da biblioteca Matter.js
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Body = Matter.Body;
const Composites = Matter.Composites;
const Composite = Matter.Composite;

// Declaração das variáveis globais
let engine; // Mecanismo de física Matter.js
let world; // Mundo onde a física ocorre
var rope, fruit, ground; // Variáveis para corda, fruta e chão
var fruit_con; // Conexão entre a corda e a fruta
var fruit_con_2; // Segunda conexão entre a corda e a fruta
var fruit_con_3; // Terceira conexão entre a corda e a fruta
var rope3; // Terceira corda

var bg_img; // Imagem de fundo do jogo
var food; // Imagem da fruta
var rabbit; // Imagem do coelho

var button, button2, button3; // Botões para cortar a corda
var bunny; // Representação do coelho
var blink, eat, sad; // Animações para o coelho
var mute_btn; // Botão de som mudo

var fr; // Taxa de quadros por segundo (FPS)

var bk_song; // Som de fundo do jogo
var cut_sound; // Som de corte da corda
var sad_sound; // Som de tristeza do coelho
var eating_sound; // Som de comer a fruta
var air; // Som de ar soprando
var canW; // Largura do canvas
var canH; // Altura do canvas

function preload() {
  // Pré-carrega imagens e sons necessários para o jogo
  bg_img = loadImage('background.png');
  food = loadImage('melon.png');
  rabbit = loadImage('Rabbit-01.png');

  bk_song = loadSound('sound1.mp3');
  sad_sound = loadSound("sad.wav")
  cut_sound = loadSound('rope_cut.mp3');
  eating_sound = loadSound('eating_sound.mp3');
  air = loadSound('air.wav');

  blink = loadAnimation("blink_1.png", "blink_2.png", "blink_3.png");
  eat = loadAnimation("eat_0.png", "eat_1.png", "eat_2.png", "eat_3.png", "eat_4.png");
  sad = loadAnimation("sad_1.png", "sad_2.png", "sad_3.png");

  blink.playing = true;
  eat.playing = true;
  sad.playing = true;
  sad.looping = false;
  eat.looping = false;
}

function setup() {
  // Configuração inicial do jogo
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    canW = displayWidth;
    canH = displayHeight;
    createCanvas(displayWidth + 80, displayHeight);
  } else {
    canW = windowWidth;
    canH = windowHeight;
    createCanvas(windowWidth, windowHeight);
  }
  frameRate(80);

  bk_song.play();
  bk_song.setVolume(0.5);

  engine = Engine.create();
  world = engine.world;

  // Criação do botão 1
  button = createImg('cut_btn.png');
  button.position(20, 30);
  button.size(50, 50);
  button.mouseClicked(drop);

  // Criação do botão 2
  button2 = createImg('cut_btn.png');
  button2.position(330, 35);
  button2.size(60, 60);
  button2.mouseClicked(drop2);

  // Criação do botão 3
  button3 = createImg('cut_btn.png');
  button3.position(360, 200);
  button3.size(60, 60);
  button3.mouseClicked(drop3);

  // Criação do botão de som mudo
  mute_btn = createImg('mute.png');
  mute_btn.position(450, 20);
  mute_btn.size(50, 50);
  mute_btn.mouseClicked(mute);

  // Criação das cordas
  rope = new Rope(8, { x: 40, y: 30 });
  rope2 = new Rope(7, { x: 370, y: 40 });
  rope3 = new Rope(4, { x: 400, y: 225 });

  // Criação do chão
  ground = new Ground(200, canH, 600, 20);
  blink.frameDelay = 20;
  eat.frameDelay = 20;

  // Criação do coelho e configuração das animações
  bunny = createSprite(170, canH - 80, 100, 100);
  bunny.scale = 0.2;
  bunny.addAnimation('blinking', blink);
  bunny.addAnimation('eating', eat);
  bunny.addAnimation('crying', sad);
  bunny.changeAnimation('blinking');

  // Criação da fruta e adição ao mundo Matter.js
  fruit = Bodies.circle(300, 300, 20);
  Matter.Composite.add(rope.body, fruit);

  // Criação das conexões entre a corda e a fruta
  fruit_con = new Link(rope, fruit);
  fruit_con_2 = new Link(rope2, fruit);
  fruit_con_3 = new Link(rope3, fruit);

  rectMode(CENTER);
  ellipseMode(RADIUS);
  textSize(50)
}

function draw() {
  // Função principal de desenho e lógica do jogo
  background(51);
  image(bg_img, 0, 0, displayWidth + 80, displayHeight);

  push();
  imageMode(CENTER);
  if (fruit != null) {
    image(food, fruit.position.x, fruit.position.y, 70, 70);
  }
  pop();

  rope.show();
  rope2.show();
  rope3.show();

  Engine.update(engine);
  ground.show();

  drawSprites();

  if (collide(fruit, bunny) == true) {
    bunny.changeAnimation('eating');
    eating_sound.play();
  }

  if (fruit != null && fruit.position.y >= 650) {
    bunny.changeAnimation('crying');
    bk_song.stop();
    sad_sound.play();
    fruit = null;
  }
}

function drop() {
  // Função para soltar o primeiro pedaço de corda
  cut_sound.play();
  rope.break();
  fruit_con.detach();
  fruit_con = null;
}

function drop2() {
  // Função para soltar o segundo pedaço de corda
  cut_sound.play();
  rope2.break();
  fruit_con_2.detach();
  fruit_con_2 = null;
}

function drop3() {
  // Função para soltar o terceiro pedaço de corda
  cut_sound.play();
  rope3.break();
  fruit_con_3.detach();
  fruit_con_3 = null;
}

function collide(body, sprite) {
  // Função para verificar se houve colisão entre a fruta e o coelho
  if (body != null) {
    var d = dist(body.position.x, body.position.y, sprite.position.x, sprite.position.y);
    if (d <= 80) {
      World.remove(engine.world, fruit);
      fruit = null;
      return true;
    } else {
      return false;
    }
  }
}

function mute() {
  // Função para controlar o som de fundo do jogo (mute/unmute)
  if (bk_song.isPlaying()) {
    bk_song.stop();
  } else {
    bk_song.play();
  }
}
