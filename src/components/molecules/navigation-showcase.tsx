'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { SectionLabel } from '@/components/atoms/section-label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NavigationShowcase() {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold">Navigation</h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <SectionLabel>Tabs</SectionLabel>
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
        <div className="flex flex-col gap-6">
          <SectionLabel>Collapsible</SectionLabel>
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
        <div className="flex flex-col gap-6">
          <SectionLabel>Pagination — Page {currentPage}</SectionLabel>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
              </PaginationItem>
              {[1, 2, 3].map((page) => (
                <PaginationItem key={page}>
                  <Button
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-8 px-0"
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
        <div className="flex flex-col gap-6">
          <SectionLabel>Navigation Menu</SectionLabel>
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
  );
}
