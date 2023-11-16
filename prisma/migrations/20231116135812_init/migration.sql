-- CreateTable
CREATE TABLE "Vuelos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "flightNumber" TEXT NOT NULL,
    "originIATA" TEXT NOT NULL,
    "destinationIATA" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "aircraftID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Aircrafts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aircraftID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aircraftType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Airports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "airportIATA" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Passengers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "passengerID" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "edad" TEXT NOT NULL,
    "numeroAsiento" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketID" TEXT NOT NULL,
    "passengerID" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "flightType" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL
);
