let paleta;
let caos = 0;
let caminantes = [];
let cantidad = 5; 
let velocidadOndaGlobal = 0.04; 

window.modoSistema = "LIBRE"; 

let capaLineas; 
let tiempoUltimoBorrado = 0;
let intervaloBorrado = 50000; 

// Variables de audio
let mic;
let fft;
let audioIniciado = false;
let ultimoCambioGrosor = 0; // Para evitar que se tilde por exceso de cambios

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

  // Solo analizamos si el audio realmente se inicializó con éxito
  if (audioIniciado && mic && fft) {
    fft.analyze();
    
    let graves = fft.getEnergy("bass");
    let agudos = fft.getEnergy(2, 1500);
    let volumen = mic.getLevel(); 

    // Monitor en pantalla para calibrar
    push();
    fill(0);
    textSize(16);
    text("Graves (OOOO): " + int(graves), 20, 30);
    text("Soplido (ffff): " + int(agudos), 20, 50); 
    text("Volumen (Grito): " + volumen.toFixed(3), 20, 70);

    // 1. REINICIO POR GRITO (Volumen alto)
    if (volumen > 0.45) {
      reiniciarObraPorVoz();
    } 
    // 2. CAMBIO DE GROSOR POR "IIII" AGUDO
    // Controlamos que pase al menos 200ms entre cambios para que no sature
    else if (agudos > 10 && millis() - ultimoCambioGrosor > 200) { 
      cambiarGrosorPorVoz();
      ultimoCambioGrosor = millis();
    }
    // 3. INTERACTIVIDAD DE GRAVES "OOOO"
    else if (graves > 30) { 
      velocidadOndaGlobal = 0.01; 
      fill(255, 0, 0);
      text("GRAVE ACTIVADO", 20, 90); 
    }
    pop();
  }

  // Actualizar y mover caminantes
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

  // Cartel guía de inicio
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

// Flujo nativo de p5.js estricto para activar entrada de audio
function mousePressed() {
  if (!audioIniciado) {
    userStartAudio().then(() => {
      mic = new p5.AudioIn();
      mic.start(() => {
        // La FFT se crea e vincula INMEDIATAMENTE después de que el mic da el OK
        fft = new p5.FFT();
        fft.setInput(mic);
        audioIniciado = true;
        console.log("Micrófono y FFT en línea.");
      });
    }).catch(e => console.error("Error al iniciar audio: ", e));
  }
}

// Única declaración de Paleta en este archivo
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