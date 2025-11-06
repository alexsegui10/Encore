import * as schema from "./schema.js";
import { requireAdmin } from "../../middleware/auth.js";

function normalizeUsername(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function generateUid(prefix = "usr") {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}${random}`;
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default async function usersRoutes(server) {
  if (!server.prisma) throw new Error("Prisma plugin not loaded");

  server.route({
    method: "GET",
    url: "/users",
    onRequest: [requireAdmin],
    schema: schema.list,
    handler: async (req, reply) => {
      try {
  const users = await server.prisma.users.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            uid: true,
            slug: true,
            username: true,
            email: true,
            bio: true,
            image: true,
            isActive: true,
            status: true,
            favouriteEvents: true,
            followingUsers: true,
            comentarios: true,
            reservas: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return { users };
      } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ message: "Internal server error" });
      }
    },
  });

  server.route({
    method: "GET",
    url: "/users/:uid",
    onRequest: [requireAdmin],
    schema: schema.getById,
    handler: async (req, reply) => {
      try {
  const user = await server.prisma.users.findUnique({
          where: { uid: req.params.uid },
          select: {
            id: true,
            uid: true,
            slug: true,
            username: true,
            email: true,
            bio: true,
            image: true,
            isActive: true,
            status: true,
            favouriteEvents: true,
            followingUsers: true,
            comentarios: true,
            reservas: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        if (!user) return reply.code(404).send({ message: "User not found" });
        return { user };
      } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ message: "Internal server error" });
      }
    },
  });

  server.route({
    method: "POST",
    url: "/users",
    onRequest: [requireAdmin],
    schema: schema.create,
    handler: async (req, reply) => {
      try {
        const { username, email, password, bio, image } = req.body.user;
        if (!username || !email || !password)
          return reply
            .code(400)
            .send({ message: "Username, email and password are required" });
        if (username.length < 3)
          return reply
            .code(400)
            .send({ message: "Username must be at least 3 characters" });
        if (!validateEmail(email))
          return reply.code(400).send({ message: "Invalid email format" });
        if (password.length < 6)
          return reply
            .code(400)
            .send({ message: "Password must be at least 6 characters" });
        const slug = normalizeUsername(username);
        const uid = generateUid();
        const [existingEmail, existingUsername, existingSlug] =
          await Promise.all([
            server.prisma.users.findUnique({
              where: { email: email.toLowerCase() },
            }),
            server.prisma.users.findUnique({
              where: { username: username.toLowerCase() },
            }),
            server.prisma.users.findUnique({ where: { slug } }),
          ]);
        if (existingEmail)
          return reply.code(409).send({ message: "Email already registered" });
        if (existingUsername)
          return reply.code(409).send({ message: "Username already taken" });
        if (existingSlug)
          return reply
            .code(409)
            .send({ message: "Username slug already exists" });
        const hashedPassword = await server.hash(password);
        
        const userImage = image && image.trim() !== '' 
          ? image 
          : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`;
        
        const user = await server.prisma.users.create({
          data: {
            uid,
            slug,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            bio: bio || "",
            image: userImage,
            favouriteEvents: [],
            followingUsers: [],
            comentarios: [],
            reservas: [],
          },
          select: {
            id: true,
            uid: true,
            slug: true,
            username: true,
            email: true,
            bio: true,
            image: true,
            isActive: true,
            status: true,
            favouriteEvents: true,
            followingUsers: true,
            comentarios: true,
            reservas: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return reply.code(201).send({ user });
      } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ message: "Internal server error" });
      }
    },
  });

  server.route({
    method: "PUT",
    url: "/users/:uid",
    onRequest: [requireAdmin],
    schema: schema.update,
    handler: async (req, reply) => {
      try {
        const { uid } = req.params;
        const input = req.body.user;
        const updateData = {};
        if (input.username) {
          if (input.username.length < 3)
            return reply
              .code(400)
              .send({ message: "Username must be at least 3 characters" });
          const slug = normalizeUsername(input.username);
          const [existingUsername, existingSlug] = await Promise.all([
            server.prisma.users.findUnique({
              where: { username: input.username.toLowerCase() },
            }),
            server.prisma.users.findUnique({ where: { slug } }),
          ]);
          if (existingUsername && existingUsername.uid !== uid)
            return reply.code(409).send({ message: "Username already taken" });
          if (existingSlug && existingSlug.uid !== uid)
            return reply
              .code(409)
              .send({ message: "Username slug already exists" });
          updateData.username = input.username.toLowerCase();
          updateData.slug = slug;
        }
        if (input.email) {
          if (!validateEmail(input.email))
            return reply.code(400).send({ message: "Invalid email format" });
          const existing = await server.prisma.users.findUnique({
            where: { email: input.email.toLowerCase() },
          });
          if (existing && existing.uid !== uid)
            return reply
              .code(409)
              .send({ message: "Email already registered" });
          updateData.email = input.email.toLowerCase();
        }
        if (input.password) {
          if (input.password.length < 6)
            return reply
              .code(400)
              .send({ message: "Password must be at least 6 characters" });
          updateData.password = await server.hash(input.password);
        }
        if (input.bio !== undefined) {
          if (input.bio && input.bio.length > 500)
            return reply
              .code(400)
              .send({ message: "Bio must be less than 500 characters" });
          updateData.bio = input.bio;
        }
        if (input.image !== undefined) updateData.image = input.image;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.status !== undefined) {
          if (!["active", "blocked", "pending"].includes(input.status))
            return reply.code(400).send({ message: "Invalid status" });
          updateData.status = input.status;
        }
        if (Object.keys(updateData).length === 0)
          return reply.code(400).send({ message: "No fields to update" });
  const user = await server.prisma.users.update({
          where: { uid },
          data: updateData,
          select: {
            id: true,
            uid: true,
            slug: true,
            username: true,
            email: true,
            bio: true,
            image: true,
            isActive: true,
            status: true,
            favouriteEvents: true,
            followingUsers: true,
            comentarios: true,
            reservas: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return { user };
      } catch (error) {
        if (error.code === "P2025")
          return reply.code(404).send({ message: "User not found" });
        req.log.error(error);
        return reply.code(500).send({ message: "Internal server error" });
      }
    },
  });

  server.route({
    method: "DELETE",
    url: "/users/:uid",
    onRequest: [requireAdmin],
    schema: schema.remove,
    handler: async (req, reply) => {
      try {
  await server.prisma.users.delete({ where: { uid: req.params.uid } });
        return reply.code(204).send();
      } catch (error) {
        if (error.code === "P2025")
          return reply.code(404).send({ message: "User not found" });
        req.log.error(error);
        return reply.code(500).send({ message: "Internal server error" });
      }
    },
  });
}
