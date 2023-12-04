const http = require("http");
const fs = require("fs").promises;

const PORT = 5000;

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

// Start reading files
readFiles().then(() => {
  // Start the server after all files are read
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

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
