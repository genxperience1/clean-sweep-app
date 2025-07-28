"use client";

import { useAppContext } from "@/context/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { MessageBoard } from "@/components/message-board";
import { Badge } from "@/components/ui/badge";
import { subDays, isAfter } from 'date-fns';
import { cn } from "@/lib/utils";
import type { OccupancyStatus } from "@/types";

export function HousekeeperView() {
  const {
    rooms,
    housekeepers,
    updateRoomStatus,
    currentHousekeeper,
    setCurrentHousekeeper,
  } = useAppContext();

  const threeDaysAgo = subDays(new Date(), 3);

  const assignedRooms = currentHousekeeper
    ? rooms.filter((room) => {
        const assigned = room.assignedTo === currentHousekeeper.id;
        if (!assigned) return false;
        if (room.status === 'cleaned' && room.assignmentDate) {
            return isAfter(room.assignmentDate, threeDaysAgo);
        }
        return true;
    })
    : [];
    
  const handleSelectHousekeeper = (hkId: string) => {
    const hk = housekeepers.find(h => h.id === hkId);
    setCurrentHousekeeper(hk || null);
  }

  const getBadgeVariant = (occupancy: OccupancyStatus, isVacant: boolean | undefined) => {
    if (occupancy === 'out') {
      return isVacant ? 'success' : 'destructive';
    }
    return 'outline';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Select Your Name</CardTitle>
            </CardHeader>
            <CardContent>
                <Select onValueChange={handleSelectHousekeeper} value={currentHousekeeper?.id ?? ''}>
                    <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select your name to see your assigned rooms..." />
                    </SelectTrigger>
                    <SelectContent>
                        {housekeepers.map((hk) => (
                        <SelectItem key={hk.id} value={hk.id}>
                            {hk.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        {currentHousekeeper && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>My Assigned Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Room</TableHead>
                      <TableHead>Dirty Status</TableHead>
                      <TableHead className="text-right">Cleaned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedRooms.length > 0 ? (
                      assignedRooms.map((room) => (
                        <TableRow key={room.id} className={cn(room.status === 'cleaned' && "bg-secondary/50")}>
                          <TableCell className={cn("font-medium", room.status === 'cleaned' && "line-through text-muted-foreground")}>{room.roomNumber}</TableCell>
                          <TableCell>
                              <Badge variant={getBadgeVariant(room.occupancy, room.isVacant)} className={cn("capitalize", room.status === 'cleaned' && "opacity-50")}>
                                  {room.occupancy}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Checkbox
                              aria-label={`Mark room ${room.roomNumber} as cleaned`}
                              checked={room.status === "cleaned"}
                              onCheckedChange={(checked) =>
                                updateRoomStatus(room.id, checked ? "cleaned" : "dirty")
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          You have no rooms assigned.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-1">
        <MessageBoard />
      </div>
    </div>
  );
}
