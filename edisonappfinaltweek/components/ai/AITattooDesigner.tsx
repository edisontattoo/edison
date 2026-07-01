

import React, { useState, useCallback, useEffect } from 'react';
import { Button, Input, TextArea, Spinner, Card, SparklesIcon, ArrowDownTrayIcon } from '../common/UIElements';
import { generateText, generateImage } from '../../services/geminiService';

const AITattooDesigner: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('');
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAiAvailable, setIsAiAvailable] = useState(false);

  useEffect(() => {
    if (process.env.API_KEY) {
      setIsAiAvailable(true);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!keywords) {
      setError('Please enter some keywords or a theme.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDescription('');
    setImageUrl(null);

    const promptParts = [
        `Tattoo design idea based on keywords: "${keywords}".`,
        style ? `Artistic style: "${style}".` : '',
        colors ? `Color scheme: "${colors}".` : '',
        `Provide a vivid and detailed description suitable for a tattoo artist to understand the concept and for an AI to generate an image from. Focus on visual elements, composition, and mood. The output should be only the description itself.`
    ].filter(part => part).join(' ');

    const systemInstruction = "You are an expert tattoo design conceptualizer. Generate creative and visually descriptive tattoo ideas that are suitable as prompts for an AI image generator.";

    try {
      const generatedDescription = await generateText(promptParts, systemInstruction);
      
      if (generatedDescription && !generatedDescription.startsWith('Error')) {
        setDescription(generatedDescription);

        // Use the detailed description generated above as the prompt for the image.
        // This provides a much richer context for the image generator.
        const generatedImageUrl = await generateImage(generatedDescription);
        setImageUrl(generatedImageUrl);
      } else {
        // Handle cases where description generation fails gracefully
        setError(generatedDescription || 'Failed to generate a description. Please try again.');
        setDescription(''); // Clear any partial or error message
      }

    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred while generating the tattoo idea. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [keywords, style, colors]);
  
  if (!isAiAvailable) {
    return (
      <Card className="p-6 md:p-8">
        <div className="flex items-center mb-6">
          <SparklesIcon className="w-8 h-8 text-gray-500 mr-3" />
          <h2 className="text-2xl font-orbitron text-gray-500">AI Tattoo Designer Unavailable</h2>
        </div>
        <p className="text-gray-400">
          The AI features are currently disabled because an API key for the Gemini service has not been configured.
        </p>
      </Card>
    );
  }


  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center mb-6">
          <SparklesIcon className="w-8 h-8 text-cyan-400 mr-3" />
          <h2 className="text-2xl font-orbitron text-cyan-400">AI Tattoo Designer</h2>
        </div>
        <p className="text-gray-300 text-sm">
          Describe your vision, and let our AI help you brainstorm unique tattoo ideas. Provide keywords, desired style, and color preferences.
        </p>
        
        <Input
          label="Keywords / Theme (e.g., 'phoenix rising from ashes', 'geometric wolf')"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Enter keywords or theme"
          required
        />
        <Input
          label="Artistic Style (e.g., 'watercolor', 'fine line', 'neo-traditional')"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Optional: specify style"
        />
        <Input
          label="Color Preference (e.g., 'black and grey', 'vibrant full color', 'monochromatic blue')"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="Optional: specify colors"
        />
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? 'Generating...' : 'Generate Idea'}
        </Button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>

      {isLoading && !description && (
        <div className="mt-8 text-center">
          <Spinner size="lg" />
          <p className="text-gray-400 mt-2">Crafting your idea...</p>
        </div>
      )}

      {description && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-xl font-orbitron text-cyan-400 mb-3">Generated Idea:</h3>
          {imageUrl && (
            <div className="mb-4 flex justify-center">
              <img src={imageUrl} alt="AI Generated Tattoo Concept" className="rounded-lg shadow-lg max-w-sm max-h-96 object-contain"/>
            </div>
          )}
          <TextArea
            value={description}
            readOnly
            rows={8}
            className="bg-gray-700 border-gray-600 text-gray-200"
          />
           <p className="text-xs text-gray-500 mt-2">Note: AI-generated images are conceptual and may require artistic interpretation by a tattoo artist.</p>
           {imageUrl && (
            <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h4 className="text-md font-semibold text-cyan-300 mb-2 flex items-center">
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    How to Save Your Design
                </h4>
                <div className="text-xs text-gray-400 space-y-2">
                    <div>
                        <p className="font-semibold text-gray-300">On a Computer:</p>
                        <p>Right-click on the image above and choose "Save Image As...".</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-300">On a Phone/Tablet:</p>
                        <p>Press and hold your finger on the image, then select "Save Image" or "Add to Photos".</p>
                    </div>
                </div>
            </div>
            )}
        </div>
      )}
    </Card>
  );
};

export default AITattooDesigner;