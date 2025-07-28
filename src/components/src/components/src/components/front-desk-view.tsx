"use client";

import { useState } from "react";
import { useAppContext } from "@/context/app-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessageBoard } from "@/components/message-board";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { OccupancyStatus } from "@/types";
import { UserPlus, X } from "lucide-react";

export function FrontDeskView() {
  const { rooms, housekeepers, markAsVacant, addRoom, addHousekeeper, removeHousekeeper } = useAppContext();
  const { toast } = useToast();
  
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomOccupancy, setNewRoomOccupancy] = useState<OccupancyStatus>("out");
  const [newRoomHousekeeperId, setNewRoomHousekeeperId] = useState<string | null>(null);
  const [newHousekeeperName, setNewHousekeeperName] = useState("");

  const handleAddRoom = () => {
    if (!newRoomNumber.trim()) {
      toast({ title: "Error", description: "Room number cannot be empty.", variant: "destructive" });
      return;
    }
    if (rooms.some(r => r.roomNumber === newRoomNumber.trim())) {
      toast({ title: "Error", description: "A room with this number already exists.", variant: "destructive" });
      return;
    }
    addRoom(newRoomNumber, newRoomOccupancy, newRoomHousekeeperId);
    setNewRoomNumber("");
    setNewRoomOccupancy("out");
    setNewRoomHousekeeperId(null);
    toast({ title: "Success", description: `Room ${newRoomNumber} has been added.` });
  };
  
  const handleAddHousekeeper = () => {
    if (!newHousekeeperName.trim()) {
        toast({ title: "Error", description: "Housekeeper name cannot be empty.", variant: "destructive" });
        return;
    }
    addHousekeeper(newHousekeeperName);
    setNewHousekeeperName("");
    toast({ title: "Success", description: `${newHousekeeperName} has been added.` });
  }

  const getBadgeVariant = (occupancy: OccupancyStatus, isVacant: boolean | undefined) => {
    if (occupancy === 'out') {
      return isVacant ? 'success' : 'destructive';
    }
    return 'outline';
  }

  const renderRoomList = (roomList: typeof rooms, title: string) => (
    <Card className="shadow-lg" key={title}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Room</TableHead>
                <TableHead>Dirty Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomList.length > 0 ? roomList.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>
                      <Badge variant={getBadgeVariant(room.occupancy, room.isVacant)} className="capitalize">
                          {room.occupancy}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {room.occupancy === 'out' && !room.isVacant && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsVacant(room.id)}
                      >
                        Mark Checked Out
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No rooms assigned.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Add and Assign Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <Label htmlFor="new-room">Room Number</Label>
                        <Input id="new-room" placeholder="e.g. 404" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="new-room-occupancy">Dirty Status</Label>
                        <Select value={newRoomOccupancy} onValueChange={(value) => setNewRoomOccupancy(value as OccupancyStatus)}>
                            <SelectTrigger id="new-room-occupancy">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="out">Out</SelectItem>
                                <SelectItem value="stay">Stay</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="assign-hk">Assign Housekeeper</Label>
                         <Select value={newRoomHousekeeperId ?? ''} onValueChange={(val) => setNewRoomHousekeeperId(val === 'none' ? null : val)}>
                            <SelectTrigger id="assign-hk">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {housekeepers.map((hk) => (
                                    <SelectItem key={hk.id} value={hk.id}>
                                    {hk.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <Button onClick={handleAddRoom} className="w-full md:w-auto">Add Room</Button>
            </CardContent>
        </Card>
        
        {housekeepers.map(hk => {
          const assignedRooms = rooms.filter(r => r.assignedTo === hk.id);
          if (assignedRooms.length > 0) {
            return renderRoomList(assignedRooms, `Rooms Assigned to ${hk.name}`);
          }
          return null;
        })}
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Manage Housekeepers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input placeholder="Add housekeeper name..." value={newHousekeeperName} onChange={e => setNewHousekeeperName(e.target.value)} />
                    <Button onClick={handleAddHousekeeper}><UserPlus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <div className="mt-4 space-y-2">
                    <Label>Today's Housekeepers</Label>
                    <div className="space-y-2">
                        {housekeepers.length > 0 ? housekeepers.map(hk => (
                            <div key={hk.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                <span>{hk.name}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeHousekeeper(hk.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-2">No housekeepers added for today.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
        <MessageBoard />
      </div>
    </div>
  );
}
