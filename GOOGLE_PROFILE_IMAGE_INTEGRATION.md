# Google Profile Image Integration

## Overview

The Google authentication now includes profile image fetching from the user's Google account. This provides a personalized experience by displaying the user's actual profile picture throughout the application.

## How It Works

### 1. OAuth Scopes
The authentication request now includes the `profile` scope:
```javascript
scopes: 'openid email profile'
```

This scope allows access to:
- User's profile picture (`picture` field)
- Full name (`name` field)
- Other basic profile information

### 2. Profile Data Extraction
The `getUserProfileImage()` function checks multiple possible locations for the profile image:
- `user.user_metadata.avatar_url`
- `user.user_metadata.picture`
- `user.identities[0].identity_data.avatar_url`
- `user.identities[0].identity_data.picture`

### 3. Display Components

#### Sidebar User Section
- Shows user's profile image in an Avatar component
- Displays full name and email
- Fallback to initials if no image is available

#### UserProfile Component (Available for future use)
- Comprehensive user profile display
- Dropdown menu with user actions
- Profile image with fallback handling

#### AuthDebug Component
- Shows current user profile information
- Displays whether profile image is available
- Useful for debugging authentication issues

## Implementation Details

### Profile Image Handling
```javascript
// Get profile image URL
const profileImage = getUserProfileImage(user);

// Display in Avatar component
<Avatar>
  <AvatarImage 
    src={profileImage || undefined} 
    alt={displayName}
    referrerPolicy="no-referrer"  // Important for Google images
  />
  <AvatarFallback>
    {getInitials(displayName)}
  </AvatarFallback>
</Avatar>
```

### Key Features
- **Automatic fallback**: Shows user initials if no image is available
- **CORS handling**: Uses `referrerPolicy="no-referrer"` for Google images
- **Multiple data sources**: Checks various locations in user metadata
- **Debug support**: Comprehensive logging and debug tools

## Configuration Requirements

### Google Cloud Console
1. **Scopes**: Ensure your OAuth client has access to profile information
2. **APIs**: Enable "People API" for enhanced profile data access

### Supabase Configuration
1. **Provider Scopes**: Set to `openid email profile` in Google provider settings
2. **Redirect URLs**: Properly configured callback URLs

## Testing

### Debug Tools
Use the AuthDebug component to:
- Verify profile image is being fetched
- Check user metadata structure
- Test OAuth configuration

### Manual Testing
1. Sign in with Google
2. Check browser console for profile data logs
3. Verify image appears in sidebar
4. Test fallback behavior (if image fails to load)

## Troubleshooting

### Common Issues

1. **No Profile Image Showing**
   - Check if `profile` scope is included in OAuth request
   - Verify Google account has a profile picture set
   - Check browser console for CORS errors

2. **Image Loading Errors**
   - Ensure `referrerPolicy="no-referrer"` is set
   - Check if Google image URLs are accessible
   - Verify network connectivity

3. **Fallback Not Working**
   - Check if `getUserDisplayName()` returns valid name
   - Verify Avatar component is properly configured
   - Test with different user accounts

### Debug Steps
1. Check browser console for authentication logs
2. Use AuthDebug component to inspect user data
3. Verify OAuth scopes in network requests
4. Test with different Google accounts

## Security Considerations

- **Image URLs**: Google profile images are served from Google's CDN
- **Privacy**: Only public profile information is accessed
- **CORS**: Proper referrer policy prevents cross-origin issues
- **Fallback**: No sensitive data exposed in fallback initials

## Future Enhancements

1. **Profile Caching**: Cache profile images locally
2. **Custom Avatars**: Allow users to upload custom profile pictures
3. **Profile Management**: Full profile editing interface
4. **Social Features**: Display profile images in chat messages