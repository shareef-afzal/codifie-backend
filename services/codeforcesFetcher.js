import axios from 'axios';

const BASE_URL="https://codeforces.com/api"
const codeforcesFetcher = async (handle)=>{
    try{
    // get user information
    let userdataRes=await axios.get(`${BASE_URL}/user.info?handles=${handle}`)
        let userData=userdataRes.data.result[0];
        const currentRating=userData.rating;
        const currentRank=userData.rank;
        const maxRating=userData.maxRating;

    //get rating history
    let ratingsDataRes=await axios.get(`${BASE_URL}/user.rating?handle=${handle}`)
        let ratingsData=ratingsDataRes.data.result;
        const ratingHistory = ratingsData.map((obj) => ({
            contest: obj.contestName,
            date: new Date(obj.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
            rating: obj.newRating,
        }));
        const contests=ratingsData.length;
    //get Submissions data
    let submissionsDataRes=await axios.get(`${BASE_URL}/user.status?handle=${handle}`)
        let submissionsData=submissionsDataRes.data.result;
        const solved=new Set();
        let heatmap={};
        submissionsData.map((obj)=>{
            if(obj.verdict=="OK"){
                solved.add(obj.problem.contestId+obj.problem.index);

                const submissionDate = new Date(obj.creationTimeSeconds * 1000)
                                        .toISOString()
                                        .split("T")[0]; // YYYY-MM-DD
                if (!heatmap[submissionDate]) {
                heatmap[submissionDate] = 0;
                }
                heatmap[submissionDate]++;
            }

        })
        heatmap = Object.entries(heatmap).map(([date, count]) => ({
            date,
            count,
        }))
        const problemsSolved=solved.size;
        
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
    }
    catch(err){
        
         console.error("Failed to fetch Codeforces data:", err.message);
        return null;
    }
}
export default codeforcesFetcher;