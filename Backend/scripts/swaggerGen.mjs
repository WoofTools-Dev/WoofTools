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

const outputFile = "./swagger/swagger.json";
const endpointsFiles = ["./index.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
