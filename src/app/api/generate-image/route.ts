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

    const apiKeysString = process.env.MODELSLAB_API_KEY;
    if (!apiKeysString) {
      console.error('MODELSLAB_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured. Please add MODELSLAB_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Split API keys by comma (supports multiple keys for rotation)
    const apiKeys = apiKeysString.split(',').map(key => key.trim());
    console.log(`Found ${apiKeys.length} API key(s) for rotation`);

    let enhancedPrompt = prompt;
    let negativePrompt = 'blurry, bad quality, distorted, ugly, low resolution';

    // Apply style enhancements
    if (style === 'Реализм') {
      enhancedPrompt = `Cinematic, 8k, photorealistic, masterpiece, professional photography. ${prompt}`;
      negativePrompt += ', cartoon, anime, illustration, painting';
    } else if (style === 'Аниме') {
      enhancedPrompt = `Anime style, vibrant colors, studio ghibli aesthetic, detailed anime art. ${prompt}`;
      negativePrompt += ', photorealistic, 3d render, photograph';
    } else if (style === '3D Рендер') {
      enhancedPrompt = `3D render, octane render, unreal engine, highly detailed 3D model. ${prompt}`;
      negativePrompt += ', 2d, flat, painting, sketch';
    } else if (style === '2D Вектор') {
      enhancedPrompt = `2D vector art, flat design, clean lines, modern illustration, minimalist. ${prompt}`;
      negativePrompt += ', photorealistic, 3d, complex textures';
    } else if (style === 'Киберпанк') {
      enhancedPrompt = `Cyberpunk aesthetic, neon lights, futuristic, dystopian, high tech low life. ${prompt}`;
      negativePrompt += ', natural, rural, vintage, historical';
    } else if (style === 'ЧБ Нуар') {
      enhancedPrompt = `Black and white, film noir, high contrast, dramatic shadows, monochrome. ${prompt}`;
      negativePrompt += ', colorful, vibrant, bright colors';
    }

    console.log('Generating image with prompt:', enhancedPrompt);

    // Try each API key in sequence until one works
    let lastError = null;
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`Trying API key ${i + 1}/${apiKeys.length}...`);

      try {
        // Call ModelsLab API
        const response = await fetch('https://modelslab.com/api/v6/images/text2img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: apiKey,
            model_id: 'flux',
            prompt: enhancedPrompt,
            negative_prompt: negativePrompt,
            width: '1024',
            height: '768',
            samples: '1',
            num_inference_steps: '20',
            safety_checker: 'no',
            guidance_scale: 7.5,
            clip_skip: '2',
            seed: null,
            base64: false,
            temp: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API key ${i + 1} failed with status ${response.status}:`, errorText);
          lastError = errorText;
          
          // If this is not the last key, try the next one
          if (i < apiKeys.length - 1) {
            console.log('Trying next API key...');
            continue;
          }
          
          // This was the last key and it failed
          return NextResponse.json(
            { error: `All API keys exhausted. Last error: ${response.status}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        console.log(`API key ${i + 1} response:`, data);

        // Check if generation was successful (instant response)
        if (data.status === 'success' && data.output && data.output.length > 0) {
          const imageUrl = data.output[0];
          console.log(`Image generated successfully with API key ${i + 1}:`, imageUrl);
          return NextResponse.json({ imageUrl });
        } 
        
        // Handle async processing - return future link immediately
        if (data.status === 'processing' && data.future_links && data.future_links.length > 0) {
          const imageUrl = data.future_links[0];
          console.log(`Image processing with API key ${i + 1} (ETA: ${data.eta}s). Returning future link:`, imageUrl);
          
          // Return the future link immediately - browser will load it when ready
          return NextResponse.json({ imageUrl });
        }
        
        // If we got here, the response was not successful
        console.error(`API key ${i + 1} returned unexpected response:`, data);
        lastError = data.message || 'Unexpected response format';
        
        // Try next key if available
        if (i < apiKeys.length - 1) {
          console.log('Trying next API key...');
          continue;
        }
      } catch (error: any) {
        console.error(`API key ${i + 1} threw error:`, error);
        lastError = error.message;
        
        // Try next key if available
        if (i < apiKeys.length - 1) {
          console.log('Trying next API key...');
          continue;
        }
      }
    }

    // All keys failed
    return NextResponse.json(
      { error: `All ${apiKeys.length} API key(s) failed. Last error: ${lastError}` },
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
