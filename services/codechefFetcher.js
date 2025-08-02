import axios from "axios";
import * as cheerio from "cheerio";


const codechefFetcher = async (username) => {
  try {
    const response = await axios.get(`https://www.codechef.com/users/${username}`);
    const html = response.data;
    const $ = cheerio.load(html);
    //scraping rating
    const ratingText = $(".rating-number").text().trim();
    const ratingTextMatch = ratingText.match(/\d{4}/);
    const currentRating = ratingTextMatch ? ratingTextMatch[0] : "N/A";
    //scraping contests
    const contestsText = $(".contest-participated-count").text().trim();
    const contestsTextMatch=contestsText.match(/\d+/);
    const contests=contestsTextMatch?parseInt(contestsTextMatch[0]):0;
    //scraping rank
    const rankText = $(".rating").text().trim();
    const rankTextMatch=rankText.match(/\d/);
    const currentRank=rankTextMatch?parseInt(rankTextMatch[0])+ " star":"1 star";
    
    //scraping problems count
    const problemsSolvedText = $(".problems-solved").text().trim();
    const problemsSolvedTextMatch=problemsSolvedText.match(/Total Problems Solved:\s*(\d+)/);
    const problemsSolved=problemsSolvedTextMatch?parseInt(problemsSolvedTextMatch[1]):0;
    //scraping maxRating
    const maxRatingText = $(".rating-header").text().trim();
    const maxRatingTextMatch=maxRatingText.match(/Highest Rating\s*(\d+)/);
    const maxRating=maxRatingTextMatch?parseInt(maxRatingTextMatch[1]):0;
    //scrape rating History
    const scriptData = $("script")
    .map((i, el) => $(el).html())
    .get()
    .find(str => str.includes("var all_rating"));

    let ratingHistory = [];

    if (scriptData) {
    const match = scriptData.match(/var all_rating\s*=\s*(\[\{.*?\}\]);/s);
    if (match && match[1]) {
        ratingHistory = JSON.parse(match[1]);
    }
    }
    ratingHistory = ratingHistory.map(entry => ({
        contest: entry.name,
        date: entry.end_date.split(" ")[0],
        rating: parseInt(entry.rating)
    }));    

    // scrape heatmap
    let heatmap = [];
    const scripts = $("script").toArray();
    scripts.forEach((script) => {
    const scriptContent = $(script).html();
    if (scriptContent && scriptContent.includes("userDailySubmissionsStats")) {
        const match = scriptContent.match(
        /userDailySubmissionsStats\s*=\s*(\[[^\]]+\])/
        );
        if (match && match[1]) {
        try {
            heatmap = JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse heatmap data", e.message);
        }
        }
    }
    });
    heatmap=heatmap.map(({date,value})=>({
        date,
        "count":value
    }))

    const data={
        currentRating,
        currentRank,
        maxRating,
        contests,
        problemsSolved,
        ratingHistory,
        heatmap
    }
    return data;
      } catch (err) {
    console.error("Error fetching CodeChef rating:", err.message);
  }
};

export default codechefFetcher;