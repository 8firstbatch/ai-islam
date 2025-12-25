# Profile Image Management System

## Overview

The Islamic AI application now has a comprehensive profile image management system that automatically saves Google profile images to user settings and allows users to customize their profile images through the Settings page.

## Key Features

### 1. Automatic Google Profile Image Sync
- **On Sign-in**: Google profile images are automatically saved to the user's profile
- **Database Storage**: Images are stored in the `profiles` table for persistence
- **Fallback Handling**: Graceful fallback to Google OAuth data if profile doesn't exist

### 2. Profile Settings Management
- **Custom Upload**: Users can upload their own profile images
- **Google Sync**: Manual sync button to update from Google account
- **Real-time Preview**: Immediate preview of profile image changes
- **Validation**: File type and size validation for uploads

### 3. Consistent Display
- **Sidebar Integration**: Profile images display consistently in the sidebar
- **Priority System**: Custom images take priority over Google OAuth images
- **Fallback Chain**: Custom → Google → Initials fallback system

## Technical Implementation

### Database Schema
Uses existing `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Profile Utilities (`profileUtils.ts`)

#### Core Functions
```typescript
// Sync Google profile data on sign-in
syncGoogleProfileData(user) 

// Get user profile from database
getUserProfile(userId)

// Update user profile
updateUserProfile(userId, updates)

// Upload profile image
uploadProfileImage(userId, file)

// Get effective profile image (priority: custom → Google)
getEffectiveProfileImage(user, profile)

// Get effective display name (priority: custom → Google → email)
getEffectiveDisplayName(user, profile)
```

### Authentication Flow Integration

#### AuthCallback Component
```typescript
// After successful Google OAuth
await syncGoogleProfileData(user);
```

This automatically:
1. Extracts Google profile image and name
2. Saves to database if profile doesn't exist
3. Updates existing profile only if fields are empty

### Settings Page Enhancement

#### Profile Management Features
- **Avatar Upload**: Click camera icon to upload custom image
- **Google Sync**: Button to sync latest Google profile image
- **Real-time Preview**: Immediate visual feedback
- **Validation**: File type (images only) and size (2MB max) validation

#### User Experience
```typescript
// Upload custom image
handleAvatarUpload() → uploadProfileImage() → updateUserProfile()

// Sync from Google
syncGoogleImage() → getEffectiveProfileImage() → updateUserProfile()

// Save profile
saveProfile() → updateUserProfile()
```

### Sidebar Integration

#### Enhanced Display
```typescript
// Uses effective profile image with fallback chain
<AvatarImage src={getEffectiveProfileImage(user, profile)} />
<AvatarFallback>{getEffectiveDisplayName(user, profile)[0]}</AvatarFallback>
```

## Priority System

### Profile Image Priority
1. **Custom uploaded image** (stored in `profiles.avatar_url`)
2. **Google OAuth image** (from `user.user_metadata.avatar_url`)
3. **Initials fallback** (first letter of display name)

### Display Name Priority
1. **Custom display name** (stored in `profiles.display_name`)
2. **Google OAuth name** (from `user.user_metadata.full_name`)
3. **Email username** (part before @ in email)

## User Workflows

### New Google Sign-in User
1. **User signs in with Google**
2. **AuthCallback triggers** → `syncGoogleProfileData()`
3. **Profile created** with Google image and name
4. **Sidebar displays** Google profile image immediately
5. **Settings page** shows Google data, allows customization

### Existing User Profile Update
1. **User goes to Settings** → Profile tab
2. **Current profile loaded** from database
3. **Options available**:
   - Upload custom image (camera icon)
   - Sync latest Google image (sync button)
   - Update display name
4. **Changes saved** to database immediately
5. **Sidebar updates** with new profile data

### Guest User Experience
- No profile saving (graceful handling)
- Uses Google OAuth data directly
- Settings page works but doesn't persist

## Error Handling

### Upload Validation
```typescript
// File type validation
if (!file.type.startsWith("image/")) {
  throw new Error("Please upload an image file");
}

// File size validation (2MB max)
if (file.size > 2 * 1024 * 1024) {
  throw new Error("Please upload an image smaller than 2MB");
}
```

### Database Errors
- Graceful fallback to Google OAuth data
- User-friendly error messages
- Automatic retry mechanisms
- No interruption to user experience

### Network Issues
- Local state updates for immediate feedback
- Background sync when connection restored
- Offline-first approach where possible

## Security Considerations

### Image Storage
- **Base64 encoding** for simplicity (current implementation)
- **File validation** prevents malicious uploads
- **Size limits** prevent abuse
- **Future**: Migrate to Supabase Storage for better performance

### Privacy
- **User control** over profile visibility
- **Google data sync** only with user consent
- **Data ownership** - users can delete/update anytime
- **GDPR compliance** through user control

## Performance Optimizations

### Current Implementation
- **Lazy loading** of profile data
- **Caching** in component state
- **Optimistic updates** for better UX
- **Efficient queries** using Supabase RLS

### Future Enhancements
- **Image compression** before storage
- **CDN integration** for faster loading
- **Progressive loading** for large images
- **Thumbnail generation** for different sizes

## Benefits

### For Users
- ✅ **Automatic setup** - Google images saved automatically
- ✅ **Easy customization** - Simple upload and sync options
- ✅ **Consistent experience** - Same image across all app areas
- ✅ **Personal control** - Full control over profile appearance

### For Developers
- ✅ **Modular design** - Reusable utility functions
- ✅ **Error handling** - Comprehensive error management
- ✅ **Database integration** - Proper persistence layer
- ✅ **Scalable architecture** - Easy to extend and maintain

## Future Enhancements

### Planned Features
1. **Image cropping** - Built-in image editor
2. **Multiple image formats** - Support for more file types
3. **Profile themes** - Customizable profile backgrounds
4. **Social features** - Profile sharing and visibility controls
5. **Bulk operations** - Import/export profile data

### Technical Improvements
1. **Supabase Storage** - Move from base64 to proper file storage
2. **Image optimization** - Automatic compression and resizing
3. **Real-time sync** - Live updates across devices
4. **Offline support** - Better offline functionality
5. **Performance monitoring** - Track upload success rates

This comprehensive profile image management system ensures that users have a personalized, consistent experience while maintaining full control over their profile appearance.