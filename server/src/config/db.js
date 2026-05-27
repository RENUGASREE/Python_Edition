import mongoose from "mongoose";

const opts = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

let listenersAttached = false;

function attachReconnectHandlers(uri) {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected — will retry on next request");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[db] MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB error:", err.message);
  });
}

/** Connect to MongoDB — retries once for cold starts (Render free tier) */
export async function connectDB(uri) {
  attachReconnectHandlers(uri);
  const attempt = async (label) => {
    console.log(`[db] Connecting (${label})...`);
    await mongoose.connect(uri, opts);
    console.log("[db] MongoDB connected");
  };

  try {
    await attempt("primary");
  } catch (err) {
    console.warn("[db] First connect failed, retrying in 3s...", err.message);
    await new Promise((r) => setTimeout(r, 3000));
    await attempt("retry");
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
