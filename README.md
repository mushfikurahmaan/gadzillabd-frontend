# GADZILLA Frontend

A modern e-commerce frontend application for gadgets and accessories, built with Next.js 14 and React.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Product Catalog**: Browse gadgets and accessories with filtering and sorting
- **Product Details**: Detailed product pages with images and specifications
- **Search Functionality**: Search for products and brands
- **Responsive Design**: Mobile-first approach, works on all devices
- **Fast Performance**: Optimized with Next.js App Router and static generation

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS Modules
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## 🏃 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gadzillabd/gadzilla-frontend.git
cd gadzilla-frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build

Create a production build:
```bash
npm run build
```

### Start Production Server

Start the production server:
```bash
npm start
```

### Linting

Run ESLint to check for code issues:
```bash
npm run lint
```

## 📁 Project Structure

```
gadzilla-frontend/
├── app/                    # Next.js App Router pages
│   ├── accessories/        # Accessories category page
│   ├── gadgets/            # Gadgets category page
│   ├── products/           # Product detail pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header/             # Navigation header
│   ├── Footer/             # Footer component
│   ├── Hero/               # Hero section
│   ├── ProductCard/        # Product card component
│   ├── FeaturedProducts/   # Featured products section
│   ├── BrandShowcase/      # Brand showcase section
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions and data
│   └── data.ts             # Product data
├── public/                 # Static assets
│   └── assets/             # Images, fonts, favicons
└── package.json           # Dependencies and scripts
```

## 🎨 Key Components

- **Header**: Navigation bar with search, cart, and user account
- **Footer**: Footer with links, social media, and company information
- **ProductCard**: Reusable product card component
- **FilterModal**: Product filtering modal
- **SortModal**: Product sorting modal
- **Hero**: Homepage hero section
- **FeaturedProducts**: Showcase of featured products
- **BrandShowcase**: Brand logos and information

## 🌐 Pages

- **Home** (`/`): Landing page with hero, featured products, and brand showcase
- **Gadgets** (`/gadgets`): Gadgets category page with filtering and sorting
- **Accessories** (`/accessories`): Accessories category page with filtering and sorting
- **Product Detail** (`/products/[id]`): Individual product detail page

## 🚢 Deployment

The project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel, and it will automatically deploy on every push to the main branch.

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📝 Environment Variables

Currently, no environment variables are required. If you need to add API endpoints or other configuration, create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=your_api_url
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

GADZILLA Development Team

## 🔗 Links

- **Repository**: [https://github.com/gadzillabd/gadzilla-frontend](https://github.com/gadzillabd/gadzilla-frontend)
- **Live Site**: [Deployed on Vercel]

---

Made with ❤️ by the GADZILLA team
