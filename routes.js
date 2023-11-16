const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
//const { getFiles} = require('./gcp-client');
const { getFiles } = require('./gcp-client');
const { PrismaClient } = require('@prisma/client');

const {procesarVuelos, nombreAeropuerto, obtenerEdadPromedio, distanciaAeropuertos, obtenerNombreAvion } = require('./funciones/vuelos.js');
const prisma = new PrismaClient();
let vuelos = []



// Descarga los archivos
router.get('/descargar', async (req, res) => {
    try {
    //await print();
      await getFiles();
      res.send();
    } catch (error) {
      console.error('Error al descargar archivos:', error);
      res.status(500).send('Error al descargar archivos');
    }
  });


let jsonVuelos = {}
  // Obtiene los vuelos y todos los datos.
router.get('/json', async (req, res) => {
  jsonVuelos = await procesarVuelos()
  console.log("termino json")
  res.send(jsonVuelos);
  }
    );

    
// Obtiene los vuelos y todos los datos.
router.get('/vuelos', async (req, res) => {
  //const respuesta = await procesarVuelos()
  res.send(jsonVuelos);
  }
    );


// pobla las bases de datos.
router.get('/descargarVuelos', async (req, res) => {

  const respuesta = await cargarDatos();
  vuelos = respuesta;
  res.send("ok");
  });

// probar que este poblado.
router.get('/obtenervuelos', async (req, res) => {

  const vuelos =  await prisma.vuelos.findMany()
  res.json(vuelos);
});

/////
//Eliminar los datos
router.get('/borrar', async (req, res) => {
  await prisma.vuelos.deleteMany({});
  await prisma.aircrafts.deleteMany({});
  await prisma.airports.deleteMany({});
  await prisma.passengers.deleteMany({});
  await prisma.tickets.deleteMany({});

  res.send("ok");
  });






/////////////////////////////////////////
//Este pobla aircrafts.xml

const xml2js = require('xml2js');
const parser = new xml2js.Parser();
function parseXMLtoJSON(xml) {
    return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function leerXML() {
  const xml = fs.readFileSync('./archivos/aircrafts.xml', 'utf8');
  return parseXMLtoJSON(xml);
}
async function poblarAircrafts() {
  const jsonData = await leerXML();

  for (const row of jsonData.aircrafts.row) {
      await prisma.aircrafts.create({
          data: {
              aircraftID: row.aircraftID[0],
              name: row.name[0],
              aircraftType: row.aircraftType[0]
          }
      });
  }
}

//////////////////

//Este general.
async function cargarDatos() {
    const directorioRaiz = './archivos/flights';
    for (let año = 2015; año <= 2023; año++) {
        for (let mes = 1; mes <= 12; mes++) {
            const mesFormateado = mes.toString().padStart(2, '0');
            const rutaArchivo = path.join(directorioRaiz, año.toString(), mesFormateado, 'flight_data.json');

            if (fs.existsSync(rutaArchivo)) {
                const datosArchivo = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));
                
                // Procesar y cargar los datos
                await cargarVuelos(datosArchivo);
            }
        }
    }
    console.log("poblado vuelos");
    await poblarAircrafts();
    console.log("poblado aircrafts");
    await poblarAirports();
    console.log("poblado airports");
    await poblarTickets();
    console.log("poblado tickets");
    await poblarPassengers();
    console.log("poblado passengers");

}
//////////////////////
//Este vuelos json.
async function cargarVuelos(datosVuelos) {
    for (const vuelo of datosVuelos) {
        await prisma.vuelos.create({
            data: {
              flightNumber: vuelo.flightNumber,
              originIATA: vuelo.originIATA,
              destinationIATA: vuelo.destinationIATA,
              airline: vuelo.airline,
              aircraftID: vuelo.aircraftID,
            }
        });
    }
}

///////////////////////////////////
// este airports.


const { parse } = require('csv-parse/sync');

function leerCSVyConvertirAJSON(rutaArchivo) {
    const contenidoCSV = fs.readFileSync(rutaArchivo, 'utf8');
    const registros = parse(contenidoCSV, {
        columns: true,
        skip_empty_lines: true
    });
    return registros;
}


async function poblarAirports() {
  const registros = leerCSVyConvertirAJSON('./archivos/airports.csv');

  for (const registro of registros) {
      await prisma.airports.create({
          data: {
              airportIATA: registro.airportIATA,
              name: registro.name,
              city: registro.city,
              country: registro.country,
              lat: parseFloat(registro.lat),
              lon: parseFloat(registro.lon)
          }
      });
  }
}

////////////////////////////////////

// Este tickets


async function poblarTickets() {
  const registros = leerCSVyConvertirAJSON('./archivos/tickets.csv');

for (const registro of registros) {
    await prisma.tickets.create({
        data: {
          ticketID: registro.ticketID,
          passengerID: registro.passengerID,
          flightNumber: registro.flightNumber,
          flightType: registro.flightType,
          seatNumber: registro.seatNumber
    }});
}
}
///////////
//passengers

const yaml = require('js-yaml');
const { json } = require('body-parser');

function leerYAMLConvertirAJSON(rutaArchivo) {
    const contenidoYAML = fs.readFileSync(rutaArchivo, 'utf8');
    return yaml.load(contenidoYAML);
}


async function poblarPassengers() {
  const data = leerYAMLConvertirAJSON('./archivos/passengers.yaml');
  const passengers = data.passengers;

  for (const passenger of passengers) {
      await prisma.passengers.create({
          data: {
              passengerID: passenger.passengerID,
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              birthDate: passenger.birthDate, // Asegúrate de que el formato de fecha sea compatible
              gender: passenger.gender,
              height: passenger['height(cm)'],
              weight: passenger['weight(kg)'],
              avatar: passenger.avatar,
              edad: "0",
              numeroAsiento: "0"
          }
      });
  }
}
module.exports = router;


