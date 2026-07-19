import {readFile, readdir} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");

export async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(ROOT,relativePath),"utf8"));
}

export async function loadJurisdiction(id) {
  return readJson(`config/jurisdictions/${id}.json`);
}

export async function loadOrganization(id="demo-global") {
  return readJson(`config/organizations/${id}.json`);
}

export async function loadScenario(id) {
  return readJson(`scenarios/${id.endsWith(".json")?id:`${id}.json`}`);
}

export async function listScenarios() {
  return (await readdir(join(ROOT,"scenarios"))).filter((name)=>name.endsWith(".json")).sort();
}
