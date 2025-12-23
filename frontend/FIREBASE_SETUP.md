# Firebase Authentication Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## 2. Enable Authentication Methods

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
   - You may need to configure OAuth consent screen
   - Add authorized domains (localhost for development)

## 3. Register Your Web App

1. In Project Settings, click "Add app" and select **Web** (</> icon)
2. Register your app with a nickname
3. Copy the Firebase configuration object

## 4. Update Your Configuration

Open `src/config/firebase.js` and replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",                    // Your API key
  authDomain: "your-app.firebaseapp.com", // Your auth domain
  projectId: "your-project-id",           // Your project ID
  storageBucket: "your-app.appspot.com",  // Your storage bucket
  messagingSenderId: "123456789",         // Your messaging sender ID
  appId: "1:123456789:web:abc123"        // Your app ID
}
```

## 5. Install Firebase Package

Run the following command in your terminal:
```bash
npm install firebase
```

## 6. Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to the signup page: `http://localhost:5173/signup`
3. Try creating an account with email/password
4. Try signing in with Google

## Security Notes

- Never commit your Firebase config to a public repository if it contains sensitive data
- Consider using environment variables for production
- Set up Firebase Security Rules to protect your data

## Troubleshooting

### "auth/unauthorized-domain" error
- Add your domain (localhost:5173) to authorized domains in Firebase Console
- Go to Authentication > Settings > Authorized domains

### Google Sign-In not working
- Ensure Google provider is enabled in Firebase Console
- Check that authorized domains are configured correctly

### Email/Password signup failing
- Verify that Email/Password is enabled in Firebase Console
- Check password meets minimum requirements (6+ characters)
