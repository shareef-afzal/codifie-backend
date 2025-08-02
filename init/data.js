const users=[
    {
        username:"random5",
        institute:"iiest shibpur",
        email:"afzal@gmail.com",
        profiles:{
            codechef:"https://www.codechef.com/users/afzal_shareef",
            codeforces:"https://codeforces.com/profile/ShareefAfzal",
            leetcode:"https://leetcode.com/u/Afzal_shareef/"
        },
        platformStats:{
            Codeforces: {
                currentRating: 1720,
                currentRank: 'Specialist',
                maxRating: 1800,
                problemsSolved: 280,
                contests:41,
                ratingHistory: [
                { date: '2024-01-01', rating: 1800, contest: 'January Long' },
                { date: '2024-02-01', rating: 1850, contest: 'February Cookoff' },
                { date: '2024-03-01', rating: 1900, contest: 'March Lunchtime' },
                ],
                heatmap: Array.from({ length: 180 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (179 - i));
                return {
                    date: date.toISOString().split('T')[0],
                    count: Math.floor(Math.random() * 12)
                };
                })
            },  
            CodeChef: {
                currentRating: 2100,
                currentRank: '4★ Coder',
                maxRating: 2200,
                problemsSolved: 190,
                contests:32,
                ratingHistory: [
                { date: '2024-01-01', rating: 1800, contest: 'January Long' },
                { date: '2024-02-01', rating: 1850, contest: 'February Cookoff' },
                { date: '2024-03-01', rating: 1900, contest: 'March Lunchtime' },
                ],
                heatmap:[]
            },
            LeetCode: {
                currentRating: 1850,
                currentRank: 'Knight',
                maxRating: 1900,
                problemsSolved: 325,
                contests:17,
                ratingHistory: [
                { date: '2024-01-01', rating: 1800, contest: 'January Long' },
                { date: '2024-02-01', rating: 1850, contest: 'February Cookoff' },
                { date: '2024-03-01', rating: 1900, contest: 'March Lunchtime' },
                ],
                heatmap:[]
            }
        }

    }
];

export default users;