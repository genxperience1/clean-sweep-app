"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from "@/context/app-context";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Sparkles, Loader2 } from 'lucide-react';
import { summarizeMessages } from '@/ai/flows/summarize-messages-flow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function MessageBoard() {
  const { messages, addMessage, role, currentHousekeeper } = useAppContext();
  const [newMessage, setNewMessage] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We don't have a direct way to scroll to bottom in ScrollArea,
    // so this is a simple way to re-trigger a render if needed.
    // For a real app, a more robust solution might be needed.
  }, [messages]);

  const handleSubmit = () => {
    if (newMessage.trim()) {
      addMessage(newMessage);
      setNewMessage("");
    }
  };
  
  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    try {
        const messagePayload = messages.map(m => ({ author: m.author, text: m.text }));
        const result = await summarizeMessages({ messages: messagePayload });
        setSummary(result);
    } catch (error) {
        console.error("Failed to summarize messages:", error);
        setSummary("Sorry, I couldn't generate a summary at this time.");
    } finally {
        setIsSummarizing(false);
    }
  }

  return (
    <>
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Message Board</CardTitle>
          {role === 'Front Desk' && messages.length > 0 && (
             <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing}>
                {isSummarizing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Summarize
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-grow pr-4 -mr-4 h-64" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
              ) : (
                  [...messages].reverse().map(msg => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{msg.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                          <p className="font-semibold">{msg.author}</p>
                          <p className="text-xs text-muted-foreground">
                              {format(msg.timestamp, 'p')}
                          </p>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex gap-2 border-t pt-4">
          <Textarea
            placeholder={role === "Housekeeping" && !currentHousekeeper ? "Select your name to send messages" : "Type your message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={role === "Housekeeping" && !currentHousekeeper}
          />
          <Button onClick={handleSubmit} disabled={role === "Housekeeping" && !currentHousekeeper}>Send</Button>
        </CardFooter>
      </Card>

       <AlertDialog open={summary !== null} onOpenChange={(open) => !open && setSummary(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Message Summary</AlertDialogTitle>
            <AlertDialogDescription>
              {summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSummary(null)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
