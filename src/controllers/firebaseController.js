const { createSite } = require("../services/firebaseService");

async function createSiteController(req, res) {
  const { projectId, siteId } = req.body;

  if (!projectId || !siteId) {
    return res.status(400).json({ error: "Missing projectId or siteId" });
  }

  try {
    const data = await createSite(projectId, siteId);
    res.status(200).json({ message: "Site created", data });
  } catch (error) {
    console.error(
      "Error creating site:",
      (error.response && error.response.data) || error.message
    );
    res.status(500).json({ error: "Failed to create site" });
  }
}

module.exports = {
  createSiteController,
};
