import app from "./app";
import prisma from "./configs/prisma.config";

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, async () => {
  await prisma.$connect();
  console.log("⚡ Server started on port 8000");
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
  console.log("[server]: Server closed on SIGINT");
});

export default server;
