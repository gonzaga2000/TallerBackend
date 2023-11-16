const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();

async function nombreAeropuerto(codigoIATA) {
    const airport = await prisma.airports.findFirst({
        where: {airportIATA:codigoIATA}
    })
    

    //console.log(airportMap[codigoIATA]);
    return airport;
};

async function distanciaAeropuertos(codigoIATA1, codigoIATA2) {
    const airportName1 = await prisma.airports.findFirst({
        where: {airportIATA:codigoIATA1}
    })
    const airportName2 = await prisma.airports.findFirst({
        where: {airportIATA:codigoIATA2}
    })
    
    const x1 = parseFloat(airportName1.lat)
    const x2 = parseFloat(airportName1.lon)
    const x3 = parseFloat(airportName2.lat)
    const x4 = parseFloat(airportName2.lon)
    const distancia = calcularDistancia(x1,x2,x3,x4);
    
    return Math.round(distancia);
};




const yaml = require('js-yaml');

async function obtenerEdadPromedio(flightNumber) {
    const listTickets = await prisma.tickets.findMany({
        where: {flightNumber:flightNumber}
    })
    let passengers = [];
    for (const ticket of listTickets){
        const pasajero = await prisma.passengers.findFirst({
            where:{passengerID:ticket.passengerID}

        })
        const updatedPasajero = await prisma.passengers.update({
            where:{id: pasajero.id, passengerID:pasajero.passengerID},
            data: {
                numeroAsiento: ticket.seatNumber,
            },
        });
        console.log(updatedPasajero);
        passengers.push(pasajero)
    }
    // Calcular el promedio de edad
    let totalEdad = 0;
    let contador = 0;

    for (const pasajero of passengers){
        const edad = calcularEdad(pasajero.birthDate);
        const updatedPasajero = await prisma.passengers.update({
            where:{id: pasajero.id, passengerID:pasajero.passengerID},
            data: {
                edad: edad.toString(),
            },
        });
        totalEdad += edad;
        contador++;
    }
    const promedio = totalEdad/contador;

    return [promedio, contador, passengers];

}

function calcularEdad(birthDateStr) {
    const birthDate = convertirFechaEspañolADate(birthDateStr);
    if (!birthDate) {
        return -1; // Retorna -1 si la fecha no es válida
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function convertirFechaEspañolADate(fecha) {
    const meses = {
        enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
        julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const partes = fecha.match(/(\d+) de (\w+) de (\d+)/);
    if (!partes) {
        return null;
    }
    const dia = parseInt(partes[1], 10);
    const mes = meses[partes[2].toLowerCase()];
    const año = parseInt(partes[3], 10);

    return new Date(año, mes, dia);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const rad = Math.PI / 180; // Factor para convertir grados en radianes

    const deltaLat = (lat2 - lat1) * rad;
    const deltaLon = (lon2 - lon1) * rad;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Distancia en kilómetros
    
}


const xml2js = require('xml2js');

async function obtenerNombreAvion(aircraftID) {
    const avion = await prisma.aircrafts.findFirst({
        where:{aircraftID:aircraftID}
    })
   

    return avion;
}

async function procesarVuelos() {
    let vuelosProcesados = [];
    let contador = 0;
    const vuelos =  await prisma.vuelos.findMany({take: 3240});
    for (const vuelo of vuelos) {
        contador++;
        //console.log("vuelo con id: ", vuelo.flightNumber);
        console.log(contador);
        const Origen = await nombreAeropuerto(vuelo.originIATA);
        const Destino = await nombreAeropuerto(vuelo.destinationIATA);
        const Avion = await obtenerNombreAvion(vuelo.aircraftID);
        const [promedioEdad, cantidadPasajeros, passengers] = await obtenerEdadPromedio(vuelo.flightNumber);
        const distanciaRecorrida = await distanciaAeropuertos(vuelo.originIATA, vuelo.destinationIATA);

        let infoVuelo = {
            Origen: Origen,
            Destino: Destino,
            aerolinea: vuelo.airline,
            nombreAvion: Avion,
            promedioEdad: promedioEdad,
            distanciaRecorrida: distanciaRecorrida,
            cantidadPasajeros: cantidadPasajeros,
            pasajeros: passengers,
            flightNumber: vuelo.flightNumber
        };
        vuelosProcesados.push(infoVuelo);
    }
    //const datosJson = JSON.stringify({ vuelos: vuelosProcesados }, null, 2);
    // Escribir los datos en un archivo JSON
    return{vuelosProcesados};
}


module.exports = {procesarVuelos, nombreAeropuerto, obtenerEdadPromedio, distanciaAeropuertos, obtenerNombreAvion};