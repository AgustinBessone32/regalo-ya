import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Utilidades para hash y comparación de contraseñas
const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

export function setupAuth(app: Express) {
  // Configuración de la sesión
  const MemoryStore = createMemoryStore(session);
  app.use(
    session({
      secret: process.env.REPL_ID || "birthday-gift-manager",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: "lax",
      },
      store: new MemoryStore({
        checkPeriod: 86400000, // limpiar sesiones expiradas cada 24h
      }),
    })
  );

  // Inicializar Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configurar estrategia local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }

        const isMatch = await crypto.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialización del usuario
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialización del usuario
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Rutas de autenticación
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Intento de registro:", { username });

      // Verificar usuario existente
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        console.log("Registro fallido: Usuario existente", { username });
        return res.status(400).send("El nombre de usuario ya existe");
      }

      // Crear nuevo usuario
      const hashedPassword = await crypto.hash(password);
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      console.log("Usuario registrado:", { username, userId: newUser.id });

      // Iniciar sesión automáticamente
      req.login(newUser, (err) => {
        if (err) {
          console.error("Error al iniciar sesión después del registro:", err);
          return res.status(500).send("Error al iniciar sesión");
        }
        res.json({ user: { id: newUser.id, username: newUser.username } });
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).send("Error en el registro");
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Intento de inicio de sesión:", { username: req.body.username });

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Error de inicio de sesión:", err);
        return next(err);
      }
      if (!user) {
        console.log("Inicio de sesión fallido:", info.message);
        return res.status(401).send(info.message);
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Error al crear sesión:", err);
          return next(err);
        }
        console.log("Inicio de sesión exitoso:", {
          username: user.username,
          userId: user.id,
        });
        res.json({ user: { id: user.id, username: user.username } });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = (req.user as any)?.username;
    console.log("Intento de cierre de sesión:", { username });

    req.logout((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.status(500).send("Error al cerrar sesión");
      }
      console.log("Sesión cerrada:", { username });
      res.json({ message: "Sesión cerrada correctamente" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      console.log("Sesión encontrada:", {
        userId: user.id,
        username: user.username,
      });
      return res.json({ id: user.id, username: user.username });
    }
    console.log("No se encontró sesión autenticada");
    res.status(401).send("No has iniciado sesión");
  });
}