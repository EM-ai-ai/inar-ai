const { makeSourceUrl } = require("./source-config");

const defaultNotebookKey = "architect";

const notebooks = Object.freeze([
  Object.freeze({
    key: "architect",
    id: "d5a915b1-64ae-4668-9fc4-fe62c4bfa56a",
    label: "InAR - Progetti",
    shortLabel: "Progetti",
    code: "PR",
    title: "InAR - Progetti",
    description: "Consulta progetti, capitolati, materiali e documentazione tecnica dello studio."
  }),
  Object.freeze({
    key: "dip",
    id: "4d9b8338-8d74-4429-8ef3-d53445e289ef",
    label: "InAR AI - DIP",
    shortLabel: "DIP",
    code: "DI",
    title: "InAR AI - DIP",
    description: "Interroga la documentazione DIP nell'area dedicata e mantieni separato il relativo contesto."
  }),
  Object.freeze({
    key: "gare",
    id: "df20f3c7-9587-4ce2-8cf9-41264a927abd",
    label: "InAR - Gare",
    shortLabel: "Gare",
    code: "GA",
    title: "InAR - Gare",
    description: "Consulta bandi, requisiti e materiali di gara nell'archivio InAR dedicato."
  })
]);

const notebookByKey = Object.freeze(Object.fromEntries(
  notebooks.map((notebook) => [notebook.key, notebook])
));

const notebookUrls = Object.freeze(Object.fromEntries(
  notebooks.map((notebook) => [notebook.key, makeSourceUrl(notebook.id)])
));

module.exports = {
  defaultNotebookKey,
  notebookByKey,
  notebooks,
  notebookUrls
};
