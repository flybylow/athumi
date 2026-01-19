# Athumi Solid Pod Integration - POC

A proof-of-concept (POC) application demonstrating Solid Pod integration for product ownership credentials. Built with Next.js, TypeScript, and the Solid SDK.

## Overview

Athumi enables users to authenticate with a Solid Pod provider, store product ownership credentials in their Pod, and manage their product ownership data. The application demonstrates:

- OIDC authentication with Community Solid Server
- Cookie-based session management
- RDF data storage in Solid Pods
- Product ownership credential management

## Features

✅ **Authentication**
- Login with Solid Pod provider
- Automatic account and Pod creation
- Session persistence with encrypted cookies
- WebID display and management

✅ **Product Ownership Management**
- Add product ownership credentials
- View all owned products
- Automatic container management
- RDF-based data storage

✅ **Developer Experience**
- TypeScript for type safety
- Client-side Pod operations
- Comprehensive error handling
- Auto-fill form for testing

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: React with Tailwind CSS
- **Solid Stack**:
  - `@inrupt/solid-client`: Pod operations
  - `@inrupt/solid-client-authn-browser`: Browser authentication
  - `@inrupt/vocab-common-rdf`: RDF vocabularies
- **Pod Provider**: Community Solid Server (CSS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/flybylow/athumi.git
cd athumi
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```bash
# Community Solid Server (OIDC Issuer)
NEXT_PUBLIC_SOLID_IDP=http://localhost:3000

# Next.js App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# OIDC Callback URL
NEXT_PUBLIC_REDIRECT_URL=http://localhost:3001/auth/callback

# Session encryption secret (generate with: openssl rand -hex 32)
SESSION_SECRET=your-random-secret-key-here
```

5. Start development servers:
```bash
# Run both CSS and Next.js together
npm run dev:all

# Or run separately:
npm run solid-server  # Runs CSS on port 3000
npm run dev           # Runs Next.js on port 3001
```

6. Open your browser:
- App: http://localhost:3001
- CSS: http://localhost:3000

## Usage

### First Time Setup

1. Click "Login with Solid"
2. Create an account on the Community Solid Server
3. Create a Pod (WebID will be auto-generated)
4. Authorize the application

### Adding Products

1. Ensure you're logged in
2. Fill in the product form:
   - **GTIN**: Global Trade Item Number (e.g., `9506000140445`)
   - **Product Name**: Name of the product
   - **Manufacturer ID**: DID or identifier (e.g., `did:web:cotedor.be`)
   - **Manufacturer Name**: Name of the manufacturer
   - **DPP Source URL**: URL to Digital Product Passport (e.g., `https://tabulas.eu/dpp/...`)
3. Click "Add Product Ownership"
4. Product will be saved to your Pod at `/products/{gtin}`

### Viewing Products

- Products are automatically listed after login
- List refreshes automatically after adding a product
- Each product shows: GTIN, name, manufacturer, owner, issued date, and DPP source

## Project Structure

```
athumi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── products/      # Product endpoints (prepared)
│   │   ├── auth/              # Auth pages
│   │   │   └── callback/      # OIDC callback handler
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── AuthButton.tsx     # Login/logout button
│   │   ├── ProductForm.tsx    # Add product form
│   │   ├── ProductList.tsx    # Product list display
│   │   └── ProductCard.tsx    # Product card component
│   ├── hooks/                 # React hooks
│   │   ├── useSolidSession.ts # Solid session hook
│   │   └── useProducts.ts     # Products data hook
│   └── lib/                   # Library code
│       ├── solid/             # Solid integration
│       │   ├── auth.client.ts # Browser authentication
│       │   ├── auth.server.ts # Server session management
│       │   ├── pod.client.ts  # Client-side Pod operations
│       │   └── session.ts     # Cookie encryption
│       └── schemas/           # Data schemas
│           └── product-ownership.ts  # Product schema
├── docs/                      # Documentation
│   ├── authentication-flow.md        # Phase 2 learnings
│   ├── phase-3-product-ownership.md  # Phase 3 implementation
│   ├── current-state.md              # Project status
│   └── athumi-pod-poc-reference.md   # Original POC spec
└── data/                      # CSS data (gitignored)
```

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Authentication Flow](docs/authentication-flow.md)**: Learnings from Phase 2, including OIDC flow details and common issues
- **[Phase 3: Product Ownership](docs/phase-3-product-ownership.md)**: Implementation details for product credential management
- **[Current State](docs/current-state.md)**: Project status, capabilities, and known limitations

## Development

### Available Scripts

```bash
# Run both CSS and Next.js together
npm run dev:all

# Run CSS only (port 3000)
npm run solid-server

# Run Next.js only (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SOLID_IDP` | Solid Pod provider URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Next.js app URL | Yes |
| `NEXT_PUBLIC_REDIRECT_URL` | OIDC callback URL | Yes |
| `SESSION_SECRET` | Secret for cookie encryption | Yes |

## Architecture

### Data Flow

```
User Action
  ↓
React Component
  ↓
Client-Side Pod Operation (pod.client.ts)
  ↓
Browser Session's Authenticated Fetch
  ↓
Community Solid Server
  ↓
Solid Pod Storage (RDF)
```

### Authentication Flow

1. User clicks "Login with Solid"
2. Redirect to CSS OIDC authorization
3. User creates account (first time) or logs in
4. CSS prompts to create Pod (first time)
5. User authorizes application
6. Redirect back to app with session
7. Session stored in encrypted cookie
8. User is authenticated

### Product Storage

Products are stored as RDF Things in the user's Pod:

- **Location**: `{PodRoot}/products/{gtin}`
- **Format**: RDF/Turtle
- **Schema**: Uses Schema.org, Tabulas, and GS1 vocabularies
- **Structure**: Ownership credentials with product details

## Known Limitations

- **Authorization Screen**: Appears on every login (expected due to dynamic client registration)
- **Client-Side Only**: Pod operations are client-side only (no server-side Pod ops currently)
- **No Token Extraction**: Cannot access raw tokens from browser SDK (by design)
- **No ACL Management**: Access control lists not explicitly set
- **No Sharing**: Cannot share products with other users yet
- **No Search**: No filtering or search functionality

## Troubleshooting

### "Container not found" (404)
- Container auto-creates on first product add
- Ensure user is logged in
- Verify Pod root URL is correct

### "Session does not have authenticated fetch"
- User must be logged in
- Check browser console for auth errors
- Try logging out and back in

### Products not appearing in list
- Check browser console for errors
- Verify products were saved successfully
- Check container index (may need refresh)

### Authorization screen every login
- This is expected behavior (dynamic client registration)
- See [authentication-flow.md](docs/authentication-flow.md) for details

## Future Improvements

- [ ] Server-side Pod operations
- [ ] Token refresh mechanism
- [ ] ACL management
- [ ] Product sharing
- [ ] Search and filtering
- [ ] Product editing/deletion
- [ ] Production Solid Pod provider integration
- [ ] Pre-register OIDC clients

## Contributing

This is a POC project. For questions or issues, please open an issue on GitHub.

## License

[Add your license here]

## Resources

- [Solid Project](https://solidproject.org/)
- [Inrupt SDK Documentation](https://docs.inrupt.com/developer-tools/javascript/client-libraries/)
- [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer)
- [Next.js Documentation](https://nextjs.org/docs)

## Acknowledgments

Built as a proof-of-concept to demonstrate Solid Pod integration for product ownership credentials.
