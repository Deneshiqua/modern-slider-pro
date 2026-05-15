import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { Type, Image as ImageIcon, MousePointerClick, Box, Video } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import MediaManager from './MediaManager';

const Sidebar = () => {
  const { addElement } = useEditor();
  const { t } = useLanguage();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  const handleImageSelect = (url: string) => {
    addElement('image', { content: url });
  };

  return (
    <>
      <div className="msp-w-16 msp-border-r msp-bg-card msp-flex msp-flex-col msp-items-center msp-py-4 msp-gap-4 msp-shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="msp-h-12 msp-w-12 msp-flex msp-flex-col msp-gap-1 hover:msp-bg-secondary"
          onClick={() => addElement('text')}
          title={t('editor.toolbar.addText')}
        >
          <Type className="msp-h-5 msp-w-5" />
          <span className="msp-text-[10px]">Text</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="msp-h-12 msp-w-12 msp-flex msp-flex-col msp-gap-1 hover:msp-bg-secondary"
          onClick={() => setIsMediaManagerOpen(true)}
          title={t('editor.toolbar.addImage')}
        >
          <ImageIcon className="msp-h-5 msp-w-5" />
          <span className="msp-text-[10px]">Image</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="msp-h-12 msp-w-12 msp-flex msp-flex-col msp-gap-1 hover:msp-bg-secondary"
          onClick={() => addElement('video')}
          title={t('editor.toolbar.addVideo')}
        >
          <Video className="msp-h-5 msp-w-5" />
          <span className="msp-text-[10px]">Video</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="msp-h-12 msp-w-12 msp-flex msp-flex-col msp-gap-1 hover:msp-bg-secondary"
          onClick={() => addElement('button')}
          title={t('editor.toolbar.addButton')}
        >
          <MousePointerClick className="msp-h-5 msp-w-5" />
          <span className="msp-text-[10px]">Button</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="msp-h-12 msp-w-12 msp-flex msp-flex-col msp-gap-1 hover:msp-bg-secondary"
          onClick={() => addElement('box')}
          title={t('editor.toolbar.addBox')}
        >
          <Box className="msp-h-5 msp-w-5" />
          <span className="msp-text-[10px]">Box</span>
        </Button>
      </div>

      <MediaManager 
        isOpen={isMediaManagerOpen} 
        onClose={() => setIsMediaManagerOpen(false)} 
        onSelect={handleImageSelect}
      />
    </>
  );
};

export default Sidebar;