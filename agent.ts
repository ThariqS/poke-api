#!/usr/bin/env node

import { query } from "@anthropic-ai/claude-agent-sdk";
import path from "path";

async function main() {
  // Run a query using the SDK
  const result = query({
    model: "sonnet-4-5",
    workingDirectory: path.join(import.meta.dir, "agent"),
    prompt: "Introduce yourself and explain what you can help with in the context of this PokeAPI SDK project.",
    hooks: {
      preExecution: async ({ operation }) => {
        // Security hook: block script files (.js and .ts) from being written
        // outside the custom_scripts directory
        if (operation.type === "Write") {
          const filePath = operation.parameters.file_path;
          if (
            (filePath.endsWith(".js") || filePath.endsWith(".ts")) &&
            !filePath.includes("custom_scripts")
          ) {
            return {
              blocked: true,
              message: `Security policy: Script files can only be written to the custom_scripts directory. Please use a path like: ${path.join(
                import.meta.dir,
                "agent",
                "custom_scripts",
                path.basename(filePath)
              )}`,
            };
          }
        }
        return { blocked: false };
      },
    },
  });

  // Consume the async iterator to get streaming responses
  for await (const message of result) {
    console.log(message);
  }
}

main();
