import Prisma from "../Lib/Prisma.js";

export const getReviews = async (req, res) => {
  const postId = req.params.postId;

  try {
    // Validate if the post exists before fetching reviews
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const reviews = await prisma.review.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(reviews);
  } catch (err) {
    console.log("Error getting reviews:", err);
    res.status(500).json({ message: "Failed to get reviews" });
  }
};

export const addReview = async (req, res) => {
  console.log("Request Body:", req.body); // Log the body to check incoming data
  console.log("UserId from Token:", req.userId); // Log the userId to check if it's attached

  const { comment, stars, username } = req.body;
  const postId = req.params.postId;

  try {
    // Validate required fields
    if (!comment || !stars || !username) {
      return res.status(400).json({
        message: "Comment, stars, and username are required.",
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        message: "Stars rating must be between 1 and 5.",
      });
    }

    // Fetch the user's avatar based on userId
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { avatar: true }, // Only select the avatar
    });

    // If the user doesn't have an avatar, use a default one
    const avatar = user?.avatar || "/noavatar.jpg";

    const newReview = await prisma.review.create({
      data: {
        comment,
        stars,
        username,
        postId,
        userId: req.userId, // Use the userId from the token
        avatar, // Save the avatar with the review
      },
    });

    res.status(200).json(newReview);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};
export const deleteReview = async (req, res) => {
  const { postId, reviewId } = req.params;
  const userId = req.userId;

  try {
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Ensure the post exists before deleting the review
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.log("Error deleting review:", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
