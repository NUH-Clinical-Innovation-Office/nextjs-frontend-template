import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const colorPalette = [
  {
    name: 'Dark Blue',
    hex: '#002f6c',
    description: 'Primary — main brand color',
    bg: 'bg-primary',
    text: 'text-primary-foreground',
  },
  {
    name: 'Light Blue',
    hex: '#178fd7',
    description: 'Info — highlights & links',
    bg: 'bg-info',
    text: 'text-info-foreground',
  },
  {
    name: 'Orange',
    hex: '#e57200',
    description: 'Highlight — CTAs & badges',
    bg: 'bg-highlight',
    text: 'text-highlight-foreground',
  },
  {
    name: 'Red',
    hex: '#e4002b',
    description: 'Destructive — alerts & warnings',
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
  },
];

export function ColorPaletteShowcase() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Brand Colour Palette</h2>
      <p className="text-muted-foreground">
        The four NUHS brand colours, applied consistently across light and dark modes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {colorPalette.map((color) => (
          <Card key={color.hex} className="overflow-hidden py-0 gap-0">
            <CardHeader className={`${color.bg} ${color.text} h-25 flex items-end p-3`}>
              <span className="font-mono text-xs font-medium">{color.hex}</span>
            </CardHeader>
            <CardContent className="p-3">
              <CardTitle className="text-sm font-semibold">{color.name}</CardTitle>
              <CardDescription className="text-xs">{color.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
