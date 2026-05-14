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
      <div className="w-16 border-r bg-card flex flex-col items-center py-4 gap-4 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 flex flex-col gap-1 hover:bg-secondary"
          onClick={() => addElement('text')}
          title={t('editor.toolbar.addText')}
        >
          <Type className="h-5 w-5" />
          <span className="text-[10px]">Text</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 flex flex-col gap-1 hover:bg-secondary"
          onClick={() => setIsMediaManagerOpen(true)}
          title={t('editor.toolbar.addImage')}
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-[10px]">Image</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 flex flex-col gap-1 hover:bg-secondary"
          onClick={() => addElement('video')}
          title={t('editor.toolbar.addVideo')}
        >
          <Video className="h-5 w-5" />
          <span className="text-[10px]">Video</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 flex flex-col gap-1 hover:bg-secondary"
          onClick={() => addElement('button')}
          title={t('editor.toolbar.addButton')}
        >
          <MousePointerClick className="h-5 w-5" />
          <span className="text-[10px]">Button</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 flex flex-col gap-1 hover:bg-secondary"
          onClick={() => addElement('box')}
          title={t('editor.toolbar.addBox')}
        >
          <Box className="h-5 w-5" />
          <span className="text-[10px]">Box</span>
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