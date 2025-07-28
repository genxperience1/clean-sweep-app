"use client";

import { useAppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons";
import { User, DoorOpen } from 'lucide-react';

export function LoginForm() {
  const { setRole } = useAppContext();

  return (
    <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Logo className="w-8 h-8" />
        </div>
        <CardTitle className="text-3xl font-bold">Welcome to CleanSweep</CardTitle>
        <CardDescription>Select your role to begin managing housekeeping tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Button size="lg" onClick={() => setRole("Front Desk")} className="w-full text-lg py-7">
            <User className="mr-2 h-6 w-6" />
            Front Desk
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setRole("Housekeeping")} className="w-full text-lg py-7">
            <DoorOpen className="mr-2 h-6 w-6" />
            Housekeeping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
