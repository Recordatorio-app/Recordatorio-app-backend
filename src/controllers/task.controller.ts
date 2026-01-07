import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas y recordatorios
 */
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener tareas del usuario
 *     description: >
 *       Devuelve las tareas del usuario autenticado con paginación,
 *       filtro por estado y estadísticas.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Página actual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 4
 *         description: Cantidad de tareas por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, realizada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     totalItems:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                 stats:
 *                   type: object
 *                   properties:
 *                     pendientes:
 *                       type: number
 *                     realizadas:
 *                       type: number
 *       500:
 *         description: Error interno del servidor
 */

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 4;
    const status = req.query.status as "pendiente" | "realizada" | undefined;

    const skip = (page - 1) * limit;

    const filter: any = { userId };
    if (status) filter.status = status;

    const [tasks, totalFiltered, pendientes, realizadas] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

      Task.countDocuments(filter),

      Task.countDocuments({ userId, status: "pendiente" }),
      Task.countDocuments({ userId, status: "realizada" }),
    ]);

    res.json({
      data: tasks,
      pagination: {
        page,
        limit,
        totalItems: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit),
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
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener tarea por ID
 *     description: Devuelve una tarea específica del usuario autenticado.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error interno del servidor
 */

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
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear nueva tarea
 *     description: >
 *       Crea una tarea asociada al usuario autenticado.
 *       El colorKey debe existir en la paleta del usuario.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - colorKey
 *             properties:
 *               title:
 *                 type: string
 *                 example: Comprar medicinas
 *               description:
 *                 type: string
 *                 example: Ir a la farmacia a las 6pm
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-10T18:00:00.000Z
 *               colorKey:
 *                 type: string
 *                 example: urgente
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos inválidos o colorKey no permitido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { title, description, reminderDate, colorKey } = req.body;

    if (!title || !colorKey)
      return res.status(400).json({ msg: "Faltan title o colorKey" });

    // verify user and that colorKey exists in user's palette (or default)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    const palette = user.colorPalette;
    if (!palette || !(colorKey in palette)) {
      return res
        .status(400)
        .json({ msg: "colorKey inválido para este usuario" });
    }

    const task = await Task.create({
      title,
      description,
      reminderDate,
      status: "pendiente",
      userId: req.userId,
      colorKey,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualizar tarea
 *     description: >
 *       Actualiza una tarea del usuario autenticado.
 *       Si se modifica colorKey, debe existir en la paleta del usuario.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendiente, realizada]
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *               colorKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       400:
 *         description: colorKey inválido
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error interno del servidor
 */

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

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: userId },
      updates,
      { new: true }
    );
    if (!task) return res.status(404).json({ msg: "Tarea no encontrada" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
};
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     description: Elimina una tarea del usuario autenticado.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *       500:
 *         description: Error interno del servidor
 */

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
