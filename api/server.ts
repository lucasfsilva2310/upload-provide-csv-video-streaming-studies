import fastify from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream, readdirSync } from "fs";
import { join } from "path";
import csvParser from "csv-parser";
import { Transform } from "stream";
import fs from "fs";

const server = fastify();
const uploadsDir = join(__dirname, "uploads");
const processedDir = join(__dirname, "processed");

// Register plugins
server.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB limit
  },
});
server.register(cors, {
  origin: true,
});

// Create a transform stream for logging progress
const createProgressStream = (type: string) => {
  let processedChunks = 0;
  return new Transform({
    transform(chunk, encoding, callback) {
      processedChunks++;
      console.log(`Processing ${type} chunk #${processedChunks}`);
      this.push(chunk);
      callback();
    },
  });
};

// CSV Streaming endpoint
server.post("/stream/csv", async (request, reply) => {
  const data = await request.file();
  if (!data) {
    throw new Error("No file uploaded");
  }

  const outputPath = join(processedDir, `processed_${data.filename}`);
  const progressStream = createProgressStream("CSV");

  await pipeline(
    data.file,
    csvParser(),
    progressStream,
    createWriteStream(outputPath)
  );

  return { message: "CSV processed successfully" };
});

// Video Upload Streaming endpoint
server.post("/stream/video", async (request, reply) => {
  const data = await request.file();
  if (!data) {
    throw new Error("No file uploaded");
  }

  const outputPath = join(uploadsDir, data.filename);
  const progressStream = createProgressStream("video");

  try {
    await pipeline(data.file, progressStream, createWriteStream(outputPath));

    // Use fs.statSync to get the size of the uploaded file
    const uploadedFileSize = fs.statSync(outputPath).size;
    console.log(`Uploaded video size: ${uploadedFileSize} bytes`);

    return { message: "Video uploaded successfully" };
  } catch (error) {
    console.error(`Error uploading video: ${error}`);
    reply.status(500).send({ error: "Failed to upload video" });
  }
});

// Video List endpoint
server.get("/stream/video/list", async (request, reply) => {
  const files = readdirSync(uploadsDir);
  return files.filter((file) => file.endsWith(".mp4"));
});

// Video Streaming endpoint
server.get("/stream/video/watch/:videoName", async (request, reply) => {
  const { videoName } = request.params as { videoName: string };
  const videoPath = join(uploadsDir, videoName);

  try {
    const stat = await import("fs/promises").then((fs) => fs.stat(videoPath));
    const fileSize = stat.size;
    const range = request.headers.range;

    const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB buffer size

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
      const chunksize = end - start + 1;

      console.log(`Streaming video chunk: bytes ${start}-${end}/${fileSize}`);

      reply.header("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      reply.header("Accept-Ranges", "bytes");
      reply.header("Content-Length", chunksize);
      reply.header("Content-Type", "video/mp4");
      reply.status(206);

      const videoStream = createReadStream(videoPath, { start, end });
      return reply.send(videoStream);
    } else {
      console.log(`Streaming entire video: ${fileSize} bytes`);

      reply.header("Content-Length", fileSize);
      reply.header("Content-Type", "video/mp4");
      const videoStream = createReadStream(videoPath);
      return reply.send(videoStream);
    }
  } catch (error) {
    console.error(`Error streaming video: ${error}`);
    reply.status(404).send({ error: "Video not found" });
  }
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 3010, host: "0.0.0.0" });
    console.log("Server running at http://localhost:3010");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
