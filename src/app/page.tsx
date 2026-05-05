'use client';

import { BasicComponentsShowcase } from '@/components/molecules/basic-components-showcase';
import { ColorPaletteShowcase } from '@/components/molecules/color-palette-showcase';
import { FeedbackShowcase } from '@/components/molecules/feedback-showcase';
import { Footer } from '@/components/molecules/footer';
import { FormsShowcase } from '@/components/molecules/forms-showcase';
import { Header } from '@/components/molecules/header';
import { HeroShowcase } from '@/components/molecules/hero-showcase';
import { NavigationShowcase } from '@/components/molecules/navigation-showcase';
import { OverlaysShowcase } from '@/components/molecules/overlays-showcase';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Home() {
  return (
    <TooltipProvider>
      <div className="font-sans min-h-screen bg-background text-foreground">
        <Header />
        <main className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-12">
          <HeroShowcase />
          <ColorPaletteShowcase />
          <BasicComponentsShowcase />
          <NavigationShowcase />
          <FormsShowcase />
          <OverlaysShowcase />
          <FeedbackShowcase />
        </main>
        <Footer />
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
