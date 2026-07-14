import SwaggerAutogen from "swagger-autogen";

const swaggerAutogen = SwaggerAutogen();

const doc = {
  info: {
    title: "Wooftools APIs",
    description: "Wooftools Backend API services",
  },
  host: "localhost:8000",
  schemes: ["http"],
};

const outputFile = "../swagger/swagger.json";
const endpointsFiles = ["../index.ts"];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);
