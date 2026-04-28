const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const register = async (req, res) => {
  try {
    const { email, password, org_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const orgName = org_name || email.split("@")[0];
    const slug = orgName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const org = await prisma.organization.create({
      data: { name: orgName, slug },
    });

    const user = await prisma.user.create({
      data: {
        name: orgName,
        email,
        password_hash: hashedPassword,
        organization_id: org.id,
      },
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: user.id, email: user.email, org_name: user.name },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        userId: user.id,
        email: user.email,
        organization_id: user.organization_id,
        organizationId: user.organization_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, email: user.email, org_name: user.name },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

module.exports = { register, login };
