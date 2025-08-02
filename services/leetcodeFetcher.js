import axios from 'axios';

const leetcodeFetcher = async (username) => {
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const fetchHeatmap = async (year) => {
      const variables = { username, year };
      const query = `
        query fetchData($username: String!, $year: Int) {
          matchedUser(username: $username) {
            userCalendar(year: $year) {
              submissionCalendar
            }
          }
        }
      `;
      const res = await axios.post('https://leetcode.com/graphql', {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const rawCalendar = res.data.data.matchedUser.userCalendar.submissionCalendar;
      const parsed = JSON.parse(rawCalendar);

      return Object.entries(parsed).map(([timestamp, count]) => ({
        date: new Date(Number(timestamp) * 1000).toISOString().split("T")[0],
        count: Number(count)
      }));
    };

    const [thisYearHeatmap, lastYearHeatmap] = await Promise.all([
      fetchHeatmap(currentYear),
      fetchHeatmap(previousYear)
    ]);

    const fullHeatmap = [...lastYearHeatmap, ...thisYearHeatmap];

    const userQuery = `
      query fetchUserData($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          contest {
            title
            startTime
          }
        }
      }
    `;
    const userDataRes = await axios.post('https://leetcode.com/graphql', {
      query: userQuery,
      variables: { username }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    let contestData=userDataRes.data.data.userContestRankingHistory;
    let ratingHistory=[];
    let maxRating=0;
    contestData.map((obj)=>{
      if(obj.attended){
        ratingHistory.push({
          date:new Date(obj.contest.startTime*1000).toISOString().split("T")[0],
          rating:Math.round(obj.rating),
          contest:obj.contest.title
        });
        maxRating=Math.max(maxRating,obj.rating);
      }
    })
    maxRating=Math.round(maxRating);
    const currentRating = Math.round(userDataRes.data.data.userContestRanking.rating);
    const contests = userDataRes.data.data.userContestRanking.attendedContestsCount;
    const badgeObj = userDataRes.data.data.userContestRanking.badge;
    const currentRank = badgeObj ? badgeObj.name : "No Badge";
    const problemsSolved = userDataRes.data.data.matchedUser.submitStatsGlobal.acSubmissionNum[0].count;

    const data = {
      currentRating,
      currentRank,
      maxRating,
      contests,
      problemsSolved,
      ratingHistory,
      heatmap: fullHeatmap
    };

    return data;

  } catch (err) {
    console.error('LeetCode fetch failed:', err.response?.data?.errors || err.message);
    return null;
  }
};

export default leetcodeFetcher;
