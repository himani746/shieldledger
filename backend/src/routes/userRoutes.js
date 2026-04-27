const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../lib/prisma");

const router = express.Router();

router.patch("/org", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const orgName =
      typeof req.body?.org_name === "string" ? req.body.org_name.trim() : undefined;
    const logoUrl =
      typeof req.body?.logo_url === "string" ? req.body.logo_url.trim() : undefined;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (orgName === undefined && logoUrl === undefined) {
      return res.status(400).json({
        message: "At least one of org_name or logo_url must be provided.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(orgName !== undefined ? { org_name: orgName } : {}),
        ...(logoUrl !== undefined ? { logo_url: logoUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        org_name: true,
        logo_url: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update organisation profile.",
      error: error.message,
    });
  }
});

module.exports = router;
