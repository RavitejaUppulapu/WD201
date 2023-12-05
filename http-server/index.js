const http = require("http");
const fs = require("fs").promises;
const args = require("minimist")(process.argv.slice(2));

let registrationContent, homeContent, projectContent;

async function readFiles() {
  try {
    registrationContent = await fs.readFile("registration.html", "utf8");
    homeContent = await fs.readFile("home.html", "utf8");
    projectContent = await fs.readFile("project.html", "utf8");
  } catch (err) {
    console.error("Error reading files:", err);
    process.exit(1);
  }
}

async function startServer() {
  await readFiles();

  const server = http.createServer((req, res) => {
    let url = req.url;
    res.writeHead(200, { "Content-Type": "text/html" });

    if (url === "/project") {
      res.end(projectContent);
    } else if (url === "/registration") {
      res.end(registrationContent);
    } else {
      res.end(homeContent);
    }
  });

  // Use the correct port from command line arguments or default to 3000
  const PORT = args["port"] || 5000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
