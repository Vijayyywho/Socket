import prisma from "../Lib/Prisma.js";

// Fetch details for a specific beach based on the ID
export const getBeachDetails = async (req, res) => {
  const beachId = req.params.beachId;

  try {
    // Ensure the beachId is a string
    const beachIdString = beachId.toString();

    // Fetch the beach data
    const beach = await prisma.beaches.findUnique({
      where: { id: beachIdString },
    });

    if (!beach) {
      return res.status(404).json({ message: "Beach not found" });
    }

    res.status(200).json(beach);
  } catch (err) {
    console.error("Error fetching beach details:", err);
    res.status(500).json({ message: "Failed to fetch beach details" });
  }
};

// Fetch all beaches
export const getAllBeaches = async (req, res) => {
  try {
    // Fetch all beaches
    const beaches = await prisma.beaches.findMany();

    if (beaches.length === 0) {
      return res.status(404).json({ message: "No beaches found" });
    }

    res.status(200).json(beaches);
  } catch (err) {
    console.error("Error fetching beaches:", err);
    res.status(500).json({ message: "Failed to fetch beaches" });
  }
};
