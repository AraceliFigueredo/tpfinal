let paleta;
let caos = 0;
let caminantes = [];
let cantidad = 5; 
let velocidadOndaGlobal = 0.04; 

window.modoSistema = "LIBRE"; 

let capaLineas; 
let tiempoUltimoBorrado = 0;
let intervaloBorrado = 50000; 


let mic;
let fft;
let audioIniciado = false;
let ultimoCambioGrosor = 0; 

function preload() {
  let imagenPaleta = loadImage('img/paleta.png');
  paleta = new Paleta(imagenPaleta);
}

function setup() {
  createCanvas(800, 600);
  background(255);
  
  capaLineas = createGraphics(800, 600);
  capaLineas.strokeWeight(3); 
  
  for (let i = 0; i < cantidad; i++) {
    caminantes.push(new Caminante(paleta, velocidadOndaGlobal, capaLineas));
  }
  
  tiempoUltimoBorrado = millis(); 
}

function draw() {
  background(255); 
  velocidadOndaGlobal = 0.04;

  
  if (audioIniciado && mic && fft) {
    fft.analyze();
    
    let graves = fft.getEnergy("bass");
    let agudos = fft.getEnergy(2, 1500);
    let volumen = mic.getLevel(); 

    
    push();
    fill(0);
    textSize(16);
    text("Graves (OOOO): " + int(graves), 20, 30);
    text("Soplido (ffff): " + int(agudos), 20, 50); 
    text("Volumen (Grito): " + volumen.toFixed(3), 20, 70);

    if (volumen > 0.45) {
      reiniciarObraPorVoz();
    } 
    
    else if (agudos > 10 && millis() - ultimoCambioGrosor > 200) { 
      cambiarGrosorPorVoz();
      ultimoCambioGrosor = millis();
    }
    
    else if (graves > 30) { 
      velocidadOndaGlobal = 0.01; 
      fill(255, 0, 0);
      text("GRAVE ACTIVADO", 20, 90); 
    }
    pop();
  }

  
  for (let c of caminantes) {
    c.cambiarCurvatura(velocidadOndaGlobal);
  }
  
  if (millis() - tiempoUltimoBorrado > intervaloBorrado) {
    capaLineas.clear(); 
    tiempoUltimoBorrado = millis(); 
  }

  let caos = random(1); 
  for (let c of caminantes) {
    c.mover(caos);
    c.dibujar(); 
  }
  
  image(capaLineas, 0, 0);

  
  if (!audioIniciado) {
    push();
    fill(0, 150);
    rect(0, 0, width, 30);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Hacé un CLIC en la pantalla para activar el micrófono", width / 2, 15);
    pop();
  }
}

function reiniciarObraPorVoz() {
  background(255); 
  capaLineas.clear();
  if (window.modoSistema === "LIBRE" || window.modoSistema === "HORIZONTAL") {
    window.modoSistema = "VERTICAL";
  } else {
    window.modoSistema = "HORIZONTAL";
  }
  for (let c of caminantes) {
    c.resetear();
  }
  console.log("Obra reiniciada.");
}

function cambiarGrosorPorVoz() {
  let nuevoGrosor = random(1, 7);
  capaLineas.strokeWeight(nuevoGrosor);
  for (let c of caminantes) {
    c.cambiarGrosor(nuevoGrosor);
  }
  console.log("Grosor cambiado por agudo: " + nuevoGrosor);
}


function mousePressed() {
  if (!audioIniciado) {
    userStartAudio().then(() => {
      mic = new p5.AudioIn();
      mic.start(() => {
        
        fft = new p5.FFT();
        fft.setInput(mic);
        audioIniciado = true;
        console.log("Micrófono y FFT en línea.");
      });
    }).catch(e => console.error("Error al iniciar audio: ", e));
  }
}


class Paleta {
  constructor(imagen) {
    this.imagen = imagen;
  }
  darColor() {
    let x = int(random(this.imagen.width));
    let y = int(random(this.imagen.height));
    return this.imagen.get(x, y);
  }
}