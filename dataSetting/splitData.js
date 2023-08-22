import fs from "fs";
import path from "path";
//수많은 데이터셋을 50개씩 나누기 위한 로직
const inputdir = "../emotion_data/train/surprise";
const outputdir = "../emotion_data_splited/surprise";

const chunkSize = 50;

fs.readdir(inputdir, (err, files) => {
  if (err) {
    console.log("Error reading directory", err);
    return;
  }

  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    const chunkdir = path.join(outputdir, `chunk_${i / chunkSize + 1}`);

    fs.mkdirSync(chunkdir, { recursive: true });

    chunk.forEach(file => {
      const srcPath = path.join(inputdir, file);
      const destPath = path.join(chunkdir, file);

      fs.copyFileSync(srcPath, destPath);
    });
  }
});
