import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { topic, style, sceneCount } = await request.json();

    if (!topic || !style || !sceneCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'API key not configured. Please add GEMINI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({apiKey});

    const prompt = `You are a professional film director. Create a detailed filming plan for a movie about: "${topic}".

Generate TWO different versions of the same story:
1. STANDARD: Hollywood-style, linear narrative, realistic and cinematic
2. EXPERIMENTAL: Arthouse, abstract, non-linear, artistic

For each version, create exactly ${sceneCount} scenes.

For each scene, provide:
- title: A compelling scene title
- description: What happens in this scene (2-3 sentences)
- visualPrompt: A detailed prompt optimized for image generation (include camera angles, lighting, mood, colors)
- tags: Array of 3-5 technical tags (e.g., "Wide Shot", "Golden Hour", "Low Angle", "Neon Lighting", "ISO 800")
- directorsNote: Explain WHY you chose this specific camera angle, lighting, or composition (1-2 sentences)

Visual style context: ${style}

Return ONLY a valid JSON object with this exact structure:
{
  "standard": [array of scenes],
  "experimental": [array of scenes]
}

Each scene object must have: title, description, visualPrompt, tags (array), directorsNote`;

    console.log('Calling Gemini API...');
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const responseText = response.text as string;
    console.log('Gemini response received, length:', responseText.length);
    
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    let generatedData;
    try {
      generatedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse AI response. The AI returned invalid JSON.' },
        { status: 500 }
      );
    }

    const addIds = (scenes: any[]) => {
      return scenes.map((scene, index) => ({
        ...scene,
        id: `${Date.now()}-${index}`,
        order: index + 1,
        imageUrl: null,
        isLoading: false,
      }));
    };

    const projectData = {
      topic,
      style,
      sceneCount,
      standard: addIds(generatedData.standard || []),
      experimental: addIds(generatedData.experimental || []),
    };

    return NextResponse.json(projectData);
  } catch (error: any) {
    console.error('Error generating outline:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate outline',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
