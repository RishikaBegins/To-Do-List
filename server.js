const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

console.log("SERVER RUNNING CORRECT FILE");

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("class.db");

app.get("/", (req, res) => {
  res.send("To-Do API is running");
});

app.get("/test", (req, res) => {
  res.send("TEST WORKING");
});

app.post("/tasks", (req, res) => {
  console.log("POST /tasks hit");

  const { title, description } = req.body;
  const status = "todo";

  db.run(
    "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)",
    [title, description, status],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send({ id: this.lastID });
    },
  );
});

app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.send(rows);
  });
});

app.patch("/tasks/:id/status", (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  db.get("SELECT status FROM tasks WHERE id = ?", [taskId], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send("Task not found");

    const oldStatus = row.status;

    db.run(
      "UPDATE tasks SET status = ? WHERE id = ?",
      [status, taskId],
      function (err) {
        if (err) return res.status(500).send(err.message);

        db.run(
          "INSERT INTO task_status_history (task_id, from_status, to_status) VALUES (?, ?, ?)",
          [taskId, oldStatus, status],
        );

        res.send("Status updated");
      },
    );
  });
});

app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).send(err.message);
    res.send("Task deleted");
  });
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
