const axios = require("axios");
const { getAccessToken } = require("../config/firebaseConfig");

async function createSite(projectId, siteId) {
  const accessToken = await getAccessToken();

  const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites`;

  const response = await axios.post(
    `${url}?siteId=${siteId}`,
    { type: "DEFAULT_SITE" },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

module.exports = {
  createSite,
};
