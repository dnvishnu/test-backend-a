const cmsGcpService = require("../services/cmsGcpService");

const createFolder = async (req, res) => {
  const { bucketName, folderName, folderPath } = req.body;

  if (!bucketName || !folderName) {
    return res.status(400).json({
      success: false,
      message: "Bucket name and folder name are required",
    });
  }

  const fullFolderPath = folderPath
    ? `${
        folderPath.endsWith("/") ? folderPath : folderPath + "/"
      }${folderName}/`
    : `${folderName}/`;

  try {
    await cmsGcpService.createGCPFolder(bucketName, fullFolderPath);
    return res.status(201).json({
      success: true,
      message: `Folder '${fullFolderPath}' created successfully in GCP bucket '${bucketName}'`,
    });
  } catch (error) {
    console.error("❌ Error creating GCP folder:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating GCP folder",
      error: error.message,
    });
  }
};

const listFolder = async (req, res) => {
  const bucketName = req.params.bucketName;
  const folderPath = req.query.folderPath || "";

  if (!bucketName) {
    return res.status(400).json({
      success: false,
      message: "Bucket name is required",
    });
  }

  try {
    const result = await cmsGcpService.listFolder(bucketName, folderPath);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error listing GCP folder:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching GCP files and folders",
      error: error.message,
    });
  }
};

const listFilesCombined = async (req, res) => {
  const bucketName = req.params.bucketName;
  const folderPath = req.query.folderPath || "";

  if (!bucketName) {
    return res.status(400).json({
      success: false,
      message: "Bucket name is required",
    });
  }

  try {
    const combinedFiles = await cmsGcpService.listFilesCombined(
      bucketName,
      folderPath
    );

    return res.status(200).json({
      success: true,
      data: combinedFiles,
    });
  } catch (error) {
    console.error("❌ Error listing GCP combined files:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching GCP files and folders",
      error: error.message,
    });
  }
};

const editItem = async (req, res) => {
  const { bucketName, oldFilePath, newFilePath } = req.body;

  if (!bucketName || !oldFilePath || !newFilePath) {
    return res.status(400).json({
      success: false,
      message: "Bucket name, old file path, and new file path are required",
    });
  }

  try {
    const message = await cmsGcpService.renameFile(
      bucketName,
      oldFilePath,
      newFilePath
    );

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (err) {
    console.error("❌ Error renaming GCP item:", err);
    return res.status(500).json({
      success: false,
      message: "Error renaming item in GCP",
      error: err.message,
    });
  }
};

const getContent = async (req, res) => {
  const { bucketName, filePath, combined } = req.query;

  if (!bucketName || !filePath) {
    return res.status(400).json({
      success: false,
      message: "Bucket name and file path are required.",
    });
  }

  try {
    if (combined === "true") {
      const contentList = await cmsGcpService.getCombinedFileContent(
        bucketName,
        filePath
      );
      return res.status(200).json({ success: true, list: contentList });
    } else {
      const content = await cmsGcpService.getFileContent(bucketName, filePath);
      return res.status(200).send(content);
    }
  } catch (err) {
    console.error("❌ Error fetching GCP file content:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching GCP file content",
      error: err.message,
    });
  }
};

const editContent = async (req, res) => {
  const { bucketName, filePath, newContent } = req.body;
  const isCombined = req.query.combined === "true";

  if (!bucketName || !filePath || !newContent) {
    return res.status(400).json({
      success: false,
      message: "Bucket name, file path, and new content are required.",
    });
  }

  try {
    if (isCombined) {
      await cmsGcpService.editCombinedContent(bucketName, filePath, newContent);
    } else {
      await cmsGcpService.editContent(bucketName, filePath, newContent);
    }

    return res.status(200).send("Content updated successfully.");
  } catch (err) {
    console.error("❌ GCP Error editing content:", err);
    return res.status(500).json({
      success: false,
      message: "GCP Error writing or editing file",
      error: err.message,
    });
  }
};

const downloadFile = async (req, res) => {
  const { bucketName, filePath } = req.query;

  if (!bucketName || !filePath) {
    return res.status(400).json({
      success: false,
      message: "Bucket name and file path are required.",
    });
  }

  try {
    const content = await cmsGcpService.downloadFile(bucketName, filePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filePath.split("/").pop()}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    return res.status(200).send(content);
  } catch (err) {
    console.error("❌ GCP Error downloading file:", err);
    return res.status(500).json({
      success: false,
      message: "GCP Error downloading file",
      error: err.message,
    });
  }
};

const getDynamicPage = async (req, res) => {
  const { bucketName, filePath } = req.body;

  if (!bucketName || !filePath) {
    return res.status(400).json({
      success: false,
      message: "Bucket name and file path are required",
    });
  }

  try {
    const data = await cmsGcpService.getDynamicPage(bucketName, filePath);

    if (Object.keys(data).length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for given file path",
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("GCP Error getting dynamic page:", err);
    return res.status(500).json({
      success: false,
      message: "Error getting item data",
      error: err.message,
    });
  }
};

const deleteItem = async (req, res) => {
  const { bucketName, filePath } = req.body;

  if (!bucketName || !filePath) {
    return res.status(400).json({
      success: false,
      message: "Bucket name and file path are required.",
    });
  }

  try {
    await cmsGcpService.deleteItem(bucketName, filePath);
    return res.status(200).json({
      success: true,
      message: `Item ${filePath} deleted successfully.`,
    });
  } catch (err) {
    console.error("GCP Error deleting item:", err);
    if (err.code === 404) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: err.message,
    });
  }
};

module.exports = {
  createFolder,
  listFolder,
  listFilesCombined,
  editItem,
  getContent,
  editContent,
  downloadFile,
  getDynamicPage,
  deleteItem,
};
