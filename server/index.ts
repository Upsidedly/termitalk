import type { ServerWebSocket } from "bun";
import { bold } from "colorette";
import consola from "consola";
import * as p from "@clack/prompts";

async function promptNumber(message: string, def?: number): Promise<number> {
  let num: number | undefined = undefined;
  while (!num) {
    const numResult = Number(await consola.prompt(message, { type: "text", default: def?.toString() }));
    if (isNaN(numResult)) {
      if (def) {
        consola.warn("Defaulting to", def);
        return def;
      }
      consola.warn("That is not a valid number!");
      continue;
    }
    num = numResult;
  }
  return num;
}

async function fetchValues() {
    return p.group({
        name: () => p.text({ message: "What is the name of talk server?", validate: (v) => (v.length > 1 ? undefined : "Name must be 2 or more characters") }),
        port: () =>
          p.text({
            message: "What is the port of talk server?",
            validate: (v) => (isNaN(Number(v)) ? "Port must be a number" : undefined),
            defaultValue: "6667",
          }),
        password: () => p.text({ message: "What is the password of talk server?", defaultValue: "None" }),
      });
}

const values = await fetchValues();

const serverInfo = {
    name: values.name,
    port: Number(values.port),
    password: values.password === "None" ? undefined : values.password,
}

// const serverInfo = {
//     name: await consola.prompt('What is the name of talk server?', { type: 'text' }),
//     port: await promptNumber('What is the port of talk server?', 6667),
//     password: await consola.prompt('What is the password of talk server?', { type: 'text', default: '' }),
// }

function id() {
  const numbers = "0123456789";
  return Array.from({ length: 10 }, () => numbers[Math.floor(Math.random() * 10)]).join("");
}

const connectedUsers = new Map<string, ServerWebSocket>();
consola.info(`Starting server ${bold(serverInfo.name)} on port ${bold(serverInfo.port)}...`);

const server = Bun.serve({
  port: Number(serverInfo.port),
  fetch(request, server) {
    if (server.upgrade(request)) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws) {
      ws.send("hi!", true);
    },

    message(ws, message) {},
  },
});

consola.info(`Server started! ${server.url.toString()}`);
