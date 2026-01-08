# Notes PWA - Offline-First Note Taking Application

A Progressive Web App (PWA) for note-taking that works seamlessly offline and automatically synchronizes when online. Built with Next.js, TypeScript, and Supabase.

## Features

### Core Functionality
- **Create Notes**: Add new notes with title and content
- **View Notes**: Display notes in grid or list view
- **Edit Notes**: Modify existing notes
- **Delete Notes**: Remove notes with confirmation dialog
- **Search/Filter**: Search notes by title or content
- **Timestamps**: Track creation and modification times

### Offline-First Capabilities
- Full functionality without internet connection
- All CRUD operations work offline
- Data persists in IndexedDB after closing browser
- Automatic sync when connection is restored

### Data Synchronization
- Automatic background sync with server
- Background Sync API integration
- Clear sync status indicators (synced, pending, syncing, failed)
- Pending operations counter
- Manual sync button

### Conflict Resolution
**Strategy: Last Write Wins (LWW)**

When the same note is modified both locally and on the server, the version with the most recent `modified_at` timestamp takes precedence:

1. If local modification is newer → keep local changes, mark for sync
2. If server modification is newer → use server version

This approach was chosen because:
- Simple and predictable behavior
- Works well for single-user scenarios
- No merge conflicts to resolve manually
- Timestamp comparison is deterministic

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Backend**: Supabase (REST API)
- **Styling**: Tailwind CSS
- **Offline Storage**: IndexedDB (via `idb` library)
- **PWA**: Custom Service Worker
- **Testing**: Jest + React Testing Library

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with PWA meta tags
│   ├── page.tsx           # Main notes page
│   ├── offline/           # Offline fallback page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Modal.tsx
│   │   ├── SyncStatus.tsx
│   │   ├── OnlineIndicator.tsx
│   │   └── SearchInput.tsx
│   └── notes/             # Note-specific components
│       ├── NoteCard.tsx
│       ├── NoteForm.tsx
│       ├── NotesList.tsx
│       └── DeleteConfirmModal.tsx
├── hooks/                  # Custom React hooks
│   ├── useNotes.ts        # Notes CRUD and sync
│   ├── useOnlineStatus.ts # Online/offline detection
│   └── useServiceWorker.ts # SW registration
├── services/              # Business logic
│   ├── api.ts             # Supabase API client
│   ├── db.ts              # IndexedDB operations
│   └── sync.ts            # Sync service
├── types/                 # TypeScript types
│   └── note.ts            # Note interfaces
├── utils/                 # Utility functions
│   ├── cn.ts              # Class name utility
│   └── date.ts            # Date formatting
├── lib/                   # Configuration
│   └── constants.ts       # API keys, constants
└── __tests__/             # Unit tests
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notes-pwa
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
Create a `.env.local` file:
```env
NEXT_PUBLIC_USER_ID=your-email@example.com
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## API Configuration

The app is pre-configured with Supabase credentials. Update `src/lib/constants.ts` if needed:

```typescript
export const SUPABASE_URL = 'https://scwaxiuduzyziuyjfwda.supabase.co/rest/v1';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPERBASE_ANON_KEY;
export const USER_ID = process.env.NEXT_PUBLIC_USER_ID || 'your-email@example.com';
```

## Data Model

Each note contains:
- `id` - UUID (server-generated)
- `user_id` - User identifier (email)
- `title` - Note title (max 100 characters)
- `content` - Note content (max 5000 characters)
- `created_at` - ISO 8601 timestamp
- `modified_at` - ISO 8601 timestamp

## Offline Architecture

### Service Worker
- Caches static assets for offline access
- Network-first strategy for pages
- Cache-first with background update for assets
- Registers background sync for failed operations

### IndexedDB Structure
- **notes**: Stores all notes with sync metadata
- **pending_operations**: Queue of operations to sync
- **sync_meta**: Last sync timestamp and metadata

### Sync Flow
1. User performs action (create/update/delete)
2. Changes saved to IndexedDB immediately
3. Pending operation created
4. If online: sync immediately
5. If offline: register background sync
6. When online: process pending operations
7. Resolve conflicts using LWW strategy

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Tests cover:
- Utility functions (date formatting, class names)
- API service methods
- UI components
- Type constraints

## Testing Offline Mode

1. Open browser DevTools
2. Go to Network tab
3. Set throttling to "Offline"
4. Test creating, editing, and deleting notes
5. Go back online and verify sync

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_USER_ID`
4. Deploy

### Other Platforms
Ensure the platform supports:
- Node.js 18+
- Static file serving for PWA assets
- HTTPS (required for Service Workers)

## Browser Support

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

Service Worker and Background Sync require:
- Chrome 49+ (full support)
- Firefox 44+ (partial, no Background Sync)
- Safari 11.1+ (partial)

## Trade-offs & Decisions

1. **Last Write Wins Conflict Resolution**: Chose simplicity over complexity. For a single-user note app, this is sufficient. A multi-user app might need CRDT or manual merge.

2. **Custom Service Worker vs next-pwa**: Used custom SW for full control over caching strategies and background sync implementation.

3. **IndexedDB vs localStorage**: IndexedDB provides better storage limits, async API, and proper database features.

4. **SVG Icons**: Used SVG for PWA icons for scalability. PNG alternatives can be generated if needed for older browsers.

## Author

Samuel Adeniyi

## License

MIT License
