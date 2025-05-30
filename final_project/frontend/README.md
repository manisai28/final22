# Video SEO Analysis Frontend

This is the frontend for the Video SEO Analysis system. It provides a user interface for user authentication, video upload, text extraction, keyword generation, and SEO ranking.

## Features

- User authentication with JWT
- Video upload and processing
- Text extraction from videos
- Keyword generation using KeyBERT
- SEO ranking using YouTube API
- History tracking
- Dark & light mode support
- Responsive design

## Prerequisites

- Node.js 14+
- npm or yarn

## Installation

1. Clone the repository
2. Install the dependencies:

```bash
npm install
# or
yarn install
```

## Running the Application

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

- `public/`: Static assets
- `src/`: Source code
  - `components/`: Reusable UI components
  - `context/`: React context providers
  - `pages/`: Page components
  - `utils/`: Utility functions
  - `App.js`: Main application component
  - `index.js`: Entry point
