import prisma from "../Lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;
  console.log(req.query);

  try {
    // Initialize an empty object to hold the query conditions
    let whereConditions = {
      ...(query.city && {
        city: {
          contains: query.city.trim().toLowerCase(),
          mode: "insensitive", // Case-insensitive filter
        },
      }),
      ...(query.type && { type: query.type }),
      ...(query.property && { property: query.property }),
      ...(query.bedroom && { bedroom: parseInt(query.bedroom) }),
    };

    // Add price filter if either minPrice or maxPrice is provided
    if (query.minPrice || query.maxPrice) {
      whereConditions.price = {};

      if (query.minPrice) {
        whereConditions.price.gte = parseInt(query.minPrice);
      }
      if (query.maxPrice) {
        whereConditions.price.lte = parseInt(query.maxPrice);
      }
    }

    // Fetch the posts using Prisma ORM
    const posts = await prisma.post.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        address: true,
        city: true,
        bedroom: true,
        bathroom: true,
        latitude: true,
        longitude: true,
        type: true,
        property: true,
        amenities: true, // Assuming it's directly in `Post`
        createdAt: true,
        user: true,
        userId: true,
        postDetail: {
          select: {
            // Assuming amenities is a JSON field, no need to select `included` and `excluded` individually
            amenities: true, // Directly select the entire amenities object
          },
        },
        savedPosts: {
          select: {
            id: true,
          },
        },
      },
    });

    posts.map((post) => {
      // Ensure amenities are never null or undefined
      post.amenities = post.amenities || { included: [], excluded: [] };
      console.log(post); // Log the modified post
      return post; // Return the modified post
    });

    // Return the posts in the response
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res
            .status(200)
            .json({ ...post, isSaved: saved ? true : false });
        } else {
          return res.status(200).json({ ...post, isSaved: false });
        }
      });
    } else {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const { postData, postDetail } = req.body; // Destructure body for clarity
  const tokenUserId = req.userId;

  try {
    // Validate required fields
    if (!postData || !postDetail) {
      return res
        .status(400)
        .json({ message: "Post data and details are required" });
    }

    // Validate amenities field if it's provided
    const validatedAmenities = postDetail.amenities
      ? {
          included: postDetail.amenities.included || [],
          excluded: postDetail.amenities.excluded || [],
        }
      : { included: [], excluded: [] }; // Default empty arrays for amenities if not provided

    // Create the new post with nested postDetail
    const newPost = await prisma.post.create({
      data: {
        ...postData,
        userId: tokenUserId,
        postDetail: {
          create: {
            ...postDetail,
            amenities: validatedAmenities, // Ensure amenities are validated and passed
          },
        },
      },
      include: {
        postDetail: true,
      },
    });

    res.status(200).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const { postData, postDetail } = req.body;
  const postId = req.params.id;
  const tokenUserId = req.userId;

  try {
    // Validate required fields
    if (!postData || !postDetail) {
      return res
        .status(400)
        .json({ message: "Post data and details are required" });
    }

    const validatedAmenities = postDetail.amenities
      ? {
          included: postDetail.amenities.included || [],
          excluded: postDetail.amenities.excluded || [],
        }
      : { included: [], excluded: [] };

    const postToUpdate = await prisma.post.update({
      where: { id: postId },
      data: {
        ...postData,
        postDetail: {
          update: {
            ...postDetail,
            amenities: validatedAmenities,
          },
        },
      },
      include: {
        postDetail: true,
      },
    });

    res.status(200).json(postToUpdate);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
