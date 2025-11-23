import { Router } from "express";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export let router = Router();

fs.readdirSync(__dirname).forEach((dir) => {
  if (fs.statSync(path.join(__dirname, dir)).isFile()) {
    return;
  }

  fs.readdirSync(path.join(__dirname, dir)).forEach((filename) => {
    const folder_path = path.join(__dirname, dir);
    const route_path = path.join(folder_path, filename);

    import(pathToFileURL(route_path).href).then((module) => {
      if (module.router && module.path) {
        router.use(module.path, module.router);
      }
    });
  });
});
