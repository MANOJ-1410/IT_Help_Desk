```bash
# IT Help Desk

IT Help Desk is a web-based application designed to streamline IT support by enabling users to create, track, and resolve support
tickets efficiently. Built with React.js, Firebase, Cloudinary, and EmailJS, it provides a seamless experience for users and administrators.

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/IT_Help_Desk.git
   cd IT_Help_Desk
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**  
   Create a `.env` file in the project root and add the following:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   REACT_APP_EMAILJS_USER_ID=your_emailjs_user_id
   ```

4. **Run the Application:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## Features

- **Hardcoded Manager & IT Staff:** Predefined roles for manager and IT staff, no login required.
- **Ticket Submission:** Users can submit support tickets without authentication.
- **Admin Panel:** Managers can view, manage, and assign tickets.
- **Email Notifications:** Automated email updates for ticket status changes using EmailJS.
- **File Uploads:** Users can attach images to tickets via Cloudinary for better context.

## Tech Stack

- **Frontend:** React.js
- **Backend:** Firebase (Firestore, Authentication)
- **File Storage:** Cloudinary
- **Email Service:** EmailJS

## Demo

Explore the live demo: [https://it-help-desk-sigma.vercel.app/](#)

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

For major changes, please open an issue first to discuss your ideas.

## License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.
```
