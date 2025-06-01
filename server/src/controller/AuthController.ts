import type { Context } from "hono";
import { supabase } from "../utils/supabase";
import { getUserIdFromToken } from "../utils/auth";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import type { Env } from "..";

const getJWTSecret = (c: Context<{ Bindings: Env }>) => {
  const secret = c.env?.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  schoolId: string;
  classIds: string[] | number[];
}

const validateRegistrationData = (data: RegisterRequest): string | null => {
  const { username, email, fullName, password, schoolId, classIds } = data;

  if (!username) return "Username is required";
  if (!email) return "Email is required";
  if (!fullName) return "Full name is required";
  if (!password) return "Password is required";
  if (!schoolId) return "School ID is required";
  if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
    return "At least one class must be selected";
  }

  return null;
};

const checkUserExists = async (
  c: Context<{ Bindings: Env }>,
  username: string,
  email: string
): Promise<boolean> => {
  const { data: existing } = await supabase(c)
    .from("User")
    .select("id")
    .or(`username.eq.${username},email.eq.${email}`);

  return !!(existing && existing.length > 0);
};

export const registerStudent = async (c: Context<{ Bindings: Env }>) => {
  const { username, email, fullName, password, schoolId, classIds } =
    await c.req.json();

  console.log("Student registration attempt:", {
    username,
    email,
    fullName,
    schoolId,
    classIds,
    hasPassword: !!password,
  });

  const validationError = validateRegistrationData(await c.req.json());
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const numericClassIds = classIds
    .map((id: string | number) => {
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      return isNaN(numId) ? null : numId;
    })
    .filter((id: number | null) => id !== null);

  if (numericClassIds.length === 0) {
    console.log("No valid class IDs found. Original classIds:", classIds);
    return c.json({ error: "Valid class IDs are required" }, 400);
  }

  const classId = numericClassIds[0];

  try {
    const userExists = await checkUserExists(c, username, email);
    console.log("User exists:", userExists);
    if (userExists) {
      return c.json({ error: "Username or email already exists" }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error: userError } = await supabase(c)
      .from("User")
      .insert([
        {
          id: crypto.randomUUID(),
          username,
          email,
          fullName,
          passwordHash,
          roleId: 1,
          createdAt: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userError) {
      console.log("User creation error:", userError);
      return c.json(
        { error: "Failed to create user", detail: userError.message },
        500
      );
    }

    const { data: newStudent, error: studentError } = await supabase(c)
      .from("Student")
      .insert([
        {
          id: crypto.randomUUID(),
          userId: newUser.id,
          classId,
          schoolId,
          classLevel: "",
          streakDays: 0,
          totalPoints: 0,
          lastLogin: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (studentError) {
      console.log("Student creation error:", studentError);
      return c.json(
        {
          error: "Failed to create student profile",
          detail: studentError.message,
        },
        500
      );
    }

    console.log("Student registration successful:", {
      userId: newUser.id,
      studentId: newStudent.id,
    });

    return c.json(
      { message: "User registered", user: newUser, student: newStudent },
      201
    );
  } catch (error) {
    console.error("Unexpected error during student registration:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const registerTeacher = async (c: Context<{ Bindings: Env }>) => {
  const { username, email, fullName, password, schoolId, classIds } =
    await c.req.json();

  if (!password) {
    return c.json({ error: "Password is required" }, 400);
  }

  if (!classIds || classIds.length === 0) {
    return c.json({ error: "At least one class must be selected" }, 400);
  }

  const { data: existing } = await supabase(c)
    .from("User")
    .select("id")
    .or(`username.eq.${username},email.eq.${email}`);

  if (existing && existing.length > 0) {
    return c.json({ error: "Username or email already exists" }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const teacherId = crypto.randomUUID();

  const { data: newUser, error: userError } = await supabase(c)
    .from("User")
    .insert([
      {
        id: userId,
        username,
        email,
        fullName,
        passwordHash,
        roleId: 2,
        createdAt: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (userError) {
    return c.json(
      { error: "Failed to create user", detail: userError.message },
      500
    );
  }

  const { data: newTeacher, error: teacherError } = await supabase(c)
    .from("Teacher")
    .insert([
      {
        id: teacherId,
        userId: userId,
        schoolId: schoolId,
      },
    ])
    .select()
    .single();

  if (teacherError) {
    return c.json(
      { error: "Failed to create teacher", detail: teacherError.message },
      500
    );
  }

  const teacherClassInserts = classIds.map((classId: number) => ({
    teacherId: teacherId,
    classId: classId,
  }));

  const { data: teacherClasses, error: classError } = await supabase(c)
    .from("TeacherClass")
    .insert(teacherClassInserts)
    .select();

  if (classError) {
    return c.json(
      { error: "Failed to assign teacher classes", detail: classError.message },
      500
    );
  }

  return c.json(
    {
      message: "Teacher registered successfully",
      user: newUser,
      teacher: newTeacher,
      teacherClasses,
    },
    201
  );
};

export const registerAdmin = async (c: Context<{ Bindings: Env }>) => {
  const { username, email, fullName, password, schoolId } = await c.req.json();

  if (!password) {
    return c.json({ error: "Password is required" }, 400);
  }

  const { data: existing } = await supabase(c)
    .from("User")
    .select("id")
    .or(`username.eq.${username},email.eq.${email}`);

  if (existing && existing.length > 0) {
    return c.json({ error: "Username or email already exists" }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: newUser, error } = await supabase(c)
    .from("User")
    .insert([
      {
        id: crypto.randomUUID(),
        username,
        email,
        fullName,
        passwordHash,
        roleId: 3,
        createdAt: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  const { data: newAdmin } = await supabase(c)
    .from("Admin")
    .insert([
      {
        id: crypto.randomUUID(),
        userId: newUser.id,
      },
    ])
    .select()
    .single();

  if (error) {
    return c.json(
      { error: "Failed to create user", detail: error.message },
      500
    );
  }

  return c.json(
    {
      message: "User registered",
      user: newUser,
      admin: newAdmin,
    },
    201
  );
};

export const login = async (c: Context<{ Bindings: Env }>) => {
  const { username, password } = await c.req.json();

  try {
    const { data: user, error } = await supabase(c)
      .from("User")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return c.json({ error: "Invalid username or password" }, 404);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
    };

    const token = jwt.sign(payload, getJWTSecret(c), {
      expiresIn: "7d",
    });

    console.log("Login successful, setting cookie:", {
      userId: user.id,
      tokenLength: token.length,
      cookieValue: `token=${token}; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/`,
    });

    c.res.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/`
    );

    let extraData = {};
    if (user.roleId === 1) {
      const { data } = await supabase(c)
        .from("Student")
        .select("*")
        .eq("userId", user.id)
        .single();
      extraData = data || {};
    } else if (user.roleId === 2) {
      const { data } = await supabase(c)
        .from("Teacher")
        .select("*")
        .eq("userId", user.id)
        .single();
      extraData = data || {};
    } else if (user.roleId === 3) {
      const { data } = await supabase(c)
        .from("Admin")
        .select("*")
        .eq("userId", user.id)
        .single();
      extraData = data || {};
    }

    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        ...extraData,
      },
    });
  } catch (err: any) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const profile = async (c: Context<{ Bindings: Env }>) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: No token provided" }, 401);
    }

    const { data: user, error } = await supabase(c)
      .from("User")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (err) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};

export const logout = async (c: Context<{ Bindings: Env }>) => {
  c.res.headers.set(
    "Set-Cookie",
    `token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`
  );
  return c.json({ message: "Logout successful" }, 200);
};
