import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-238582d2/health", (c) => {
  return c.json({ status: "ok" });
});

// Tasks endpoints
app.get("/make-server-238582d2/tasks", async (c) => {
  try {
    const tasks = await kv.get("tasks") || [];
    return c.json(tasks);
  } catch (error) {
    console.log("Error fetching tasks:", error);
    return c.json({ error: "Failed to fetch tasks" }, 500);
  }
});

app.post("/make-server-238582d2/tasks", async (c) => {
  try {
    const body = await c.req.json();
    const { tasks } = body;
    
    if (!Array.isArray(tasks)) {
      return c.json({ error: "Tasks must be an array" }, 400);
    }

    await kv.set("tasks", tasks);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving tasks:", error);
    return c.json({ error: "Failed to save tasks" }, 500);
  }
});

app.delete("/make-server-238582d2/tasks", async (c) => {
  try {
    await kv.del("tasks");
    return c.json({ success: true });
  } catch (error) {
    console.log("Error clearing tasks:", error);
    return c.json({ error: "Failed to clear tasks" }, 500);
  }
});

// User preferences endpoints
app.get("/make-server-238582d2/preferences", async (c) => {
  try {
    const preferences = await kv.get("user_preferences") || {};
    return c.json(preferences);
  } catch (error) {
    console.log("Error fetching preferences:", error);
    return c.json({ error: "Failed to fetch preferences" }, 500);
  }
});

app.post("/make-server-238582d2/preferences", async (c) => {
  try {
    const preferences = await c.req.json();
    await kv.set("user_preferences", preferences);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving preferences:", error);
    return c.json({ error: "Failed to save preferences" }, 500);
  }
});

// Focus session tracking
app.post("/make-server-238582d2/focus-session", async (c) => {
  try {
    const session = await c.req.json();
    const sessions = await kv.get("focus_sessions") || [];
    sessions.push({
      ...session,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    await kv.set("focus_sessions", sessions);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving focus session:", error);
    return c.json({ error: "Failed to save focus session" }, 500);
  }
});

app.get("/make-server-238582d2/focus-sessions", async (c) => {
  try {
    const sessions = await kv.get("focus_sessions") || [];
    return c.json(sessions);
  } catch (error) {
    console.log("Error fetching focus sessions:", error);
    return c.json({ error: "Failed to fetch focus sessions" }, 500);
  }
});

Deno.serve(app.fetch);