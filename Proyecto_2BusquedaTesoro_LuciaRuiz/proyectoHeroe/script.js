'use strict';
//Cogemos todos los elementos que tenemos creados en el HTML
document.addEventListener("DOMContentLoaded", inicio);
function inicio(){
const tabla = document.getElementById("tabla");
const dadoDiv = document.getElementById("dado");
const tirarDadoBtn = document.getElementById("tirarDadoBtn");
const formulario = document.getElementById("miFormulario");
const introducirNombreBtn = document.getElementById("introducirNombreBtn");
const nombreInput = document.getElementById("nombreInput");
const mensajeNombre = document.getElementById("mensajeNombre");
const jugarBtn = document.getElementById("jugarBtn");
const mensajeBienvenida = document.getElementById("mensajeBienvenida");

//Creacion del constructor para los dos elementos 
function Elemento(x, y) {
    this.x = x;
    this.y = y;
}
// Crea el héroe con valores (0, 0)
let heroe = new Elemento(0, 0);  
// Crea el tesoro con valores (9, 9)
let tesoro = new Elemento(9, 9);  

//Crea las variables donde se almacenara donde esta el heroe y el tesoro
let celdaHeroe;
let celdaTesoro;

//Variables de control del codigo
let movimientoPermitido = false;
let dadoTirado = false;

//Contador de tiradas
let tiradasJugador = 0;

// Inicializar récord
if (!localStorage.getItem('record')) {
    localStorage.setItem('record', Infinity);
}
// Mostrar el récord inicial
actualizarVistaRecord();  

// Función para validar el nombre
function validarNombre() {
    const nombre = nombreInput.value;
    //Expresión regular para controlar la longitud y tipo de caracteres.
    if (!/^.{4,}$/.test(nombre)) {
        mensajeNombre.textContent = "El nombre debe tener 4 o más letras.";
        mensajeNombre.style.color = "red";
        return false;
    }
    //Expresión regular para no permitir que haya números.
    if (/\d/.test(nombre)) {
        mensajeNombre.textContent = "Números no permitidos.";
        mensajeNombre.style.color = "red";
        return false;
    }
    // Mensaje limpio si es válido
    mensajeNombre.textContent = "";  
    return true;
}

// Evento para el botón "Introducir nombre"
formulario.addEventListener("submit", function (event) {
        event.preventDefault();  
    if (validarNombre()) {
        mensajeBienvenida.textContent = `¡Lleva a Topacio al tesoro héroe: ${nombreInput.value}!`;
        jugarBtn.style.display = "inline-block";  // Mostrar el botón "Jugar"
        introducirNombreBtn.disabled = true;     // Deshabilitar el botón "Introducir nombre"
        nombreInput.disabled = true;             // Deshabilitar el campo de nombre
    }
});

// Evento para el botón "Jugar"
jugarBtn.addEventListener("click", function () {
    generarTablero();  // Generar el tablero
    jugarBtn.style.display = "none";  // Esconder el botón "Jugar"
    tirarDadoBtn.style.display = "inline-block";  // Mostrar el botón "Tirar Dado"
    dadoDiv.style.display = "inline-block";  // Mostrar el dado
    document.getElementById("contenedor-inicial").style.display = "none";  // Ocultar el formulario
    recordActual.style.display = 'block';
});

// Generar la tabla con la posición inicial del héroe y el tesoro
function generarTablero() {
    for (let i = 0; i < 10; i++) {
        let fila = document.createElement("tr");
        for (let j = 0; j < 10; j++) {
            let celda = document.createElement("td");
            celda.id = `celda-${i}-${j}`;
            celda.classList.add("celda", "suelo"); 
            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }

    // Colocar el héroe
    celdaHeroe = document.getElementById(`celda-${heroe.x}-${heroe.y}`);
    let divHeroe = document.createElement("div");
    divHeroe.classList.add("heroe"); // Clase del héroe activo
    celdaHeroe.appendChild(divHeroe); // Posición inicial del héroe

    // Colocar el tesoro
    celdaTesoro = document.getElementById(`celda-${tesoro.x}-${tesoro.y}`);
    let divTesoro = document.createElement("div");
    divTesoro.classList.add("tesoro");
    celdaTesoro.appendChild(divTesoro);

}

// Función para tirar el dado y mover al héroe
function tirarDado() {
    if (dadoTirado) return;  // Si ya se ha tirado el dado, no hacer nada

    const numTirada = Math.floor(Math.random() * 6) + 1;  // Número aleatorio entre 1 y 6
    dadoDiv.textContent = numTirada;  // Mostrar el resultado en el dado
    resaltarMovimientos(numTirada);  // Resaltar celdas donde el héroe puede moverse
    movimientoPermitido = true; // Permitir el movimiento después de tirar el dado
    dadoTirado = true; // Bloquear el botón de tirar dado hasta que el héroe se mueva
}

// Evento para el botón "Tirar Dado"
tirarDadoBtn.addEventListener("click", function () {
    tirarDado();
    tiradasJugador++;  // Incrementar el contador de tiradas
});

// Función para resaltar movimientos permitidos
function resaltarMovimientos(numTirada) {
    const posiblesMovimientos = [];
    let x = heroe.x, y = heroe.y;

    for (let i = 1; i <= numTirada; i++) {
        if (x + i < 10) posiblesMovimientos.push({ x: x + i, y });
        if (x - i >= 0) posiblesMovimientos.push({ x: x - i, y });
        if (y + i < 10) posiblesMovimientos.push({ x, y: y + i });
        if (y - i >= 0) posiblesMovimientos.push({ x, y: y - i });
    }

    // Resaltar las celdas donde el héroe puede moverse
    posiblesMovimientos.forEach(pos => {
        let celda = document.getElementById(`celda-${pos.x}-${pos.y}`);
        if (celda) {
            celda.classList.add("resaltar");
            // Añadir el event listener solo a las celdas resaltadas
            celda.addEventListener("click", permitirMovimiento);
        }
    });
}

function permitirMovimiento() {
    const [celda, x, y] = this.id.split('-').map(Number);  // Renombrar las variables
    if (this.classList.contains("resaltar")) {  // Solo mover si está resaltada
        moverHeroe(x, y);  // Mover al héroe a las coordenadas (x, y)
    }
}

// Función para mover al héroe a una nueva posición
function moverHeroe(x, y) {
    if (!movimientoPermitido) return;

    // Cambiar la imagen de la celda anterior a "topo inactivo"
    if (celdaHeroe) {
        celdaHeroe.innerHTML = ""; // Limpiar el contenido de la celda anterior
        let divHeroeInactivo = document.createElement("div");
        divHeroeInactivo.classList.add("heroe-inactivo"); // Asignar la clase de héroe inactivo
        celdaHeroe.appendChild(divHeroeInactivo); // Agregar la imagen de héroe inactivo
    }

    // Actualizar posición del héroe
    heroe = { x, y }; // Actualizamos el objeto héroe con las nuevas coordenadas
    celdaHeroe = document.getElementById(`celda-${x}-${y}`);  // Actualizamos la celdaHeroe

    // Agregar héroe a la nueva celda
    celdaHeroe.innerHTML = ""; // Limpiar cualquier contenido previo de la nueva celda
    let divHeroeActivo = document.createElement("div");
    divHeroeActivo.classList.add("heroe"); // Asignar la clase de héroe activo
    celdaHeroe.appendChild(divHeroeActivo);


    // Verificar si el héroe encontró el tesoro
    if (x === tesoro.x && y === tesoro.y) {
        alert("¡Has encontrado el tesoro! Fin del juego.");
        finalizarJuego();
    }

    // Limpiar resaltados
    document.querySelectorAll(".celda.resaltar").forEach(celda => {
        celda.classList.remove("resaltar");
    });

    // Desactivar movimiento hasta el siguiente turno
    movimientoPermitido = false;
    dadoTirado = false;
}

// Función para actualizar la vista del récord
function actualizarVistaRecord() {
    const recordActual = parseInt(localStorage.getItem('record'));
    const recordDiv = document.getElementById("recordActual");
    
    // Verifica si hay un récord válido o si es infinito
    if (isNaN(recordActual) || recordActual === Infinity) {
        recordDiv.textContent = "Récord actual: No hay record";
    } else {
        recordDiv.textContent = `Récord actual: ${recordActual}`;
    }
}
// Llamar a la función al inicio del juego para mostrar el récord inicial
actualizarVistaRecord();

// Función para finalizar el juego
function finalizarJuego() {
    tirarDadoBtn.disabled = true;
    movimientoPermitido = false;
    dadoTirado = true;

    const recordActual = Number(localStorage.getItem('record'));
    //Control del record, actualizar el record o mostramos que no ha superado
    if (tiradasJugador < recordActual) {
        localStorage.setItem('record', tiradasJugador);
        alert(`¡Nuevo récord con ${tiradasJugador} tiradas!`);
    } else {
        alert(`¡Has encontrado el tesoro en ${tiradasJugador} tiradas! El récord actual es ${recordActual}.`);
    }

    actualizarVistaRecord();  // Actualizar la vista del récord
}
}