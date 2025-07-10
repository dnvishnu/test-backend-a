const { storage } = require("../config/gcpConfig");

const createFolder = async (bucketName, fullFolderPath) => {
  const file = storage.bucket(bucketName).file(fullFolderPath);
  await file.save("");
};

const classifyFileOrFolder = (item) => {
  return item.name.endsWith("/") ? "folder" : "file";
};

const listFolder = async (bucketName, folderPath = "") => {
  const options = { delimiter: "/" };
  if (folderPath) {
    options.prefix = folderPath.endsWith("/") ? folderPath : folderPath + "/";
  }

  const [files, , metadata] = await storage
    .bucket(bucketName)
    .getFiles(options);

  const items = files
    .filter(
      (file) =>
        !folderPath ||
        (file.name !== folderPath && file.name !== `${folderPath}/`)
    )
    .map((file) => ({
      name: file.name,
      type: classifyFileOrFolder(file),
    }));

  const folders =
    metadata && metadata.prefixes
      ? metadata.prefixes.map((prefix) => ({ name: prefix, type: "folder" }))
      : [];

  return [...items, ...folders];
};

const listFilesCombined = async (bucketName, folderPath = "") => {
  const options = { delimiter: "/" };

  if (folderPath) {
    options.prefix = folderPath.endsWith("/") ? folderPath : folderPath + "/";
  }

  const [files, , metadata] = await storage
    .bucket(bucketName)
    .getFiles(options);

  const items = files
    .filter(
      (file) =>
        !folderPath ||
        (file.name !== folderPath && file.name !== `${folderPath}/`)
    )
    .map((file) => ({
      name: file.name,
      type: classifyFileOrFolder(file),
      size: file.metadata?.size ? parseInt(file.metadata.size, 10) : null,
      lastModified: file.metadata?.updated || null,
    }));

  const folders =
    metadata && metadata.prefixes
      ? metadata.prefixes.map((prefix) => ({
          name: prefix,
          type: "folder",
          size: null,
          lastModified: null,
        }))
      : [];

  const allItems = [...items, ...folders];

  const combinedFiles = allItems.reduce((acc, item) => {
    if (item.type === "file") {
      const parts = item.name.split(".");
      const ext = parts.pop();
      const baseName = parts.join(".");

      const existing = acc.find(
        (i) => i.name === baseName && i.type === "file"
      );

      if (existing) {
        existing.extensions.push(ext);
      } else {
        acc.push({
          name: baseName,
          type: "file",
          extensions: [ext],
          size: item.size,
          lastModified: item.lastModified,
        });
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);

  return combinedFiles;
};

const renameFile = async (bucketName, oldFilePath, newFilePath) => {
  const file = storage.bucket(bucketName).file(oldFilePath);
  await file.rename(newFilePath);
  return `File renamed to ${newFilePath}`;
};

const getFileContent = async (bucketName, filePath) => {
  const file = storage.bucket(bucketName).file(filePath);
  const [exists] = await file.exists();
  if (!exists) throw new Error(`File ${filePath} not found.`);
  const [content] = await file.download();
  return content.toString();
};

const getCombinedFileContent = async (bucketName, filePath) => {
  const baseName = filePath.split("/").pop().split(".")[0];
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));

  const [files] = await storage
    .bucket(bucketName)
    .getFiles({ prefix: dirPath });

  const matchingFiles = files.filter((file) => {
    const fileName = file.name.split("/").pop();
    return fileName.startsWith(baseName + ".");
  });

  const contentByExtension = await Promise.all(
    matchingFiles.map(async (file) => {
      const [content] = await file.download();
      const ext = file.name.split(".").pop();
      return { file: baseName, ext, content: content.toString() };
    })
  );

  return contentByExtension;
};

const editContent = async (bucketName, filePath, content) => {
  const file = storage.bucket(bucketName).file(filePath);
  const [exists] = await file.exists();
  await file.save(content);
};

const editCombinedContent = async (bucketName, filePath, newContent) => {
  const updatePromises = newContent.map(async (file) => {
    const fullPath = `${filePath}.${file.ext}`;
    const bucketFile = storage.bucket(bucketName).file(fullPath);
    await bucketFile.save(file.content);
  });

  await Promise.all(updatePromises);
};

const downloadFile = async (bucketName, filePath) => {
  const file = storage.bucket(bucketName).file(filePath);
  const [exists] = await file.exists();
  if (!exists) throw new Error(`File ${filePath} not found`);
  const [content] = await file.download();
  return content;
};

const getDynamicPage = async (bucketName, filePath) => {
  const extensions = ["title", "desc", "keywords", "htm"];
  const bucket = storage.bucket(bucketName);
  const result = {};

  for (const ext of extensions) {
    const fullPath = `${filePath}.${ext}`;
    const file = bucket.file(fullPath);

    try {
      const [contents] = await file.download();
      result[ext] = contents.toString();
    } catch {
      // silently skip missing or unreadable files
    }
  }

  return result;
};

const deleteItem = async (bucketName, filePath) => {
  const isFolder = filePath.endsWith("/");
  const bucket = storage.bucket(bucketName);

  if (isFolder) {
    const [files] = await bucket.getFiles({ prefix: filePath });
    if (files.length === 0) {
      const error = new Error(`Folder ${filePath} not found or already empty.`);
      error.code = 404;
      throw error;
    }
    await Promise.all(files.map((file) => file.delete()));
  } else {
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) {
      const error = new Error(`File ${filePath} not found.`);
      error.code = 404;
      throw error;
    }
    await file.delete();
  }
};

module.exports = {
  createFolder,
  classifyFileOrFolder,
  listFolder,
  listFilesCombined,
  renameFile,
  getFileContent,
  getCombinedFileContent,
  editContent,
  editCombinedContent,
  downloadFile,
  getDynamicPage,
  deleteItem,
};
