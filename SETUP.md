# AI Director - Setup Instructions

## Required Packages

Install these additional packages:

```bash
npm install lucide-react @google/generative-ai
```

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
STABILITY_API_KEY=your_stability_api_key_here
```

### Getting API Keys

1. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Stability AI Key**: Get from [Stability AI Platform](https://platform.stability.ai/account/keys)

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-outline/route.ts  # Gemini API endpoint
│   │   └── generate-image/route.ts    # Stability AI endpoint
│   ├── outline/page.tsx               # Timeline Editor (Page 2)
│   ├── studio/page.tsx                # Storyboard Studio (Page 3)
│   ├── page.tsx                       # Landing Page (Page 1)
│   ├── layout.tsx                     # Root layout with ProjectProvider
│   └── globals.css                    # Global styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Chip.tsx
│   │   └── Textarea.tsx
│   ├── SceneCard.tsx                  # Outline editor card
│   └── StoryboardCard.tsx             # Studio grid card
├── context/
│   └── ProjectContext.tsx             # Global state management
├── lib/
│   └── api.ts                         # API helper functions
└── types/
    └── index.ts                       # TypeScript definitions
```

## Features

- **Dual-Mode Generation**: Creates both Standard (Hollywood) and Experimental (Arthouse) versions
- **AI-Powered**: Uses Google Gemini for story outlines and Stability AI for visuals
- **Interactive Editor**: Edit scenes before generating images
- **Professional Output**: Includes technical details and director's notes
- **Export Functionality**: Download project data as JSON
