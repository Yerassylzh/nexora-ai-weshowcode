import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Stability API key not configured' },
        { status: 500 }
      );
    }

    let enhancedPrompt = prompt;

    if (style === 'Реализм') {
      enhancedPrompt = `Cinematic, 8k, photorealistic, masterpiece, professional photography, ${prompt}`;
    } else if (style === 'Аниме') {
      enhancedPrompt = `Anime style, vibrant colors, studio ghibli aesthetic, ${prompt}`;
    } else if (style === '3D Рендер') {
      enhancedPrompt = `3D render, octane render, unreal engine, highly detailed, ${prompt}`;
    } else if (style === '2D Вектор') {
      enhancedPrompt = `2D vector art, flat design, clean lines, modern illustration, ${prompt}`;
    } else if (style === 'Киберпанк') {
      enhancedPrompt = `Cyberpunk aesthetic, neon lights, futuristic, dystopian, ${prompt}`;
    } else if (style === 'ЧБ Нуар') {
      enhancedPrompt = `Black and white, film noir, high contrast, dramatic shadows, ${prompt}`;
    }

    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('output_format', 'png');
    formData.append('aspect_ratio', '16:9');

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*',
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
