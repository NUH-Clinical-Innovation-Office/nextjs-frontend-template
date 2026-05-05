'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/button';
import { SectionLabel } from '@/components/atoms/section-label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function FeedbackShowcase() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(45);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Feedback</h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SectionLabel>Alert</SectionLabel>
          <Alert>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>Lab results from 28 Apr are now available to view.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>File upload failed. Please check your connection.</AlertDescription>
          </Alert>
        </div>
        <div className="flex flex-col gap-2">
          <SectionLabel>Toast (Sonner)</SectionLabel>
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
            <Button variant="secondary" onClick={() => toast.info('New lab results available')}>
              Info Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error('Upload failed', { description: 'File exceeds 10 MB' })}
            >
              Error Toast
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <SectionLabel>Progress — {progress}%</SectionLabel>
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
        <div className="flex flex-col gap-2">
          <SectionLabel>Avatar</SectionLabel>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=sl" alt="Sarah Lim" />
              <AvatarFallback>SL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">WL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-destructive text-destructive-foreground">
                ER
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <SectionLabel>Calendar</SectionLabel>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl border"
          />
          {date && (
            <p className="text-sm text-muted-foreground">Selected: {date.toLocaleDateString()}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <SectionLabel>Table</SectionLabel>
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
  );
}
