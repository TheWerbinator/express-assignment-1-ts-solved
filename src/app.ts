import express from "express";
import { PrismaClient } from "@prisma/client";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());
// All code should go below this line

app.get("/dogs", async (req, res) => {
  const nameHas = req.query.nameHas as string;
  const dogs = await prisma.dog.findMany({
    where: {
      name: {
        contains: nameHas,
      },
    },
  });
  res.send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = ;
  const isNumeric = (str: string | number) => {
    if (typeof str != "string") return false
    return !isNaN(str) && 
           !isNaN(parseFloat(str))
  }

  if (isNumeric(id)) {
    return res
      .status(400)
      .send({ error: "id should be a number" });
  }

  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });

  if (!dog) {
    return res.status(204).send({ error: "Dog not found" });
  } else id = parseInt(id)

  res.send(dog);
});

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const deleted = await Promise.resolve()
    .then(() =>
      prisma.dog.delete({
        where: {
          id,
        },
      })
    )
    .catch(() => null);
  if (deleted === null) {
    res.status(404).send({ error: "Dog not found" });
  }
  return res.status(200).send("Great Success!");
});

app.post("/dogs", async (req, res) => {
  const body = req.body;
  const name = body?.name;
  const description = body?.description;
  const breed = body?.breed;
  const age = body?.age;
  const standardKeys = [
    "name",
    "description",
    "breed",
    "age",
  ];
  interface errors {
    errors: [string];
  }
  const dataErrors = {} as errors;
  dataErrors.errors = [""];
  if (typeof name !== "string") {
    dataErrors.errors.push("name should be a string");
  }
  if (typeof description !== "string") {
    dataErrors.errors.push(
      "description should be a string"
    );
  }
  if (typeof age !== "number") {
    dataErrors.errors.push("age should be a number");
  }

  let correctKeys = true;
  const incorrectKeys: string[] = [];

  Object.keys(body).forEach((key) => {
    if (!standardKeys.includes(key)) {
      correctKeys = false;
      incorrectKeys.push(key);
    }
  });

  if (!correctKeys) {
    incorrectKeys.forEach((incorrectKey) =>
      dataErrors.errors.push(
        `'${incorrectKey}' is not a valid key`
      )
    );
  }

  try {
    const newDog = await prisma.dog.create({
      data: {
        name,
        description,
        breed,
        age,
      },
    });
    res.status(201).send(newDog);
  } catch (e) {
    console.error(dataErrors);
    dataErrors.errors.splice(0, 1);
    res.status(400).send(dataErrors);
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const body = req.body;
  const name = body?.name;
  const id = +req.params.id;

  if (typeof name !== "string") {
    return res
      .status(400)
      .send({ error: "Name must be a string" });
  }

  try {
    const dog = await prisma.dog.update({
      where: {
        id,
      },
      data: {
        name: name,
      },
    });
    res.status(201).send(dog);
  } catch (error) {
    console.error(error);
    res.status(400);
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
