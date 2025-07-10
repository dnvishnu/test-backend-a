const azureBlobService = require("../config/azureConfig");

const createFolder = async (bucketName, fullFolderPath) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  await containerClient.createIfNotExists();
  const blockBlobClient = containerClient.getBlockBlobClient(fullFolderPath);
  await blockBlobClient.upload("", 0);
};

const classifyFileOrFolder = (item) => {
  return item.name.endsWith("/") ? "folder" : "file";
};

const streamToString = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
};

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (chunk) => chunks.push(chunk));
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
}

const listFolder = async (bucketName, folderPath = "") => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  const folderPrefix = folderPath
    ? folderPath.endsWith("/")
      ? folderPath
      : folderPath + "/"
    : "";

  const result = [];
  for await (const blob of containerClient.listBlobsByHierarchy("/", {
    prefix: folderPrefix,
  })) {
    result.push({
      name: blob.name,
      type: blob.kind === "prefix" ? "folder" : "file",
    });
  }

  return result;
};

const listFilesCombined = async (bucketName, folderPath = "") => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  const folderPrefix = folderPath
    ? folderPath.endsWith("/")
      ? folderPath
      : folderPath + "/"
    : "";

  const result = [];
  for await (const blob of containerClient.listBlobsByHierarchy("/", {
    prefix: folderPrefix,
  })) {
    if (blob.kind === "prefix") {
      result.push({
        name: blob.name,
        type: "folder",
      });
    } else {
      const parts = blob.name.split(".");
      const ext = parts.pop();
      const baseName = parts.join(".");

      const existing = result.find((item) => item.name === baseName);
      if (existing) {
        existing.extensions.push(ext);
      } else {
        result.push({
          name: baseName,
          type: "file",
          extensions: [ext],
        });
      }
    }
  }
  return result;
};

const renameFile = async (bucketName, oldFilePath, newFilePath) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);

  const oldBlobClient = containerClient.getBlobClient(oldFilePath);
  const newBlobClient = containerClient.getBlobClient(newFilePath);

  await newBlobClient.beginCopyFromURL(oldBlobClient.url);
  await oldBlobClient.delete();

  return `File renamed to ${newFilePath}`;
};

const getFileContent = async (bucketName, filePath) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  const blobClient = containerClient.getBlobClient(filePath);
  const exists = await blobClient.exists();
  if (!exists) throw new Error(`File ${filePath} not found.`);
  const downloadResponse = await blobClient.download();
  return await streamToString(downloadResponse.readableStreamBody);
};

const getCombinedFileContent = async (bucketName, filePath) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  const baseName = filePath.split("/").pop().split(".")[0];
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));

  const contentByExtension = [];

  for await (const blob of containerClient.listBlobsByHierarchy("/", {
    prefix: dirPath,
  })) {
    const blobName = blob.name.split("/").pop();
    if (blobName.startsWith(baseName + ".")) {
      const blobClient = containerClient.getBlobClient(blob.name);
      const downloadResponse = await blobClient.download();
      const ext = blob.name.split(".").pop();
      const content = await streamToString(downloadResponse.readableStreamBody);
      contentByExtension.push({ file: baseName, ext, content });
    }
  }

  return contentByExtension;
};

const editContent = async (bucketName, filePath, content) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  const blockBlobClient = containerClient.getBlockBlobClient(filePath);
  await blockBlobClient.upload(content, content.length, { overwrite: true });
};

const editCombinedContent = async (bucketName, filePath, newContent) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);

  const updatePromises = newContent.map(async (file) => {
    const fullPath = `${filePath}.${file.ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(fullPath);
    await blockBlobClient.upload(file.content, file.content.length, {
      overwrite: true,
    });
  });

  await Promise.all(updatePromises);
};

const downloadFile = async (bucketName, filePath) => {
  const containerClient = azureBlobService.getContainerClient(bucketName);
  const blobClient = containerClient.getBlobClient(filePath);
  const exists = await blobClient.exists();
  if (!exists) throw new Error(`File ${filePath} not found`);
  const downloadResponse = await blobClient.download();
  const content = await streamToBuffer(downloadResponse.readableStreamBody);
  return content;
};

const getDynamicPage = async (bucketName, filePath) => {
  const extensions = ["title", "desc", "keywords", "htm"];
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(bucketName);
  const result = {};

  for (const ext of extensions) {
    const fullPath = `${filePath}.${ext}`;
    const blobClient = containerClient.getBlobClient(fullPath);

    try {
      const downloadResponse = await blobClient.download();
      const content = await streamToString(downloadResponse.readableStreamBody);
      result[ext] = content;
    } catch {
      // silently skip missing or unreadable blobs
    }
  }

  return result;
};

const deleteItem = async (bucketName, filePath) => {
  const isFolder = filePath.endsWith("/");
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(bucketName);

  if (isFolder) {
    const blobs = containerClient.listBlobsFlat({ prefix: filePath });
    let deletedCount = 0;

    for await (const blob of blobs) {
      const blobToDelete = containerClient.getBlobClient(blob.name);
      await blobToDelete.delete();
      deletedCount++;
    }

    if (deletedCount === 0) {
      const error = new Error(`Folder ${filePath} not found or already empty.`);
      error.code = 404;
      throw error;
    }
  } else {
    const blobClient = containerClient.getBlobClient(filePath);
    const exists = await blobClient.exists();
    if (!exists) {
      const error = new Error(`File ${filePath} not found.`);
      error.code = 404;
      throw error;
    }
    await blobClient.delete();
  }
};

module.exports = {
  createFolder,
  classifyFileOrFolder,
  streamToString,
  streamToBuffer,
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
