const fs = require("fs");
const path = require("path");

// Use the same directory as the script
const scriptDirectory = __dirname;

// Input directory (same as script directory)
const directoryPath = scriptDirectory;

// Output JSON file (same directory as script)
const outputFilePath = path.join(scriptDirectory, "data.json");

// Object to store the mapping
const dataMap = {};

// Function to process files
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error("Unable to read directory:", err);
        return;
    }

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        try {
            // Read file content
            let content = fs.readFileSync(filePath, "utf-8").trim();

            // Extract only numbers
            const numbers = content.match(/\d+/g);

            if (numbers) {
                // Limit each number to a maximum of 10 occurrences
                const numberCounts = {};
                const limitedNumbers = numbers.filter((num) => {
                    numberCounts[num] = (numberCounts[num] || 0) + 1;
                    return numberCounts[num] <= 50;
                });

                if (limitedNumbers.length > 0) {
                    // Join numbers with a space
                    dataMap[file] = limitedNumbers.join(" ");
                }
            }
        } catch (err) {
            console.warn(`Could not process file ${file}:`, err);
        }
    });

    // Write the result to the JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(dataMap, null, 2), "utf-8");
    console.log(`Data has been written to ${outputFilePath}`);
});
