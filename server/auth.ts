import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { pool } from "../db";

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);

  app.use(session({
    secret: process.env.REPL_ID || "birthday-gift-manager",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: new MemoryStore({ checkPeriod: 86400000 })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND password = $2 LIMIT 1",
        [username, password]
      );
      const user = result.rows[0];
      if (!user) {
        return done(null, false, { message: "Invalid credentials." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const result = await pool.query(
        "SELECT id, username, created_at FROM users WHERE id = $1",
        [id]
      );
      done(null, result.rows[0]);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      const existingUser = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).send("Username already exists");
      }

      const result = await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
        [username, password]
      );

      res.json({ user: result.rows[0] });
    } catch (error) {
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/user", (req, res) => {
    res.json(req.user || null);
  });
}