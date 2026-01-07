import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COLOR_KEYS } from "../utils/defaultPalette";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión y autenticación de usuarios
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Credenciales inválidas
 *       404:
 *         description: Usuario no encontrado
 */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Credenciales inválidas" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea un nuevo usuario y devuelve un JWT automáticamente.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               phone:
 *                 type: string
 *                 example: "+51987654321"
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Usuario ya existe o faltan campos
 *       500:
 *         description: Error interno del servidor
 */

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Faltan campos" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Devuelve la información del usuario sin la contraseña.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};

/**
 * @swagger
 * /api/users/{id}/colors:
 *   put:
 *     summary: Actualizar paleta de colores del usuario
 *     description: >
 *       Actualiza solo los colores permitidos (máximo 6).
 *       El usuario debe ser el propietario del recurso.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               urgente: "#FF0000"
 *               normal: "#00FF00"
 *     responses:
 *       200:
 *         description: Paleta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 palette:
 *                   type: object
 *       400:
 *         description: Claves o colores inválidos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const updateColors = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = req.body; // e.g. { urgente: "#FF0000", normal: "#00FF00" }

    // validate keys
    const invalid = Object.keys(updates).filter(
      (k) => !COLOR_KEYS.includes(k as any)
    );
    if (invalid.length)
      return res.status(400).json({ msg: "Claves inválidas", invalid });

    // validate hex-ish values (basic)
    for (const k of Object.keys(updates)) {
      const v = updates[k];
      if (typeof v !== "string" || !/^#([0-9A-Fa-f]{6})$/.test(v)) {
        return res
          .status(400)
          .json({ msg: `Color inválido para ${k}`, color: v });
      }
    }
    if ((req as any).userId !== req.params.id)
      return res.status(403).json({ msg: "No autorizado" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // merge with existing palette
    const newPalette = { ...(user.colorPalette || {}), ...updates };

    // ensure final palette has at most 6 keys (should be fixed)
    const keys = Object.keys(newPalette);
    if (keys.length > 6)
      return res.status(400).json({ msg: "Máximo 6 colores" });

    user.colorPalette = newPalette;
    await user.save();

    res.json({ ok: true, palette: user.colorPalette });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
/**
 * @swagger
 * /api/users/{id}/palette:
 *   get:
 *     summary: Obtener paleta de colores del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paleta obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 palette:
 *                   type: object
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const getPalette = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json({ palette: user.colorPalette });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
