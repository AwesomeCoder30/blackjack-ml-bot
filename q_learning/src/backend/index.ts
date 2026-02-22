import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5001;
const DATA_DIR = process.env.DATA_DIR || "./data";

createApp(DATA_DIR)
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
