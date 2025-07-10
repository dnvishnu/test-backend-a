const { storage } = require("../config/gcpConfig");

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

    const index = jsonArray.findIndex((item) => item.id === matchData.id);
    if (index !== -1) {
      jsonArray[index] = matchData;
    } else {
      jsonArray.push(matchData);
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

// Your match logic (if exists)
const getMatches = async (req, res) => {
  // your logic
};

module.exports = {
  getMatches,
  getPromptFromGCP,
  updateJsonFile,
  saveSummaryToGCP,
};
