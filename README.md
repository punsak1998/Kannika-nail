# 💅 Kannika Nail Salon - Booking Management System

![Project Banner](https://nail-salon-booking-eta.vercel.app/hero-1.jpg)

> A modern, responsive, and real-time web application for managing nail salon appointments. Built to deliver a seamless booking experience for customers and efficient management for the salon owner.

🔗 **Live Demo:** [https://nail-salon-booking-eta.vercel.app](https://nail-salon-booking-eta.vercel.app)

---

## ✨ Key Features

- **Real-time Appointment Booking:** Customers can seamlessly select services, pick available time slots, and submit bookings.
- **Dynamic Service Categorization:** Services are dynamically fetched and grouped into categories (e.g., Gel Polish, Nail Extensions, Pedicure, Special Services) directly from the database.
- **Form Validation & Error Handling:** Robust client-side validation and error state management to ensure complete and accurate data submission.
- **Responsive UI/UX:** Fully responsive design built with Tailwind CSS, ensuring a native-like experience on both mobile and desktop devices.
- **Secure Architecture:** Implemented API Key restrictions and environment variables to secure backend services.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) (React Framework)
- [TypeScript](https://www.typescriptlang.org/) - For strict type checking and scalable code.
- [Tailwind CSS](https://tailwindcss.com/) - For rapid, utility-first UI styling.

**Backend & Database:**
- [Firebase Cloud Firestore](https://firebase.google.com/) - NoSQL database for real-time service fetching and booking storage.

**Deployment:**
- [Vercel](https://vercel.com/) - CI/CD and hosting.

---

## 🗄️ Database Architecture (Firestore)

The application utilizes a scalable NoSQL database structure with the following primary collections:

### 1. `Services` Collection
Stores all available salon services dynamically.
- `name` (String): Name of the service (e.g., "ทาสีเจลแฟลช")
- `category` (String): Grouping category (e.g., "ทาสีเจล", "เสริมพิเศษ")
- `price` (Number): Cost of the service
- `duration` (Number): Estimated time in minutes
- `image` (String): URL of the service thumbnail

### 2. `Bookings` Collection (Admin side)
Stores customer appointment details.
- `customerName` (String)
- `phoneNumber` (String)
- `serviceId` (Reference)
- `appointmentDate` (Timestamp)
- `status` (String: Pending, Confirmed, Completed)

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase Project setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/punsak1998/Kannika-nail.git](https://github.com/punsak1998/Kannika-nail.git)
   cd Kannika-nail
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

---

## 💡 Technical Highlights & Learnings

- **Data Integrity:** Refactored the category system to strictly match database records (`category === 'ทาสีเจล'`), eliminating UI rendering bugs caused by manual string mismatches.
- **Git & Version Control:** Actively utilized Git for version control, managing merge conflicts, and keeping local and remote repositories in sync via terminal commands.
- **Cloud Security:** Secured the application by configuring Google Cloud API Key restrictions (HTTP referrers) strictly for `localhost` and the production Vercel domain.

---

## 👨‍💻 Author

**Phansak Thapthimhin**
- GitHub: [@punsak1998](https://github.com/punsak1998)
- Email: Punsak1998@gmail.com

*This project was built to demonstrate full-stack web development skills, database architecture, and production deployment processes.*