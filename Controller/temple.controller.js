import Prisma from "../Lib/Prisma.js";

export const getTempleDetails = async (req, res) => {
  const templeId = req.params.templeId;

  try {
    // Ensure `templeId` is a string
    const templeIdString = templeId.toString();

    // Fetch the temple data
    const temple = await prisma.temple.findUnique({
      where: { id: templeIdString },
    });

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    res.status(200).json(temple);
  } catch (err) {
    console.error("Error fetching temple details:", err);
    res.status(500).json({ message: "Failed to fetch temple details" });
  }
};

export const getAllTemples = async (req, res) => {
  try {
    // Fetch all temples
    const temples = await prisma.temple.findMany();

    if (temples.length === 0) {
      return res.status(404).json({ message: "No temples found" });
    }

    res.status(200).json(temples);
  } catch (err) {
    console.error("Error fetching temples:", err);
    res.status(500).json({ message: "Failed to fetch temples" });
  }
};
