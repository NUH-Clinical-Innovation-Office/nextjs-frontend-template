'use client';

import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/button';
import { CheckboxAtom } from '@/components/atoms/checkbox-atom';
import { ExternalLink } from '@/components/atoms/external-link';
import { InputAtom } from '@/components/atoms/input-atom';
import { LabelAtom } from '@/components/atoms/label-atom';
import { RadioGroupAtom, RadioGroupItemAtom } from '@/components/atoms/radio-group-atom';
import { SliderAtom } from '@/components/atoms/slider-atom';
import { SwitchAtom } from '@/components/atoms/switch-atom';
import { TextareaAtom } from '@/components/atoms/textarea-atom';
import { ModeToggle } from '@/components/molecules/mode-toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(45);
  const [sliderValue, setSliderValue] = useState([50]);
  const [toggleState, setToggleState] = useState(false);
  const [toggleBold, setToggleBold] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('option-1');
  const [selectedCheckbox, setSelectedCheckbox] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <TooltipProvider>
      <div className="font-sans min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border px-8 py-4 flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/nuh-logo.png"
              alt="NUH - National University Hospital"
              width={160}
              height={40}
              style={{ height: 'auto' }}
              className="dark:hidden"
              priority
            />
            <Image
              src="/nuh-logo-dark.png"
              alt="NUH - National University Hospital"
              width={160}
              height={40}
              style={{ height: 'auto' }}
              className="hidden dark:block"
              priority
            />
          </Link>
          <ModeToggle />
        </header>

        <main className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-12">
          {/* Hero */}
          <section className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit">
              Frontend Template
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">National University Hospital</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              A Next.js frontend template styled with shadcn/ui and the NUH brand identity — ready
              for building internal tools and patient-facing applications.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild size="lg">
                <ExternalLink href="https://www.nuh.com.sg">Visit NUH</ExternalLink>
              </Button>
              <Button asChild variant="outline" size="lg">
                <ExternalLink href="https://nextjs.org/docs">Read the Next.js docs</ExternalLink>
              </Button>
            </div>
          </section>

          {/* Color Palette */}
          <section className="flex flex-col gap-4">
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

          {/* Basic Components */}
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">Basic Components</h2>
            <div className="flex flex-col gap-4">
              {/* Button */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Button Variants
                </span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Button Sizes
                </span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <PlusIcon className="size-4" />
                  </Button>
                </div>
              </div>
              {/* Badge */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Badge Variants
                </span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="bg-info text-info-foreground">Info</Badge>
                  <Badge className="bg-highlight text-highlight-foreground">Highlight</Badge>
                </div>
              </div>
              {/* Card */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Card
                </span>
                <Card className="w-full sm:w-80">
                  <CardHeader>
                    <CardTitle>Patient Record</CardTitle>
                    <CardDescription>Sarah Lim · Cardio Follow-up</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Last visit: 12 Apr 2026
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button size="sm">View details</Button>
                  </CardContent>
                </Card>
              </div>
              {/* Separator */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Separator
                </span>
                <div className="flex flex-col gap-2 items-center">
                  <span className="text-sm">Section A</span>
                  <Separator className="w-32" />
                  <span className="text-sm">Section B</span>
                </div>
              </div>
              {/* Skeleton */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skeleton
                </span>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex flex-col gap-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Navigation</h2>
            <div className="flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tabs
                </span>
                <Tabs defaultValue="tab1" className="w-full sm:w-96">
                  <TabsList>
                    <TabsTrigger value="tab1">Patients</TabsTrigger>
                    <TabsTrigger value="tab2">Records</TabsTrigger>
                    <TabsTrigger value="tab3" disabled>
                      Disabled
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="py-3">
                    <p className="text-sm">Patient list content</p>
                  </TabsContent>
                  <TabsContent value="tab2" className="py-3">
                    <p className="text-sm">Medical records content</p>
                  </TabsContent>
                </Tabs>
              </div>
              {/* Collapsible */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Collapsible
                </span>
                <div className="bg-muted/50 rounded-xl p-4">
                  <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {isCollapsibleOpen ? 'Expanded' : 'Collapsed'}
                      </p>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm">
                          {isCollapsibleOpen ? 'Collapse' : 'Expand'}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="pt-2">
                      <p className="text-sm text-muted-foreground">This content is collapsible.</p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
              {/* Pagination */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pagination — Page {currentPage}
                </span>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      />
                    </PaginationItem>
                    {[1, 2, 3].map((page) => (
                      <PaginationItem key={page}>
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage((p) => Math.min(3, p + 1))} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              {/* Navigation Menu */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Navigation Menu
                </span>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="cursor-pointer outline outline-1">
                        Patient Menu
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="min-w-48">
                        <div className="p-2">
                          <div className="py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Recent Patients
                          </div>
                          <NavigationMenuLink className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted cursor-pointer">
                            <Avatar className="size-6">
                              <AvatarFallback>SL</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Sarah Lim</span>
                          </NavigationMenuLink>
                          <NavigationMenuLink className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted cursor-pointer">
                            <Avatar className="size-6">
                              <AvatarFallback>WL</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Wei Liang</span>
                          </NavigationMenuLink>
                          <div className="border-t border-border my-2" />
                          <NavigationMenuLink className="block rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer">
                            View all patients
                          </NavigationMenuLink>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
          </section>

          {/* Forms */}
          <section className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Forms</h2>
            <div className="flex flex-col gap-4">
              {/* Input */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Input
                </span>
                <div className="flex flex-wrap gap-3">
                  <InputAtom placeholder="Patient name" className="w-48" />
                  <InputAtom placeholder="Disabled" disabled className="w-48" />
                </div>
              </div>
              {/* Textarea */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Textarea
                </span>
                <TextareaAtom placeholder="Clinical notes..." className="w-full sm:w-96 min-h-20" />
              </div>
              {/* Label + Input */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Label with Input
                </span>
                <div className="flex flex-col gap-2 w-64">
                  <LabelAtom htmlFor="email">Email address</LabelAtom>
                  <InputAtom id="email" placeholder="doctor@nuh.com.sg" />
                </div>
              </div>
              {/* Select */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Select
                </span>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="oncology">Oncology</SelectItem>
                    <SelectItem value="paediatrics">Paediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Checkbox */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Checkbox
                </span>
                <div className="flex items-center gap-3">
                  <CheckboxAtom
                    id="consent"
                    checked={selectedCheckbox}
                    onCheckedChange={(checked) => setSelectedCheckbox(checked as boolean)}
                  />
                  <LabelAtom htmlFor="consent">Clinical data consent</LabelAtom>
                </div>
              </div>
              {/* Radio Group */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Radio Group
                </span>
                <RadioGroupAtom value={selectedRadio} onValueChange={setSelectedRadio}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItemAtom value="low" id="r-low" />
                    <LabelAtom htmlFor="r-low">Low priority</LabelAtom>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItemAtom value="normal" id="r-normal" />
                    <LabelAtom htmlFor="r-normal">Normal priority</LabelAtom>
                  </div>
                </RadioGroupAtom>
              </div>
              {/* Switch */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Switch
                </span>
                <div className="flex items-center gap-3">
                  <SwitchAtom
                    checked={toggleState}
                    onCheckedChange={setToggleState}
                    id="notifications"
                  />
                  <LabelAtom htmlFor="notifications">
                    {toggleState ? 'Notifications enabled' : 'Notifications disabled'}
                  </LabelAtom>
                </div>
              </div>
              {/* Slider */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Slider — {sliderValue}
                </span>
                <SliderAtom
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="w-64"
                />
              </div>
              {/* Toggle */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Toggle
                </span>
                <div className="flex items-center gap-3">
                  <Toggle pressed={toggleBold} onPressedChange={setToggleBold}>
                    Bold
                  </Toggle>
                  <Toggle>Italic</Toggle>
                </div>
              </div>
              {/* Toggle Group */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Toggle Group
                </span>
                <ToggleGroup type="multiple" defaultValue={['bold']}>
                  <ToggleGroupItem value="bold">B</ToggleGroupItem>
                  <ToggleGroupItem value="italic">I</ToggleGroupItem>
                  <ToggleGroupItem value="center">≡</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </section>

          {/* Overlays */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Overlays</h2>
            <div className="flex flex-col gap-4">
              {/* Dialog */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dialog
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update consent preferences</DialogTitle>
                      <DialogDescription>
                        Review how your data is used for clinical care, research, and quality
                        improvement.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm">Consent details go here.</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={() => toast.success('Preferences saved')}>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Alert Dialog */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Alert Dialog
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Open Alert Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">
                        Delete patient record?
                      </AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => toast.success('Record deleted')}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {/* Sheet */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sheet (right panel)
                </span>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Patient Summary</Button>
                  </SheetTrigger>
                  <SheetContent className="rounded-l-2xl w-80 sm:w-96 p-6">
                    <SheetHeader className="pb-4">
                      <SheetTitle className="text-lg font-semibold">Patient Summary</SheetTitle>
                      <p className="text-sm text-muted-foreground">Sarah Lim · NRIC S1234567A</p>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 py-4">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <span className="text-sm font-medium">Cardiology</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-muted-foreground">Last visit</span>
                        <span className="text-sm font-medium">12 Apr 2026</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-muted-foreground">Next appt.</span>
                        <span className="text-sm font-medium">12 May 2026</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-4">
                      <Button variant="secondary" className="w-full justify-center">
                        View full record
                      </Button>
                      <Button variant="outline" className="w-full justify-center">
                        Schedule appointment
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {/* Drawer */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Drawer (bottom sheet)
                </span>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Quick Actions</Button>
                  </DrawerTrigger>
                  <DrawerContent className="rounded-t-2xl mx-auto w-full max-w-lg">
                    <DrawerHeader className="text-center pb-2">
                      <DrawerTitle className="text-lg font-semibold">Quick Actions</DrawerTitle>
                      <DrawerDescription className="text-sm text-muted-foreground">
                        Common tasks and shortcuts
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex gap-3 px-6 pb-6">
                      <Button variant="secondary" className="shrink-0">
                        Book appointment
                      </Button>
                      <Button variant="secondary" className="shrink-0">
                        Message care team
                      </Button>
                      <Button variant="secondary" className="shrink-0">
                        View results
                      </Button>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
              {/* Tooltip */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tooltip
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      ?
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help & documentation</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* Popover */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Popover
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open preferences</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="flex flex-col gap-4">
                      <div className="text-sm font-semibold">Notification preferences</div>
                      <div className="flex items-center justify-between">
                        <LabelAtom htmlFor="pop-email" className="text-xs">
                          Email alerts
                        </LabelAtom>
                        <SwitchAtom id="pop-email" defaultChecked />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* Dropdown Menu */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dropdown Menu
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit record</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Delete record</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">Feedback</h2>
            <div className="flex flex-col gap-4">
              {/* Alert */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Alert
                </span>
                <Alert>
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Lab results from 28 Apr are now available to view.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    File upload failed. Please check your connection.
                  </AlertDescription>
                </Alert>
              </div>
              {/* Toast */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Toast (Sonner)
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast.success('Appointment booked', {
                        description: '12 May, 10:30am · Dr. Lim',
                      })
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => toast.info('New lab results available')}
                  >
                    Info Toast
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast.error('Upload failed', { description: 'File exceeds 10 MB' })
                    }
                  >
                    Error Toast
                  </Button>
                </div>
              </div>
              {/* Progress */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Progress — {progress}%
                </span>
                <Progress value={progress} className="w-full sm:w-96" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    −10%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
              {/* Avatar */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avatar
                </span>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?u=sl" alt="Sarah Lim" />
                    <AvatarFallback>SL</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      WL
                    </AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback className="bg-destructive text-destructive-foreground">
                      ER
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {/* Calendar */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Calendar
                </span>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-xl border"
                />
                {date && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {date.toLocaleDateString()}
                  </p>
                )}
              </div>
              {/* Table */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Table
                </span>
                <Table className="w-full">
                  <TableCaption>Recent appointments</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Sarah Lim</TableCell>
                      <TableCell>Cardiology</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-highlight border-highlight">
                          Confirmed
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Wei Liang</TableCell>
                      <TableCell>Neurology</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border mt-8 px-8 py-6 flex gap-6 flex-wrap items-center justify-center text-muted-foreground text-sm">
          <Button asChild variant="link" size="sm">
            <ExternalLink href="https://nextjs.org/learn">Learn Next.js</ExternalLink>
          </Button>
          <Button asChild variant="link" size="sm">
            <ExternalLink href="https://ui.shadcn.com">shadcn/ui</ExternalLink>
          </Button>
          <Button asChild variant="link" size="sm">
            <ExternalLink href="https://www.nuh.com.sg">nuh.com.sg</ExternalLink>
          </Button>
        </footer>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
