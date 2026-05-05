'use client';

import { toast } from 'sonner';
import { Button } from '@/components/atoms/button';
import { LabelAtom } from '@/components/atoms/label-atom';
import { SectionLabel } from '@/components/atoms/section-label';
import { SwitchAtom } from '@/components/atoms/switch-atom';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function OverlaysShowcase() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Overlays</h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SectionLabel>Dialog</SectionLabel>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update consent preferences</DialogTitle>
                <DialogDescription>
                  Review how your data is used for clinical care, research, and quality improvement.
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Alert Dialog</SectionLabel>
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Sheet (right panel)</SectionLabel>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Patient Summary</Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-2xl w-80 sm:w-96 p-6">
              <SheetHeader className="p-0">
                <SheetTitle className="text-lg font-semibold">Patient Summary</SheetTitle>
                <p className="text-sm text-muted-foreground">Sarah Lim · NRIC S1234567A</p>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-4">
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Drawer (bottom sheet)</SectionLabel>
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Tooltip</SectionLabel>
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Popover</SectionLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open preferences</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Dropdown Menu</SectionLabel>
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
  );
}
