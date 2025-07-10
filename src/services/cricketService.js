const axios = require("axios");
const { storage } = require("../config/gcpConfig");

async function getMatches(date) {
  const bucketUrl = `https://storage.googleapis.com/daynightcricket/${date}.json?t=${new Date().getTime()}`;

  try {
    const response = await axios.get(bucketUrl);
    if (response.status !== 200) return [];

    const data = response.data;
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      date,
      seriesId: item.series_id || "unknown",
      matchId: item.id || "unknown",
      version: item.id ? "v2" : "v1",
    }));
  } catch (error) {
    return [];
  }
}

async function getPromptFromGCP() {
  const file = storage.bucket("kreateprompts").file("daynightcricket.json");
  try {
    const [contents] = await file.download();
    const json = JSON.parse(contents.toString());
    return json.find((obj) => obj.id === "match") || null;
  } catch {
    return null;
  }
}

async function updateJsonFile(date, matchData) {
  const fileName = `${date}.json`;
  const bucket = storage.bucket("daynightcricket");
  const file = bucket.file(fileName);

  try {
    const [exists] = await file.exists();
    let jsonArray = [];

    if (exists) {
      const [contents] = await file.download();
      try {
        jsonArray = JSON.parse(contents.toString());
      } catch {
        return { success: false, message: "Parse error." };
      }
    }

    const index = jsonArray.findIndex((item) => item.id === matchData.id);
    if (index !== -1) {
      jsonArray[index] = matchData;
    } else {
      jsonArray.push(matchData);
    }

    await file.save(JSON.stringify(jsonArray));
    return { success: true, message: "File updated." };
  } catch {
    return { success: false, message: "Update failed." };
  }
}

async function saveSummaryToGCP(date, seriesId, matchId, summary) {
  const path = `${date}/${seriesId}/${matchId}_summary.txt`;
  try {
    await storage.bucket("daynightcricket").file(path).save(summary);
    return { success: true, message: "Saved summary." };
  } catch {
    return { success: false, message: "Save failed." };
  }
}

const getPromptFromGCP = async () => {
  const bucketName = "kreateprompts";
  const fileName = "daynightcricket.json";
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  try {
    const [fileContents] = await file.download();
    const jsonArray = JSON.parse(fileContents.toString());
    const matchObject = jsonArray.find((obj) => obj.id === "match");
    return matchObject ? matchObject : null;
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return null;
  }
};

const updateJsonFile = async (date, matchData) => {
  const fileName = `${date}.json`;
  const bucketName = "daynightcricket";
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  try {
    const [fileExists] = await file.exists();
    let jsonArray = [];

    if (fileExists) {
      const [fileContents] = await file.download();
      try {
        jsonArray = JSON.parse(fileContents.toString());
      } catch (parseError) {
        console.error("Error parsing file contents:", parseError);
        return { success: false, message: "Error parsing existing JSON." };
      }
    }

    // Check if an object with the same id exists
    const index = jsonArray.findIndex((item) => item.id === matchData.id);
    if (index !== -1) {
      jsonArray[index] = matchData; // Replace existing object
    } else {
      jsonArray.push(matchData); // Add new object
    }

    await file.save(JSON.stringify(jsonArray));
    return { success: true, message: "File updated successfully." };
  } catch (error) {
    console.error("Error updating file:", error);
    return { success: false, message: "Error updating file." };
  }
};

const saveSummaryToGCP = async (date, seriesId, matchId, summary) => {
  const filePath = `${date}/${seriesId}/${matchId}_summary.txt`;
  const bucketName = "daynightcricket";
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  try {
    await file.save(summary);
    return { success: true, message: "Summary saved successfully." };
  } catch (error) {
    console.error("Error saving summary:", error);
    return { success: false, message: "Error saving summary." };
  }
};

module.exports = {
  getMatches,
  getPromptFromGCP,
  updateJsonFile,
  saveSummaryToGCP,
  getPromptFromGCP,
  updateJsonFile,
};
