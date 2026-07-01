class Caminante {
  // --- MODIFICADO: Ahora recibe la capa como tercer parámetro ---
  constructor(paleta, velocidadInicial, capaGrafica) {
    this.paleta = paleta;
    this.capa = capaGrafica; // Guardamos la referencia a la capa
    
    this.t = 4.5;       
    this.vel = 2.5; 
    
    // Mantenemos la vida alta para asegurar que crucen y mueran afuera
    this.vidaMax = 600; 
    this.vidaActual = this.vidaMax;
    this.colorBase = this.paleta.darColor();

    this.anguloOnda = random(TWO_PI);
    this.velocidadOnda = velocidadInicial;
    this.grosorObjetivo = this.t; 
    
    // 55% de probabilidad de línea desordenada
    this.tipoLinea = random(1) < 0.55 ? "DESORDENADA" : "NORMAL";
    this.ruidoDesorden = random(1000); 

    // Llamamos a resetear para inicializar posición y dirección siempre afuera
    this.resetear();
  }

  dibujar() {
    if (brightness(this.colorBase) < 7) {
       this.colorBase = this.paleta.darColor();
    }
    let alpha = map(this.vidaActual, 0, this.vidaMax, 0, 255);
    let c = color(red(this.colorBase), green(this.colorBase), blue(this.colorBase), alpha);
    
    this.capa.stroke(c);

    if (this.tipoLinea === "DESORDENADA") {
      let variacionTextura = noise(this.ruidoDesorden) * 1.6 - 0.8;
      this.capa.strokeWeight(max(0.5, this.t + variacionTextura)); 
      this.ruidoDesorden += 0.05;
    } else {
      this.capa.strokeWeight(this.t); 
    }
    
    this.capa.line(this.px, this.py, this.x, this.y); 
    
    this.px = this.x;
    this.py = this.y;
  }

  mover(caos) {
    this.t = lerp(this.t, this.grosorObjetivo, 0.05);
    this.vidaActual -= 1;

    let fuerzaGiro;

    if (this.tipoLinea === "DESORDENADA") {
      let baseGiro = noise(this.x * 0.006, this.y * 0.006, this.anguloOnda);
      fuerzaGiro = map(baseGiro, 0, 1, -0.12, 0.12);
      fuerzaGiro *= lerp(1, 2, caos);
    } else {
      if (this.velocidadOnda === 0.01) {
        fuerzaGiro = sin(this.anguloOnda) * 0.025; 
      } else {
        fuerzaGiro = sin(this.anguloOnda) * lerp(0.01, 0.03, caos);
      }
    }
    
    this.dir += fuerzaGiro;
    this.anguloOnda += this.velocidadOnda;

    this.x += this.vel * cos(this.dir);
    this.y += this.vel * sin(this.dir);

    if (this.vidaActual <= 0 || this.x > width + 80 || this.x < -80 || this.y > height + 80 || this.y < -80) {
      this.resetear();
    }
  }

  resetear() {
    let margen = 50; 
    this.colorBase = this.paleta.darColor();
    this.anguloOnda = random(TWO_PI);
    this.vidaActual = this.vidaMax; 

    this.tipoLinea = random(1) < 0.55 ? "DESORDENADA" : "NORMAL";
    this.ruidoDesorden = random(1000);

    // --- REESTRUCTURADO: Clonamos tu lógica original exacta pero forzando los nacimientos AFUERA ---
    if (modoSistema !== "LIBRE") {
      let suerte = random(1);
      
      if (suerte < 0.70) {
        if (modoSistema === "VERTICAL") {
          this.estadoEje = "VERTICAL";
          this.x = random(margen, width - margen);
          if (random(1) < 0.5) {
            this.y = -20; // Reemplazado para nacer afuera arriba
            this.dir = HALF_PI + random(-QUARTER_PI, QUARTER_PI);       
          } else {
            this.y = height + 20; // Reemplazado para nacer afuera abajo
            this.dir = (HALF_PI * 3) + random(-QUARTER_PI, QUARTER_PI);   
          }
        } else if (modoSistema === "HORIZONTAL") {
          this.estadoEje = "HORIZONTAL";
          this.y = random(margen, height - margen);
          if (random(1) < 0.5) {
            this.x = -20; // Reemplazado para nacer afuera a la izquierda
            this.dir = random(-QUARTER_PI, QUARTER_PI);             
          } else {
            this.x = width + 20; // Reemplazado para nacer afuera a la derecha
            this.dir = PI + random(-QUARTER_PI, QUARTER_PI);            
          }
        }
      } else {
        // El 30% restante del modo micrófono: bordes aleatorios, pero nacen afuera
        this.estadoEje = "ALEATORIO";
        let ladoAleatorio = floor(random(4));
        if (ladoAleatorio === 0) { this.x = -20; this.y = random(height); }
        else if (ladoAleatorio === 1) { this.x = width + 20; this.y = random(height); }
        else if (ladoAleatorio === 2) { this.x = random(width); this.y = -20; }
        else { this.x = random(width); this.y = height + 20; }
        this.dir = random(TWO_PI); 
      }
    } else {
      // --- MODO LIBRE: Tu petición original (60% bordes organizados, 40% totalmente aleatorios, siempre afuera) ---
      let probabilidadOrigen = random(1);

      if (probabilidadOrigen < 0.60) {
        this.estadoEje = "BORDE";
        let cualBorde = floor(random(4));

        if (cualBorde === 0) {
          this.x = -20; this.y = random(margen, height - margen);
          this.dir = random(-QUARTER_PI, QUARTER_PI); 
        } else if (cualBorde === 1) {
          this.x = width + 20; this.y = random(margen, height - margen);
          this.dir = PI + random(-QUARTER_PI, QUARTER_PI); 
        } else if (cualBorde === 2) {
          this.x = random(margen, width - margen); this.y = -20;
          this.dir = HALF_PI + random(-QUARTER_PI, QUARTER_PI); 
        } else {
          this.x = random(margen, width - margen); this.y = height + 20;
          this.dir = (HALF_PI * 3) + random(-QUARTER_PI, QUARTER_PI); 
        }
      } else {
        this.estadoEje = "LIBRE_AFUERA";
        let ladoAleatorio = floor(random(4));
        if (ladoAleatorio === 0) { this.x = -20; this.y = random(height); }
        else if (ladoAleatorio === 1) { this.x = width + 20; this.y = random(height); }
        else if (ladoAleatorio === 2) { this.x = random(width); this.y = -20; }
        else { this.x = random(width); this.y = height + 20; }
        this.dir = random(TWO_PI); 
      }
    }

    // Sincronizamos las posiciones previas para que no dibuje una línea cruzando la pantalla al nacer
    this.px = this.x;
    this.py = this.y;
  }

  cambiarGrosor(g) {
    this.grosorObjetivo = g;
  }
  
  cambiarCurvatura(nuevaVelocidad) {
    this.velocidadOnda = nuevaVelocidad;
  }
}