import { Request, Response } from "express";
import prisma from "../prisma/prismaClient";
import bcrypt from "bcrypt";

export const register = async (req: Request, res: Response) => {
  try {
    let { id, username, email, password, role, zoneId } = req.body;

    if (id) {
      const user = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          username: username,
          email: email,
          role: role,
          zoneId: zoneId,
        },
      });
      return res.status(200).json({ success: true, user: user });
    }

    const isExists = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: username,
          },
          {
            email: email,
          },
        ],
      },
    });
    if (isExists) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    const u = await prisma.user.findFirst();
    if (!u) {
      role = "SUPPORT";
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        zoneId: zoneId || null,
        role: role,
      },
    });
    res.status(201).json({ success: true, user: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
    console.log(error);
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
};
