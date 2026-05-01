# Career-Navigator

Career-Navigator is a full-stack web application designed to help users navigate their career paths by providing tools for job searching, interview preparation, and personalized AI-generated roadmaps.

## Features
- **Authentication**: Secure user registration and login.
- **Job Listings**: Search and save job opportunities.
- **AI Roadmaps**: Generate personalized career roadmaps using OpenAI.
- **Interview Preparation**: Practice and grade interview answers.

## Deployment
- **Frontend**: Deployed on Vercel.
- **Backend**: Deployed on Render.

### Live Website
[Visit Career-Navigator](#)  <!-- Replace # with the actual deployed URL -->

## Technologies Used
- **Frontend**: React, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, OpenAI API

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/nikhilbishtco22a554-lab/Career-Navigator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Career-Navigator
   ```
3. Install dependencies for both frontend and backend:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
4. Create `.env` files in both `client` and `server` directories based on the provided `.env.example` files.
5. Start the development servers:
   ```bash
   # In one terminal
   cd server && npm start

   # In another terminal
   cd client && npm run dev
   ```

## License
This project is licensed under the MIT License.