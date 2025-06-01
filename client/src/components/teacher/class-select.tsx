import { useState, useEffect } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Class {
  id: number;
  name: string;
}

interface ClassSelectProps {
  selectedClassId?: number | number[] | "all" | null;
  onClassChange: (
    classId: number | number[] | string | string[] | "all" | null
  ) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function ClassSelect({
  selectedClassId,
  onClassChange,
  required = false,
  disabled = false,
}: ClassSelectProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherId = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/teachers/me`, {
          withCredentials: true,
        });
        setTeacherId(response.data.id);
      } catch (err: any) {
        console.error("Error fetching teacher ID:", err);
        if (err.response?.status === 401) {
          setError("Authentication required");
        } else {
          setError("Failed to fetch teacher information");
        }
      }
    };
    fetchTeacherId();
  }, [apiUrl]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiUrl}/api/teachers/${teacherId}/classes`,
          {
            withCredentials: true,
          }
        );
        setClasses(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching classes:", err);
        if (err.response?.status === 401) {
          setError("Authentication required");
        } else {
          setError("Failed to load classes");
        }
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchClasses();
    }
  }, [teacherId, apiUrl]);

  const getSelectedClassIds = (): number[] => {
    if (!selectedClassId) return [];
    if (selectedClassId === "all") return classes.map((cls) => cls.id);
    if (Array.isArray(selectedClassId)) return selectedClassId;
    return [selectedClassId];
  };

  const handleClassToggle = (classId: number, checked: boolean) => {
    const currentSelected = getSelectedClassIds();

    let newSelected: number[];
    if (checked) {
      newSelected = [...currentSelected, classId];
    } else {
      newSelected = currentSelected.filter((id) => id !== classId);
    }

    if (newSelected.length === classes.length) {
      onClassChange("all");
    } else if (newSelected.length === 0) {
      onClassChange(null);
    } else {
      onClassChange(newSelected);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onClassChange("all");
    } else {
      onClassChange(null);
    }
  };

  const selectedIds = getSelectedClassIds();
  const isAllSelected =
    selectedIds.length === classes.length && classes.length > 0;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < classes.length;

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Assign to Classes{" "}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading classes...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Assign to Classes{" "}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        Assign to Classes{" "}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Select All option */}
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              disabled={disabled || classes.length === 0}
            />
            <Label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              All Classes ({classes.length})
            </Label>
          </div>

          {/* Individual class options */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`class-${cls.id}`}
                  checked={selectedIds.includes(cls.id)}
                  onCheckedChange={(checked) =>
                    handleClassToggle(cls.id, checked as boolean)
                  }
                  disabled={disabled}
                />
                <Label
                  htmlFor={`class-${cls.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {cls.name}
                </Label>
              </div>
            ))}
          </div>

          {/* Selection summary */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {selectedIds.length === 0 && "No classes selected"}
              {selectedIds.length === 1 && "1 class selected"}
              {selectedIds.length > 1 &&
                selectedIds.length < classes.length &&
                `${selectedIds.length} classes selected`}
              {isAllSelected && "All classes selected"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
