# Carnival Schedule

A modern, interactive carnival event scheduling and management application built with Next.js, featuring real-time updates, interactive maps, and comprehensive event management tools.

## Features

- 🎪 **Interactive Carnival Map** - Visual representation of carnival layout with event locations
- 📅 **Event Scheduling** - Comprehensive event management with time slots and details
- 🎨 **Modern UI** - Beautiful, responsive interface built with Radix UI and Tailwind CSS
- 🌙 **Dark/Light Theme** - Theme switching capability for better user experience
- ⏰ **Live Clock** - Real-time clock display for event timing
- 📱 **Mobile Responsive** - Optimized for both desktop and mobile devices
- 🎯 **Event Details Modal** - Detailed view of individual events
- 📊 **Schedule Board** - Clear overview of all scheduled events

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Backend API**: Python FastAPI (included in `python-api/` directory)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.9+ (for the Python API)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/carnival-schedule.git
cd carnival-schedule
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the Python API:
```bash
cd python-api
pip install -r requirements.txt
```

4. Run the development server:
```bash
pnpm dev
```

5. Run the Python API (in a separate terminal):
```bash
cd python-api
python main.py
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
carnival-schedule/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature-specific components
├── lib/                   # Utility functions and stores
├── hooks/                 # Custom React hooks
├── python-api/            # Python FastAPI backend
└── public/                # Static assets
```

## Components

- **CarnivalMap**: Interactive map component for visualizing carnival layout
- **EventManager**: Main event management interface
- **ScheduleBoard**: Displays scheduled events in a grid layout
- **EventDetailModal**: Detailed view for individual events
- **LiveClock**: Real-time clock component
- **MapEditor**: Tool for editing carnival map layouts

## API

The application includes a Python FastAPI backend located in the `python-api/` directory that provides:
- Event CRUD operations
- Real-time data synchronization
- Data persistence

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
