// Backend - Express.js API for Flowgo DSL Parser & Diagram Generator
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ dest: "uploads/" });

// Function to parse Flowgo DSL into Mermaid-compatible format
function parseFlowgoDSL(dsl) {
    const lines = dsl.split("\n");
    let mermaidData = "graph TD;\n";
    let nodes = new Set();
    let edges = [];

    lines.forEach((line) => {
        const trimmed = line.trim();

        // Extract workflow name
        if (trimmed.startsWith("workflow")) {
            const workflowName = trimmed.split(" ")[1];
            mermaidData += `subgraph ${workflowName}\n`;
        } 
        // Detect actions
        else if (trimmed.startsWith("action")) {
            const actionParts = trimmed.split(" ");
            if (actionParts.length >= 2) {
                const actionName = actionParts[1].split("(")[0]; // Extract action name
                nodes.add(actionName);
            }
        }
        // Handle connections ( -> syntax)
        else if (trimmed.includes("->")) {
            const [from, to] = trimmed.replace(";", "").split("->").map(s => s.trim());
            edges.push(`${from} --> ${to}`);
        }
        // Close workflow block
        else if (trimmed === "}") {
            mermaidData += "end\n";
        }
    });

    // Add all nodes
    nodes.forEach(node => {
        mermaidData += `${node}["${node}"];\n`;
    });

    // Add all edges
    edges.forEach(edge => {
        mermaidData += edge + "\n";
    });

    return mermaidData;
}


// Route to handle Flowgo DSL file upload
app.post("/upload", upload.single("file"), (req, res) => {
    const filePath = req.file.path;
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading file" });
        }

        console.log("Received file data:\n", data);

        try {
            const parsedDiagram = parseFlowgoDSL(data);
            console.log("Generated Mermaid Diagram:\n", parsedDiagram);
            res.json({ success: true, diagram: parsedDiagram });
        } catch (error) {
            res.status(400).json({ error: "Failed to parse DSL", details: error.message });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
