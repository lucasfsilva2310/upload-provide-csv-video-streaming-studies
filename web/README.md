# Video and CSV Streaming Application

This project is a simple application that allows users to upload CSV files and video files, which are then processed and streamed back to the client. The application consists of a frontend built with React and a backend built with Fastify.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Frontend](#frontend)
- [Backend](#backend)
- [Contributing](#contributing)
- [License](#license)

## Features

- Upload CSV files for processing.
- Upload MP4 video files for streaming.
- List available videos for playback.
- Stream videos with support for range requests.
- Console logging for processing progress.

## Technologies

- **Frontend**: React, Vite, TypeScript, Axios
- **Backend**: Fastify, Node.js, TypeScript, CSV Parser
- **Database**: None (file-based storage)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/streaming-app.git
   cd streaming-app
   ```

2. Navigate to the `api` directory and install the backend dependencies:

   ```bash
   cd api
   npm install
   ```

3. Navigate to the `web` directory and install the frontend dependencies:

   ```bash
   cd ../web
   npm install
   ```

## Usage

1. Start the backend server:

   ```bash
   cd api
   npm run dev
   ```

2. In a new terminal, start the frontend application:

   ```bash
   cd web
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to access the frontend.

## API Endpoints

### CSV Upload

- **POST** `/stream/csv`
  - Upload a CSV file for processing.

### Video Upload

- **POST** `/stream/video`
  - Upload an MP4 video file for streaming.

### List Videos

- **GET** `/stream/video/list`
  - Retrieve a list of available MP4 videos.

### Stream Video

- **GET** `/stream/video/watch/:videoName`
  - Stream a video by its name.

## Frontend

The frontend is built using React and Vite. It provides a user interface for uploading files and viewing available videos. The main component is located in `web/src/App.tsx`.

## Backend

The backend is built using Fastify and handles file uploads and streaming. The main server file is located in `api/server.ts`.
