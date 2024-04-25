import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();

router.route("/refresh").post((req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(404).json("No refresh token");
  }
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.status(401).json("Invalid refresh token");
      const accessToken = generateToken(user.id);
      res.status(200).json(accessToken);
    }
  );
});

export default router;
