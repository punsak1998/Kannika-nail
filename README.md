# 💅 Nail Salon Booking System

A full-stack booking and portfolio management system designed for a nail salon. This application provides a seamless user experience for customers to browse the gallery and book appointments, while offering a secure Admin Panel for the salon owner to manage content dynamically.

## 🚀 Live Demo
- **Website:** https://nail-salon-booking-eta.vercel.app/

## ✨ Key Features

### For Customers (Frontend)
- **Interactive Gallery:** Browse nail designs with real-time price displays.
- **One-Click Booking:** Auto-fill booking forms by selecting a design directly from the gallery.
- **Responsive Design:** Optimized for both mobile and desktop users.

### For Salon Owner (Admin Panel)
- **Secure Authentication:** Firebase Email/Password login to protect business data.
- **Dynamic Portfolio Management:** Upload, update, and delete nail design images seamlessly.
- **Automated Image Hosting:** Integrated with ImgBB API for fast and reliable image storage.
- **Security Rules:** Strict Firestore Security Rules implemented to prevent unauthorized access.

## 🛠️ Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Image Storage:** ImgBB API
- **Deployment:** Vercel

## ⚙️ Running Locally
If you want to clone and run this project locally, you will need to set up your own environment variables.
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file and add your Firebase and ImgBB API keys.
4. Run the development server: `npm run dev`
