import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="msp-min-h-screen msp-flex msp-flex-col msp-items-center msp-justify-center msp-bg-gradient-to-br msp-from-gray-50 msp-to-blue-50 msp-p-6 msp-text-center">
      <div className="msp-space-y-6 msp-max-w-md">
        <div className="msp-space-y-3">
          <h1 className="msp-text-8xl msp-font-bold msp-text-blue-600">404</h1>
          <h2 className="msp-text-2xl msp-font-semibold msp-text-gray-800">Page Not Found</h2>
          <p className="msp-text-muted-foreground">The page you'msp-re msp-looking msp-for msp-doesn't exist or may have been moved.</p>
        </div>

        <div className="msp-flex msp-flex-col sm:msp-flex-row msp-gap-3 msp-justify-center">
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
