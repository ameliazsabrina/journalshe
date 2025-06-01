import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, AlertCircle, GraduationCap, Filter } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { teacherAPI, assignmentAPI } from "@/lib/api";

interface Class {
  id: number;
  name: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  teacherId: string;
  classId: number | null;
  class?: {
    id: number;
    name: string;
  };
}

export default function AssignmentsDashboard({
  teacherId,
}: {
  teacherId: string;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(
    []
  );
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        const classesData = await teacherAPI.getTeacherClasses(teacherId);
        setClasses(classesData);

        const assignmentsData = await teacherAPI.getMyAssignments();

        // Filter by class if selected
        let filteredData = assignmentsData;
        if (selectedClassId && selectedClassId !== "all") {
          filteredData = assignmentsData.filter(
            (assignment: Assignment) =>
              assignment.classId?.toString() === selectedClassId
          );
        }

        setAssignments(filteredData);
        setFilteredAssignments(filteredData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load assignments:", err);
        setError("Failed to load assignments");
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [teacherId, selectedClassId, toast]);

  const handleCreateNew = () => {
    router.push("/teacher/assignments/create");
  };

  const handleViewDetails = (id: string) => {
    router.push(`/teacher/assignments/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/teacher/assignments/edit/${id}`);
  };

  function getDueStatus(dueDate: string) {
    const now = new Date();
    const due = new Date(dueDate);
    const daysLeft = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0)
      return { status: "overdue", label: "Overdue", color: "destructive" };
    if (daysLeft === 0)
      return { status: "due-today", label: "Due Today", color: "warning" };
    if (daysLeft <= 2)
      return { status: "upcoming", label: "Upcoming", color: "warning" };
    return { status: "scheduled", label: "Scheduled", color: "secondary" };
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 flex-col gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">Error: {error}</p>
        <Button variant="outline" onClick={() => setLoading(true)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.length > 0 && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Assignments</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedClassId || "all"}
              onValueChange={(value) =>
                setSelectedClassId(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg bg-muted/40">
          <h3 className="font-medium mb-2">No assignments created yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first assignment to get started.
          </p>
          <Button onClick={handleCreateNew}>Create Assignment</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const dueStatus = getDueStatus(assignment.dueDate);
            return (
              <Card
                key={assignment.id}
                className="transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {assignment.title}
                    </CardTitle>
                    <Badge variant={dueStatus.color as any}>
                      {dueStatus.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <CardDescription className="mb-3">
                    {assignment.description || "No description provided"}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Due:{" "}
                      {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                    </div>
                    {assignment.class && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {assignment.class.name}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(assignment.id)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(assignment.id)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
