import express from "express";
import cors from "cors";
import oracledb from "oracledb";
import dbConfig from "./db/dbConfig.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8181;

// ✅ 예시: recipes 테이블 조회
app.get("/api/recipes", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      walletLocation: dbConfig.walletLocation,
      walletPassword: dbConfig.walletPassword,
    });

    const result = await connection.execute("SELECT * FROM RECIPES");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
