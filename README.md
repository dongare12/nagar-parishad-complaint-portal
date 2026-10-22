# Nagar Parishad Complaint Management System

An online complaint registration and management portal designed to help citizens submit complaints and allow administrators to manage and track their progress.

## Features

- Online complaint registration
- Complaint tracking
- Admin login and dashboard
- Complaint status management
- Complaint categories such as roads, street lights, water supply, garbage, and drainage
- Complaint resolution remarks
- Before-and-after images for resolved complaints
- MongoDB database integration

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Express Session and bcrypt
- **File Uploads:** Multer

## Project Structure

```text
mejioproject/
├── models/
├── module/
├── routes/
├── public/
├── uploads/
├── app.js
├── createadmin.js
├── emailService.js
├── package.json
└── package-lock.json
```

## Run Locally

1. Install [Node.js](https://nodejs.org/).
2. Clone the repository:

   ```bash
   git clone https://github.com/dongare12/nagar-parishad-complaint-portal.git
   ```

3. Enter the project folder:

   ```bash
   cd nagar-parishad-complaint-portal
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Create a `.env` file and configure the required environment variables, including your MongoDB connection URL and session secret.

6. Start the application:

   ```bash
   npm start
   ```

7. Open `http://localhost:8080` in your browser if the application is running on the default local port.

## Environment Variables

Configure these values locally or through your deployment provider:

- `MONGO_URL` — MongoDB connection string
- `SESSION_SECRET` — a strong, private session secret
- `PORT` — optional; the deployment platform can provide this automatically

Never commit `.env` or expose database credentials, passwords, or session secrets.

## Future Deployment

The project is being prepared for deployment using MongoDB Atlas and Render.

## Author

Rajkumar Dongare

## License

No license has been selected yet. All rights are reserved unless a license is added.
