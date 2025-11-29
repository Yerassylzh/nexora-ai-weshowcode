import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Part } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, modifyPrompt, existingImage } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let enhancedPrompt = prompt;

    // Apply style enhancements
    if (style === 'Реализм') {
      enhancedPrompt = `Cinematic, 8k, photorealistic, masterpiece, professional photography. ${prompt}`;
    } else if (style === 'Аниме') {
      enhancedPrompt = `Anime style, vibrant colors, studio ghibli aesthetic. ${prompt}`;
    } else if (style === '3D Рендер') {
      enhancedPrompt = `3D render, octane render, unreal engine, highly detailed. ${prompt}`;
    } else if (style === '2D Вектор') {
      enhancedPrompt = `2D vector art, flat design, clean lines, modern illustration. ${prompt}`;
    } else if (style === 'Киберпанк') {
      enhancedPrompt = `Cyberpunk aesthetic, neon lights, futuristic, dystopian. ${prompt}`;
    } else if (style === 'ЧБ Нуар') {
      enhancedPrompt = `Black and white, film noir, high contrast, dramatic shadows. ${prompt}`;
    }

    // If modification is requested, append it
    if (modifyPrompt) {
      enhancedPrompt = `Modify this image: ${modifyPrompt}`;
    }

    // const chat = ai.chats.create({
    //   model: 'gemini-3-pro-image-preview',
    //   config: {
    //     responseModalities: ['IMAGE'],
    //     tools: [{googleSearch: {}}],
    //   },
    // });

    // Build message with existing image if provided
    let messageContent: any = { message: enhancedPrompt };
    
    if (existingImage) {
      // Extract base64 data from data URL
      const base64Data = existingImage.split(',')[1];
      const mimeType = existingImage.split(':')[1].split(';')[0];
      
      messageContent = {
        message: enhancedPrompt,
        image: {
          mimeType,
          data: base64Data,
        },
      };
    }

    // const response = await chat.sendMessage(messageContent);

    // console.log(await ai.models.list())

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content?.parts as Part[];
      
      for (const part of parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${imageData}`;
          return NextResponse.json({ imageUrl });
        }
      }
    }

    // Fallback: If no image in response
    console.error('No image data in response');
    return NextResponse.json(
      { error: 'No image generated' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
