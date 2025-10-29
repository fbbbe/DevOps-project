import dotenv from "dotenv";
dotenv.config();

export default {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  walletLocation: process.env.DB_WALLET_LOCATION,
  walletPassword: process.env.DB_WALLET_PASSWORD,
};
