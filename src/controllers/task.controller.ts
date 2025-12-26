import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const [tasks, total, pendientes, realizadas] = await Promise.all([
      Task.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Task.countDocuments({ userId }),

      Task.countDocuments({ userId, status: "pendiente" }),
      Task.countDocuments({ userId, status: "realizada" }),
    ]);

    res.json({
      data: tasks,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pendientes,
        realizadas,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id;
    const task = await Task.findOne({ _id: id, userId: userId });
    if (!task) return res.status(404).json({ msg: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};  

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { title, description, reminderDate, colorKey } = req.body;

    if (!title || !colorKey) return res.status(400).json({ msg: "Faltan title o colorKey" });

    // verify user and that colorKey exists in user's palette (or default)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    const palette = user.colorPalette;
    if (!palette || !(colorKey in palette)) {
      return res.status(400).json({ msg: "colorKey inválido para este usuario" });
    }

    const task = await Task.create({
      title,
      description,
      reminderDate,
      status: "pendiente",
      userId: req.userId,
      colorKey
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id;
    const updates = req.body;

    // if colorKey is updated, verify it is allowed
    if (updates.colorKey) {
      const user = await User.findById(userId);
      if (!user || !(updates.colorKey in (user.colorPalette || {}))) {
        return res.status(400).json({ msg: "colorKey inválido" });
      }
    }

    const task = await Task.findOneAndUpdate({ _id: id, userId: userId }, updates, { new: true });
    if (!task) return res.status(404).json({ msg: "Tarea no encontrada" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id;
    await Task.findOneAndDelete({ _id: id, userId: userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
