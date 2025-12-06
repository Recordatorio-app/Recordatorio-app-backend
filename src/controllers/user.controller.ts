import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COLOR_KEYS } from "../utils/defaultPalette";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Faltan campos" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone });

    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};

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
 * Update only colors for fixed keys.
 * Body should be an object with some of the color keys and hex strings.
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

export const getPalette = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json({ palette: user.colorPalette });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
