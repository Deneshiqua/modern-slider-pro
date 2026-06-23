import { useTheme } from '@/context/ThemeContext';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="msp-toaster msp-group"
      toastOptions={{
        classNames: {
          toast:
            'msp-group msp-toast group-[.toaster]:msp-bg-background group-[.toaster]:msp-text-foreground group-[.toaster]:msp-border-border group-[.toaster]:msp-shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:msp-bg-primary group-[.toast]:msp-text-primary-foreground',
          cancelButton: 'group-[.toast]:msp-bg-muted group-[.toast]:msp-text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
