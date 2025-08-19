import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";

const NOTES_DB = "notes.json";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

const PORT = process.env.PORT || 3000;

type Note = {
  id: number;
  title: string;
  content: string;
}

if (!fs.existsSync(NOTES_DB)) {
  fs.writeFileSync(NOTES_DB, ""); 
  console.log("Файл створено:", NOTES_DB);
}

function readNotesFromFile(): Note[] {
  try {
    const data = fs.readFileSync(NOTES_DB, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Помилка читання файлу:", error);
    return [];
  }
}

app.get("/", (req: Request, res: Response) => {
  const notes: Note[] = readNotesFromFile();
  res.json(notes);
});

app.get("/:id", (req: Request, res: Response) => {
  const notes: Note[] = readNotesFromFile();
  const id = BigInt(req.params.id); 
  const note = notes.find((note) => BigInt(note.id) === id);
  if (!note) {
    return res.status(404).send("Note not found");
  }
  res.json(note);
});

app.post("/", (req: Request, res: Response) => {
  const notes: Note[] = readNotesFromFile();
  const newNote: Note = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content
  };
  notes.push(newNote);

  fs.writeFileSync(NOTES_DB, JSON.stringify(notes, null, 2));
  res.status(201).json(newNote);

});

app.delete("/:id", (req: Request, res: Response) => {
  const notes: Note[] = readNotesFromFile();
  const noteId = parseInt(req.params.id, 10);
  const updatedNotes = notes.filter(note => note.id !== noteId);
  
  fs.writeFileSync(NOTES_DB, JSON.stringify(updatedNotes, null, 2));
  res.status(204).send();
});

app.put("/:id", (req: Request, res: Response) => {
  const notes: Note[] = readNotesFromFile();
  const noteId = parseInt(req.params.id, 10);
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex === -1) {
    return res.status(404).send("Note not found");
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    title: req.body.title,
    content: req.body.content,
  };

  fs.writeFileSync(NOTES_DB, JSON.stringify(notes, null, 2));
  res.json(notes[noteIndex]);
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
