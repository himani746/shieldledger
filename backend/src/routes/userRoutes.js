const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../lib/prisma");

const router = express.Router();

router.patch("/org", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const orgName = typeof req.body?.org_name === "string" ? req.body.org_name.trim() : undefined;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!orgName) return res.status(400).json({ message: "org_name is required." });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: orgName },
      select: { id: true, email: true, name: true },
    });

    return res.status(200).json({ ...updatedUser, org_name: updatedUser.name });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update organisation profile.", error: error.message });
  }
});

module.exports = router;
