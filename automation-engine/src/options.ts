// Specify the path to the file
const filePath = "/data/options.json";

try {
  // Read the contents of the file
  const fileContent = await Deno.readTextFile(filePath);

  // Parse the JSON content
  const jsonData = JSON.parse(fileContent);

  // Display the parsed JSON data
  console.log(jsonData);
} catch (error) {
  console.error(`Error reading or parsing the file: ${error.message}`);
}

// Close Deno
Deno.exit();
