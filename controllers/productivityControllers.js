import ProductivityAnalysis from "../models/ProductivityAnalysis.js"


export async function saveAnalysisToDb(user, geminiJson) {
    try {
        const parsedTimeWindow = {
            start: geminiJson.timeWindow?.start ? new Date(geminiJson.timeWindow.start) : undefined,
            end: geminiJson.timeWindow?.end ? new Date(geminiJson.timeWindow.end) : undefined
        };

        if (!parsedTimeWindow.start || !parsedTimeWindow.end) {
            throw new Error('❌ timeWindow.start or end missing in Gemini response');
        }
        const saved = await ProductivityAnalysis.create({
            user: user,
            ...geminiJson,
            timeWindow: parsedTimeWindow
        });
        console.log(`✅ Saved productivity analysis to DB: with user ${user}`, saved._id);
        return saved;
    } catch (error) {
        console.error('❌ Failed to save analysis:', error);
        throw error;
    }
}


export const getAnalysisFromDb = async (req, res) => {
    try {
        const user = req.user?.userId;
        const { startTime, endTime } = req.query;
        if (!user || !startTime || !endTime) {
            throw new Error('❌ Missing required parameters: user, startTime, or endTime');
        }

        const results = await ProductivityAnalysis.find({
            user,
            'timeWindow.start': { $gte: new Date(startTime) },
            'timeWindow.end': { $lte: new Date(endTime) }
        }).sort({ 'timeWindow.start': 1 }); // optional: sort by time

        console.log(`✅ Retrieved ${results.length} productivity entries for user ${user}`);
        return res.json(results);
    } catch (error) {
        console.error('❌ Failed to fetch analysis:', error);
        throw error;
    }
}

export const getAllProductivityAnalysisForDay = async (req, res) => {
  try {
    const user = req.user?.userId;
    const {  date } = req.query;

    if (!user || !date) {
      return res.status(400).json({ message: "Missing userId or date in query" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const rawResults = await ProductivityAnalysis.find({
      user: user,
      "timeWindow.start": {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ "timeWindow.start": 1 });

    const results = rawResults.map(entry =>{
      const start = new Date (entry.timeWindow.start);
      const end = new Date (entry.timeWindow.end);

      const isOptions = {timeZone: 'Asia/Kolkata', hours12:true};
      return {
        ...entry.toObject(),
        timeWindow:{
          ...entry.timeWindow,
          startIST: start.toLocaleString('en-IN', isOptions),
          endIST : end.toLocaleString('en-IN', isOptions)
        }
      };
    });

    console.log(`✅ Found ${results.length} productivity entries for ${date}`);
    return res.status(200).json(results);

  } catch (error) {
    console.error('❌ Failed to fetch productivity analysis for the day:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
