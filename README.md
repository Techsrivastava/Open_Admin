# Travel Agency Dashboard

A modern, feature-rich dashboard application for travel agencies built with Next.js 15 and React 19. Developed by Adarsh Srivastava.

## 🌟 Features

- **Modern Tech Stack**: Built with Next.js 15 and React 19
- **Responsive Design**: Fully responsive UI that works seamlessly across all devices
- **Theme Support**: Dark/Light mode support using next-themes
- **Rich UI Components**: Utilizes Radix UI components for accessible and customizable UI elements
- **Data Visualization**: Integrated with Recharts for beautiful data visualization
- **Form Handling**: Robust form management with React Hook Form and Zod validation
- **Type Safety**: Written in TypeScript for better development experience and type safety
- **Modern Styling**: Tailwind CSS for utility-first styling with animations
- **Toast Notifications**: Interactive notifications using Sonner and react-hot-toast
- **Carousel Support**: Image carousels powered by Embla Carousel
- **Date Handling**: Advanced date manipulation with date-fns
- **API Integration**: Axios for efficient API communications

## 💼 Core Functionality

### 1. Customer Management
- Complete customer database with detailed profiles
- Customer statistics and analytics dashboard
- Search and filter customers by name, email, or location
- Track customer bookings and spending history
- Customer status monitoring (Active/Inactive)
- Contact information management
- Customer lifetime value tracking

### 2. Booking Management
- Comprehensive booking system
- Track booking status and history
- Process new bookings and modifications
- Booking analytics and reporting
- Payment tracking and management

### 3. Package Management
- Create and manage travel packages
- Package customization options
- Pricing and availability management
- Package analytics and performance tracking
- Seasonal package management

### 4. Trek Management
- Specialized trek package management
- Trek route planning and management
- Difficulty level categorization
- Season-wise trek availability
- Equipment and requirements tracking

### 5. Char Dham Management
- Dedicated Char Dham pilgrimage management
- Route planning and scheduling
- Accommodation arrangements
- Religious ceremony coordination
- Special requirements handling

### 6. Guide Management
- Guide profile management
- Expertise and specialization tracking
- Availability calendar
- Performance tracking
- Guide assignment system

### 7. Lead Management
- Lead capture and tracking
- Lead qualification system
- Follow-up management
- Conversion tracking
- Lead source analytics

### 8. Coupon Management
- Create and manage promotional coupons
- Discount tracking
- Usage analytics
- Validity period management
- Customer-specific promotions

### 9. Advertisement Management
- Campaign creation and management
- Ad performance tracking
- Budget management
- ROI analytics
- Target audience management

## 📊 Analytics & Reporting

- **Customer Analytics**
  - Total customer count and growth
  - Active customer percentage
  - Average bookings per customer
  - Customer lifetime value
  - Geographic distribution

- **Business Analytics**
  - Revenue tracking
  - Booking trends
  - Package performance
  - Seasonal analysis
  - Conversion rates

- **Marketing Analytics**
  - Campaign performance
  - Lead conversion rates
  - Coupon effectiveness
  - Customer acquisition cost
  - ROI tracking

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd travel-agency-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add necessary environment variables.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
travel-agency-dashboard/
├── app/                # Next.js app directory
├── components/         # Reusable UI components
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and configurations
├── public/           # Static assets
├── styles/           # Global styles and Tailwind configurations
├── api/              # API routes and services
└── types/            # TypeScript type definitions
```

## 🎨 UI Components

The dashboard includes a rich set of UI components from Radix UI:
- Accordions
- Alert Dialogs
- Avatars
- Checkboxes
- Dropdowns
- Navigation Menus
- Modals
- Tooltips
- And many more...

## 🔒 Environment Variables

Required environment variables:
```env
# Add your environment variables here
API_KEY=your_api_key
API_BASE_URL=your_api_base_url
```

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop screens
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

Developed by **Adarsh Srivastava**

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for the accessible component primitives
- Tailwind CSS team for the utility-first CSS framework
- All other open-source contributors 