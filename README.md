# NLP Speech Recognition and Translation Project

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Welcome to the NLP Speech Recognition and Translation Project!** 🌍🔊

This project aims to make communication across different languages easier through speech recognition, text translation, and text-to-speech conversion. It provides a simple interface for translating spoken or typed text between languages.

## Hosted Project

[Open the Speech Translator Website](https://nlp-speech-translator-website.vercel.app/)

![Project Screenshot](assets/project-image-desktop.png)

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Speech-to-Text Translation:** Convert spoken words into text and translate them into another language.
- **Text-to-Speech Conversion:** Convert written text into speech.
- **Manual Text Input:** Enter text manually when you prefer typing.
- **Copy Text:** Copy translated text easily.
- **User-Friendly Interface:** An intuitive interface built with web technologies.

## Technologies Used

### Frontend

- Next.js
- React
- Chakra UI

### Backend

- FastAPI
- Google Translator (`googletrans`)
- Google Text-to-Speech (`gTTS`)

### Other Tools

- Python
- JavaScript
- Node.js and npm
- Git and GitHub
- Docker

## Project Structure

```text
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── package.json
│   ├── public/
│   └── app/
├── esp32_firmware/
├── mic_client.html
├── requirements.txt
└── README.md
```

*The structure above is a simplified overview. Some files may differ depending on the current project version.*

## Installation

### Prerequisites

- Python 3.10 or another compatible Python version
- Node.js and npm
- Git
- Docker (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/reetika356/NLP-Speech-Translator-Website.git
cd NLP-Speech-Translator-Website
```

### 2. Set Up the Backend

Open a terminal in the project directory and run:

```bash
cd backend
pip install -r requirements.txt
```

Configure the required environment variables before starting the backend.

For example, if your application uses Deepgram, set `DEEPGRAM_API_KEY` in your local environment. Never publish API keys or passwords in the repository.

Start the backend using:

```bash
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

If the frontend requires a backend URL, create a `.env.local` file inside the `frontend` directory and configure the variable expected by your application. For example:

```env
NEXT_PUBLIC_TRANSLATOR_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local frontend address shown by the development server, commonly `http://localhost:3000`.

### 4. Run with Docker

If your Docker configuration is set up for the current project, you can use:

```bash
docker compose up --build
```

## Usage

1. Start the backend and frontend.
2. Open the website in your browser.
3. Select the source and target languages.
4. Speak into the microphone or enter text manually.
5. View the translated text.
6. Use the text-to-speech feature to listen to the result.
7. Copy the translated text when needed.

Available functionality depends on the current implementation and configuration.

## Configuration

### Environment Variables

Keep API keys and other secrets in local environment variables or ignored `.env` files.

Do not commit the following:

- API keys
- Wi-Fi passwords
- `.env` files containing secrets
- Virtual environments
- Generated build files

If you change the backend's address or port, update the frontend configuration accordingly.

### CORS Configuration

The backend must allow requests from the frontend's origin. Check the CORS configuration in `backend/app.py` and update the allowed origins for your local or deployed setup.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository if you are contributing through GitHub.
2. Create a branch for your changes.
3. Make and test your changes.
4. Commit your changes.
5. Submit a pull request if appropriate.

## License

This project includes an MIT License badge. Refer to the repository's `LICENSE` file for the applicable license terms and copyright notices.

## Contact

**Developer:** Reetika

**GitHub:** [reetika356](https://github.com/reetika356)

---

Thank you for checking out the NLP Speech Recognition and Translation Project! 🌍