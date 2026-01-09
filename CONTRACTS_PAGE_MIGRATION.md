# Contracts Page Migration

**Date**: January 9, 2026  
**Status**: ✅ Complete  
**Changes**: Renamed "dashboard" to "contracts" and fixed static params issue

## Issues Fixed

### 1. Static Params Error
**Error**: "Page cannot use both 'use client' and export function 'generateStaticParams()'"

**Solution**: 
- Separated server and client components
- Server component (`page.tsx`) exports `generateStaticParams()`
- Client component (`ContractsPageClient.tsx`) handles interactivity

### 2. Route Naming
**Change**: `/dashboard` → `/contracts`

**Reason**: 
- More semantic naming
- Better reflects the page content
- Clearer user intent

## Architecture

### Server Component
**File**: `apps/web/src/app/[lang]/contracts/page.tsx`

```typescript
export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}

export default function ContractsPage() {
  return <ContractsPageClient />;
}
```

**Responsibilities**:
- Export `generateStaticParams()` for static generation
- Render client component
- No "use client" directive

### Client Component
**File**: `apps/web/src/app/[lang]/contracts/ContractsPageClient.tsx`

```typescript
'use client';

export default function ContractsPageClient() {
  // Client-side logic
  // State management
  // Event handlers
}
```

**Responsibilities**:
- Handle client-side state
- Load contract data
- Manage Web3 settings dialog
- Render dashboard UI

## Files Created

1. `apps/web/src/app/[lang]/contracts/page.tsx`
   - Server component with static params
   - Minimal, clean implementation

2. `apps/web/src/app/[lang]/contracts/ContractsPageClient.tsx`
   - Client component with all interactivity
   - Data loading and state management

## Files Modified

1. `apps/web/src/components/HeaderClient.tsx`
   - Updated link from `/dashboard` to `/contracts`
   - Updated label to "Contracts"

## Files Deleted

1. `apps/web/src/app/[lang]/dashboard/page.tsx`
   - Old dashboard page (replaced by contracts page)

## URL Changes

**Before**:
```
http://localhost:3001/en/dashboard
http://localhost:3001/es/dashboard
http://localhost:3001/pt/dashboard
http://localhost:3001/cl/dashboard
```

**After**:
```
http://localhost:3001/en/contracts
http://localhost:3001/es/contracts
http://localhost:3001/pt/contracts
http://localhost:3001/cl/contracts
```

## Navigation

The "Contracts" button in the header now links to:
```
/${locale}/contracts
```

## Static Generation

Next.js will pre-generate static pages for:
- `/en/contracts`
- `/es/contracts`
- `/pt/contracts`
- `/cl/contracts`

## Features

✅ No webpack errors  
✅ Proper static generation  
✅ Client-side interactivity  
✅ Semantic URL naming  
✅ Multi-language support  
✅ Responsive design  

## How It Works

1. **Build Time**:
   - Next.js calls `generateStaticParams()`
   - Generates static HTML for each language
   - Creates `/en/contracts`, `/es/contracts`, etc.

2. **Runtime**:
   - User navigates to `/en/contracts`
   - Server serves pre-generated HTML
   - Client component hydrates
   - Contract data loads from JSON
   - Dashboard renders

## Performance

✅ Instant page loads (static HTML)  
✅ No server processing needed  
✅ CDN-friendly  
✅ Better SEO  
✅ Reduced server load  

## Testing

### Development
```bash
npm run dev
# Visit http://localhost:3001/en/contracts
```

### Production Build
```bash
npm run build
# Generates static pages for all languages
npm run start
# Serves static pages
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Backward Compatibility

If users have bookmarks to `/dashboard`:
- Consider adding a redirect
- Or update documentation

To add redirect (optional):
```typescript
// apps/web/src/app/[lang]/dashboard/page.tsx
import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return ["en", "es", "pt", "cl"].map((lang) => ({ lang }));
}

export default function DashboardRedirect({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/contracts`);
}
```

## Summary

The migration from "dashboard" to "contracts" resolves the static params error by:

1. **Separating concerns**:
   - Server component handles static generation
   - Client component handles interactivity

2. **Improving naming**:
   - `/contracts` is more semantic
   - Better reflects page content
   - Clearer user intent

3. **Maintaining functionality**:
   - All features work as before
   - Same UI and interactions
   - Same data loading

The contracts page is now properly configured for Next.js static export and ready for production deployment.

---

**Status**: ✅ Complete  
**Ready for**: Build and deployment  
**URL**: `http://localhost:3001/[lang]/contracts`
