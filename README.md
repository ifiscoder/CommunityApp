# Community Directory App

A professional mobile and tablet application for managing community member data with secure authentication, data validation, and role-based access control.

## Features

- **Mobile & Tablet Optimized**: Responsive design that works on all screen sizes
- **Secure Authentication**: Email/password login with Supabase Auth
- **Role-Based Access**: Admin sees all data, members see only their own
- **Data Validation**: Multi-layer validation to prevent trash data
- **Duplicate Prevention**: Database constraints prevent duplicate entries
- **Photo Upload**: Profile picture upload with compression
- **Offline Support**: Basic offline functionality
- **Admin Dashboard**: Full member management with search and filters
- **Clean UI**: Professional design with Material Design principles

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **UI Library**: React Native Paper
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Forms**: React Hook Form
- **Validation**: Zod

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier)

## Installation

1. **Clone and install dependencies**:
```bash
cd identityApp
npm install
```

2. **Set up Supabase**:
   - Follow the detailed setup guide in `SUPABASE_SETUP.md`
   - Create your project at https://supabase.com
   - Get your API credentials
   - Set up the database tables and RLS policies

3. **Configure environment variables**:
```bash
# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Start the development server**:
```bash
npm start
# or
expo start
```

5. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
src/
├── components/       # Reusable UI components
├── constants/        # App constants and theme
├── context/          # React Context providers
├── navigation/       # Navigation configuration
├── screens/          # Screen components
│   ├── Auth/         # Login and Register screens
│   ├── Profile/      # Member profile screens
│   └── Admin/        # Admin dashboard screens
├── services/         # API and external services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## User Roles

### Member (Regular User)
- View and edit own profile only
- Upload profile photo
- Cannot see other members' data

### Admin
- View all community members
- Approve/reject pending registrations
- Edit any member's profile
- Delete members
- Access dashboard with statistics

## Data Validation

The app implements multi-layer validation:

1. **Client-side**: Real-time validation with React Hook Form + Zod
2. **Database**: Unique constraints on email and phone
3. **RLS Policies**: Row Level Security ensures data privacy

### Validation Rules

- **Full Name**: 2-100 characters, letters and spaces only
- **Email**: Valid email format, must be unique
- **Phone**: Valid phone format, must be unique
- **Address**: All fields required, structured format
- **Photo**: Max 5MB, JPG/PNG/WEBP formats only

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Email Verification**: Optional email confirmation
- **Secure Storage**: Tokens stored in encrypted storage
- **Input Sanitization**: XSS and injection protection
- **Rate Limiting**: API call limits to prevent abuse

## Customization

### Theming
Edit `src/constants/theme.ts` to customize colors:

```typescript
export const theme = {
  colors: {
    primary: '#2563eb',    // Change primary color
    secondary: '#64748b',
    // ... more colors
  },
};
```

### Adding Fields
To add new fields to member profiles:

1. Update `src/types/index.ts` - Add field to `MemberProfile` interface
2. Update Supabase table - Add column in Table Editor
3. Update forms - Add input fields in `EditProfileScreen.tsx`
4. Update validation - Add validation rules in form components

## Building for Production

### iOS
```bash
expo build:ios
# or for EAS
eas build --platform ios
```

### Android
```bash
expo build:android
# or for EAS
eas build --platform android
```

### Web (PWA)
```bash
expo build:web
```

## Deployment

### App Stores
1. Build production binaries
2. Upload to Apple App Store Connect / Google Play Console
3. Submit for review

### Web
Deploy the `web-build` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## Troubleshooting

### Common Issues

**"Failed to fetch" error**
- Check Supabase URL is correct in `.env`
- Verify device has internet connection

**Photos not uploading**
- Check storage bucket permissions in Supabase
- Verify image size is under 5MB
- Check RLS policies for storage

**Can't see admin features**
- Verify user has `role: 'admin'` in Supabase Auth
- Check RLS policies allow admin access

**App crashes on startup**
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

- Expo Documentation: https://docs.expo.dev
- Supabase Documentation: https://supabase.com/docs
- React Native Documentation: https://reactnative.dev

## Roadmap

- [ ] Push notifications
- [ ] Bulk import from CSV
- [ ] QR code generation
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Family/household grouping
- [ ] Custom fields builder
