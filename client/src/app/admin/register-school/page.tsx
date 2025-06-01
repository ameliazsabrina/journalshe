"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Building,
  BookOpen,
  Plus,
  School,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AdminNavbar from "@/components/admin/navbar";
import { schoolAPI } from "@/lib/api";

interface SchoolType {
  id: number;
  name: string;
  address: string;
}

interface ClassType {
  id: number;
  name: string;
  schoolId: number;
  school?: {
    name: string;
  };
}

export default function RegisterSchoolPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("register");

  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");

  const [className, setClassName] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);

  const [loading, setLoading] = useState({
    schools: false,
    classes: false,
    registeringSchool: false,
    registeringClass: false,
  });

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading((prev) => ({ ...prev, schools: true }));
      const data = await schoolAPI.listSchools();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, schools: false }));
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading((prev) => ({ ...prev, classes: true }));
      const data = await schoolAPI.listClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, classes: false }));
    }
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolAddress.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, registeringSchool: true }));
      const response = await schoolAPI.createSchool({
        name: schoolName,
        address: schoolAddress,
      });

      toast({
        title: "Success",
        description: "School registered successfully",
      });

      setSchoolName("");
      setSchoolAddress("");
      fetchSchools();
    } catch (error) {
      console.error("Error registering school:", error);
      toast({
        title: "Error",
        description: "Failed to register school",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, registeringSchool: false }));
    }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !selectedSchoolId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, registeringClass: true }));
      const response = await schoolAPI.createClass({
        name: className,
        schoolId: selectedSchoolId,
      });

      toast({
        title: "Success",
        description: "Class registered successfully",
      });

      setClassName("");
      setSelectedSchoolId("");
      fetchClasses();
    } catch (error) {
      console.error("Error registering class:", error);
      toast({
        title: "Error",
        description: "Failed to register class",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, registeringClass: false }));
    }
  };

  const hasSchools = schools.length > 0;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">School Management</h1>
          </div>

          <Tabs
            defaultValue="register"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="view">View Registered</TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Register School Card */}
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <School className="h-5 w-5 text-primary" />
                      <CardTitle>Register School</CardTitle>
                    </div>
                    <CardDescription>
                      Add a new school to the system
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSchoolSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input
                          id="schoolName"
                          placeholder="Enter school name"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolAddress">Address</Label>
                        <Textarea
                          id="schoolAddress"
                          placeholder="Enter school address"
                          value={schoolAddress}
                          onChange={(e) => setSchoolAddress(e.target.value)}
                          required
                          rows={3}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading.registeringSchool}
                      >
                        {loading.registeringSchool ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Register School
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>

                <Card
                  className={`shadow-md ${!hasSchools ? "opacity-75" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle>Register Class</CardTitle>
                    </div>
                    <CardDescription>
                      {hasSchools
                        ? "Add a new class to an existing school"
                        : "Please register a school first before adding classes"}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleClassSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="className">Class Name</Label>
                        <Input
                          id="className"
                          placeholder="Enter class name (e.g., 10 IPS 2)"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          required
                          disabled={!hasSchools}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolSelect">Select School</Label>
                        {loading.schools ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading schools...
                          </div>
                        ) : !hasSchools ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            No schools available
                          </div>
                        ) : (
                          <Select
                            value={selectedSchoolId}
                            onValueChange={setSelectedSchoolId}
                            disabled={!hasSchools}
                          >
                            <SelectTrigger id="schoolSelect">
                              <SelectValue placeholder="Select a school" />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem
                                  key={school.id}
                                  value={school.id.toString()}
                                >
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          loading.registeringClass ||
                          !hasSchools ||
                          !selectedSchoolId
                        }
                      >
                        {loading.registeringClass ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Register Class
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-muted">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Important Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Schools must be registered before classes can be added to
                      them. Each class must be associated with a school. Once
                      registered, schools and classes will be available for
                      student enrollment.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="view" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-primary" />
                        <CardTitle>Registered Schools</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSchools}
                        disabled={loading.schools}
                      >
                        {loading.schools ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading.schools ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !hasSchools ? (
                      <div className="text-center py-8 border rounded-md bg-muted/20">
                        <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground mb-2">
                          No schools registered yet
                        </p>
                        <Button onClick={() => setActiveTab("register")}>
                          Register a School
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>School Name</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead className="text-right">
                                Classes
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {schools.map((school) => {
                              const schoolClasses = classes.filter(
                                (cls) =>
                                  cls.schoolId.toString() ===
                                  school.id.toString()
                              );
                              return (
                                <TableRow key={school.id}>
                                  <TableCell className="font-medium">
                                    {school.id}
                                  </TableCell>
                                  <TableCell>{school.name}</TableCell>
                                  <TableCell>{school.address}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant="outline">
                                      {schoolClasses.length}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* View Classes Table */}
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Registered Classes</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchClasses}
                        disabled={loading.classes}
                      >
                        {loading.classes ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading.classes ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : classes.length === 0 ? (
                      <div className="text-center py-8 border rounded-md bg-muted/20">
                        <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground mb-2">
                          No classes registered yet
                        </p>
                        <Button
                          onClick={() => setActiveTab("register")}
                          disabled={!hasSchools}
                        >
                          {hasSchools
                            ? "Register a Class"
                            : "Register a School First"}
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Class Name</TableHead>
                              <TableHead>School</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classes.map((cls) => (
                              <TableRow key={cls.id}>
                                <TableCell className="font-medium">
                                  {cls.id}
                                </TableCell>
                                <TableCell>{cls.name}</TableCell>
                                <TableCell>
                                  {cls.school?.name ||
                                    schools.find(
                                      (s) =>
                                        s.id.toString() ===
                                        cls.schoolId.toString()
                                    )?.name ||
                                    "Unknown School"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
