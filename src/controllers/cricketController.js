const cricketService = require("../services/cricketService");

const getSitemapOld = async (req, res) => {
  const baseUrl = "https://www.daynightcricket.com";
  const numDays = 15;

  const dates = Array.from({ length: numDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0].split("-").reverse().join("-");
  });

  const matchesList = await Promise.all(
    dates.map((d) => cricketService.getMatches(d))
  );
  const allMatches = matchesList.flat();

  const matchUrls = allMatches
    .map((match) => {
      const index = dates.indexOf(match.date);
      let priority = "0.6";
      if (index <= 2) priority = "0.9";
      else if (index <= 8) priority = "0.7";

      return `
      <url>
        <loc>${baseUrl}/match/${match.seriesId}/${match.matchId}?date=${match.date}</loc>
        <changefreq>daily</changefreq>
        <priority>${priority}</priority>
      </url>`;
    })
    .join("");

  const dateUrls = dates
    .map(
      (date) => `
    <url>
      <loc>${baseUrl}/${date}</loc>
      <changefreq>daily</changefreq>
      <priority>0.5</priority>
    </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${matchUrls}
      ${dateUrls}
    </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(sitemap);
};

const uploadMatch = async (req, res) => {
  const { date, matchData } = req.body;

  if (!date || !matchData) {
    return res.status(400).json({
      success: false,
      message: "Date and matchData are required.",
    });
  }

  const result = await cricketService.updateJsonFile(date, matchData);
  res.status(result.success ? 200 : 500).json(result);
};

const generateSummary = async (req, res) => {
  const { date, seriesId, matchId, data } = req.body;

  if (!date || !seriesId || !matchId || !data) {
    return res.status(400).json({
      success: false,
      message: "Date, seriesId, matchId, and data are required.",
    });
  }

  try {
    const matchObject = await cricketService.getPromptFromGCP();
    if (!matchObject) {
      return res.status(500).json({
        success: false,
        message: "Error fetching prompt.",
      });
    }

    const prompt = matchObject.prompt.replace("{score_card}", data);
    const response = await fetch(
      "https://us-central1-onboarding-bot-14200.cloudfunctions.net/expressApi/api/openai",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          parameters: matchObject.parameters,
        }),
      }
    );

    let responseData;
    try {
      responseData = await response.json();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Invalid JSON from OpenAI",
      });
    }

    const summary = responseData.choices[0].message.content;

    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Invalid API response.",
      });
    }

    const result = await cricketService.saveSummaryToGCP(
      date,
      seriesId,
      matchId,
      summary
    );
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching summary.",
    });
  }
};

const getSitemap = async (req, res) => {
  const baseUrl = "https://www.daynightcricket.com";

  const startDate = new Date("2025-05-01");
  const today = new Date();

  const sitemapUrls = [];

  while (startDate <= today) {
    const year = startDate.getFullYear();
    const month = startDate
      .toLocaleString("default", { month: "short" })
      .toLowerCase(); // e.g. "may"
    const weekNumber = Math.floor((startDate.getDate() - 1) / 7) + 1;

    sitemapUrls.push(
      `<sitemap><loc>${baseUrl}/sitemaps/${year}-${month}-${weekNumber}.xml</loc></sitemap>`
    );

    // Move to next week
    startDate.setDate(startDate.getDate() + 7);
  }

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapUrls.join("\n")}
    </sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(sitemapIndex);
};

const getSubSitemap = async (req, res) => {
  const { year, month, week } = req.params;
  const baseUrl = "https://www.daynightcricket.com";

  const monthMap = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const monthIndex = monthMap[month.toLowerCase()];
  const weekNumber = parseInt(week);

  if (monthIndex === undefined || weekNumber < 1 || weekNumber > 4) {
    console.error("❌ Invalid month or week:", { month, week });
    return res.status(400).send("Invalid month or week");
  }

  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay =
    weekNumber === 4 ? lastDayOfMonth : Math.min(startDay + 6, lastDayOfMonth);

  const startDate = new Date(year, monthIndex, startDay);
  const endDate = new Date(year, monthIndex, endDay);

  const dateList = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateList.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const formatDate = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formattedDates = dateList.map(formatDate);
  const matchesList = await Promise.all(
    formattedDates.map(cricketService.getMatches)
  );
  const allMatches = matchesList.flat();

  const matchUrls = allMatches
    .map((match) => {
      const index = formattedDates.indexOf(match.date);
      let priority = "0.6";
      if (index >= 4 && index <= 6) priority = "0.9";
      else if (index >= 1 && index <= 3) priority = "0.7";

      return `
    <url>
      <loc>${baseUrl}/match/${match.seriesId}/${match.matchId}?date=${match.date}</loc>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>
    </url>`;
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    ${matchUrls}
  </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(sitemap);
};

module.exports = {
  getSitemapOld,
  uploadMatch,
  generateSummary,
  getSitemap,
  getSubSitemap,
};
