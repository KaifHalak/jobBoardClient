import fs from "fs"
import path from "path"

const directoryPath = path.join(__dirname, "../","public"); // Replace with your directory path

function deleteJsFiles(directory: string) {
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      // If it's a directory, recursively call the function
      deleteJsFiles(filePath);
    } else if (path.extname(filePath) === '.js') {
      // If it's a .js file, delete it
      fs.unlinkSync(filePath);
    }
  });
}

deleteJsFiles(directoryPath);
