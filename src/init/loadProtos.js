import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import protobuf from 'protobufjs';
import { packetNames } from '../protobuf/packNames.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 최상위 경로
const protoDir = path.join(__dirname, '../protobuf');

const getAllProtoFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      // if - 디렉토리인가?
      getAllProtoFiles(filePath, fileList);
    } else if (path.extname(file) === '.proto') {
      // else if - .proto 확장자만
      fileList.push(filePath);
    }
  });

  return fileList;
};

const protoFiles = getAllProtoFiles(protoDir);

const protoMessages = {};

export const loadProtos = async () => {
  try {
    //
    const root = new protobuf.Root();

    await Promise.all(protoFiles.map((file) => root.load(file)));

    for (const [packageName, types] of Object.entries(packetNames)) {
      protoMessages[packageName] = {};

      for (const [type, typeName] of Object.entries(types)) {
        protoMessages[packageName][type] = root.lookupType(typeName);
      }
    }

    console.log('protoMessages =>> ', protoMessages);
    console.log(`Protobuf 파일이 로드되었습니다.`);
  } catch (error) {
    console.error(`protobuf 파일 로드 중 오류가 발생했습니다 : ${error}`);
  }
};

export const getProtoMessages = () => {
  // 얕은복사를 이용
  return { ...protoMessages };
};
