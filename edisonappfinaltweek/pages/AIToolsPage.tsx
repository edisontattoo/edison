

import React from 'react';
import AITattooDesigner from '../components/ai/AITattooDesigner';
import AIChatBot from '../components/ai/AIChatBot';
import { SparklesIcon } from '../components/common/UIElements';

const AIToolsPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <SparklesIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-4xl font-orbitron text-white">AI-Powered Tools</h1>
        <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">
          Explore our innovative AI tools designed to enhance your studio experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <section id="ai-tattoo-designer">
          <AITattooDesigner />
        </section>
        
        <section id="ask-the-pro">
          <AIChatBot />
        </section>
      </div>
    </div>
  );
};

export default AIToolsPage;