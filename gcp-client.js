const express = require('express');

const { Storage } = require('@google-cloud/storage');
const app = express();
//const cors = require('cors');
const fs = require('fs');

const path = require('path');
const util = require('util');




async function getFiles(){
    const storage = new Storage({
        keyFilename: './credenciales.json', 
      });
      const bucketName = '2023-2-tarea3'; 
      const bucket = storage.bucket(bucketName);
    bucket.getFiles()
  .then((results) => {
    const files = results[0];
    console.log('Archivos');
    files.forEach((file) => {
      console.log(file.name);
      if (file.name.endsWith('.xml')) {
        parseXMLFromGCS(file);
      } else if (file.name.endsWith('.csv')) {
        parseCSVFromGCS(file);
      } else if (file.name.endsWith('.json')) {
        console.log("es json");
        parseJSONFromGCS(file);
      } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        parseYAMLFromGCS(file);
      }
    });
  })
  .catch((error) => {
    console.error('Error listing files in the bucket:', error);});
}

function descargarArchivo(file, destinoLocal) {
    // El directorio destino incluye tanto la ruta base como las subcarpetas en el nombre del archivo
    const directorioDestino = path.join(destinoLocal, path.dirname(file.name));

    // Crear el directorio (y subdirectorios) si no existe
    if (!fs.existsSync(directorioDestino)) {
        fs.mkdirSync(directorioDestino, { recursive: true });
    }

    // La ruta completa al archivo incluye el nombre del archivo
    const archivoDestino = path.join(directorioDestino, path.basename(file.name));

    // Descargar el archivo
    return file.download({
        destination: archivoDestino
    });
}

function parseJSONFromGCS(file) {
    const destinoLocal = 'archivos'; // Define el directorio de destino aquí

    descargarArchivo(file, destinoLocal)
        .then(() => {
            const archivoLocal = path.join(destinoLocal, file.name); // Ruta al archivo descargado
            fs.readFile(archivoLocal, 'utf8', (err, data) => {
                if (err) throw err;
                const jsonData = JSON.parse(data);
                //console.log(jsonData); // Aquí tienes tus datos JSON
            });
        })
        .catch(console.error);
}


const xml2js = require('xml2js');
const parser = new xml2js.Parser();

function parseXMLFromGCS(file) {
    const destinoLocal = 'archivos'; // Define el directorio de destino aquí
    descargarArchivo(file, destinoLocal)
        .then(() => {
            const archivoLocal = path.join(destinoLocal, file.name); // Ruta al archivo descargado
            fs.readFile(archivoLocal, (err, data) => {
                if (err) throw err;
                parser.parseString(data, (err, result) => {
                    if (err) throw err;
                    //console.log(result); // Aquí tendrás el contenido parseado del XML
                });
            });
        })
        .catch(console.error);
}
    
const csv = require('csv-parser');

function parseCSVFromGCS(file) {
    const destinoLocal = 'archivos'; // Define el directorio de destino aquí

    descargarArchivo(file, destinoLocal)
        .then(() => {
            const archivoLocal = path.join(destinoLocal, file.name); // Ruta al archivo descargado
            const resultados = [];
            fs.createReadStream(archivoLocal)
                .pipe(csv())
                .on('data', (data) => resultados.push(data))
                .on('end', () => {
                    //console.log(resultados); // Aquí tendrás los datos del CSV
                });
        })
        .catch(console.error);
}





const yaml = require('js-yaml');

function parseYAMLFromGCS(file) {
    const destinoLocal = 'archivos'; // Define el directorio de destino aquí

    descargarArchivo(file, destinoLocal)
        .then(() => {
            const archivoLocal = path.join(destinoLocal, file.name); // Ruta al archivo descargado
            fs.readFile(archivoLocal, 'utf8', (err, data) => {
                if (err) throw err;
                const yamlData = yaml.load(data);
                //console.log(yamlData); // Aquí tienes tus datos YAML
            });
        })
        .catch(console.error);
}


module.exports = { getFiles };