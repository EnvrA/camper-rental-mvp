# Camper Rental MVP

This repository contains a minimal full‑stack web application for renting and listing campers.  It is built using **Node.js**, **Express**, **MongoDB** and **EJS** and implements basic user authentication, camper listings with photos and prices, and booking functionality with overlap checks.

## Features

* **User registration and login** using sessions and password hashing.
* **List your camper** with a title, description, daily price and uploaded photo.
* **Browse campers** and **search/filter** them by title and price range.
* **Book a camper** for a range of dates. Existing bookings are checked to prevent date overlaps.
* **Edit or delete your listing** if you are the owner of a camper.
* **User dashboard** to view all of your current and past bookings.
* **REST API endpoints** to retrieve camper data as JSON (`/api/campers` and `/api/campers/:id`).
* **Basic security hardening** using Helmet.
* **Simple, responsive UI** built with EJS templates and a small stylesheet.

## Getting started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment variables** by copying `.env.example` to `.env` and filling in a MongoDB URI and a session secret.

   You can also set optional variables for Stripe or other integrations if you extend the app.

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000` in your browser to browse campers, sign up and create listings.

## Project structure

```
camper-rental-mvp/
├── app.js            # Application entry point
├── package.json      # Dependencies and scripts
├── .env.example      # Example configuration
├── .gitignore        # Files to ignore
├── models/           # Mongoose models
│   ├── User.js
│   └── Camper.js
├── views/            # EJS templates
│   ├── layouts/
│   │   └── layout.ejs
│   ├── index.ejs
│   ├── dashboard.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   ├── campers/
│   │   ├── new.ejs
│   │   ├── edit.ejs
│   │   └── show.ejs
├── public/
│   ├── styles.css    # Basic styling
│   └── uploads/      # Uploaded camper images
```

## License

This project is provided as a sample under the MIT License.  See [LICENSE](LICENSE) for details.