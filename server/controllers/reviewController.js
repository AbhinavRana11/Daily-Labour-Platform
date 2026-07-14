import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Labour from "../models/Labour.js";

// @desc    Submit worker review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { bookingId, workerId, rating, review, images } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify that the customer owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to review this booking" });
        }

        // Only completed bookings can be reviewed
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: "Reviews are only allowed after a booking is completed" });
        }

        // Check if already reviewed
        const alreadyReviewed = await Review.findOne({ booking: bookingId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this booking" });
        }

        const newReview = new Review({
            booking: bookingId,
            worker: workerId,
            customer: req.user.id,
            rating: Number(rating),
            review,
            images: images || []
        });

        const savedReview = await newReview.save();

        // Recalculate average rating & total reviews for the Labour document
        const reviews = await Review.find({ worker: workerId });
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        
        // Count completed jobs
        const completedJobs = await Booking.countDocuments({ labour: workerId, status: 'completed' });

        await Labour.findByIdAndUpdate(workerId, {
            rating: Number(averageRating.toFixed(1)),
            totalReviews: totalReviews,
            completedJobs: completedJobs
        });

        res.status(201).json(savedReview);
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get reviews for a specific worker
// @route   GET /api/reviews/:workerId
// @access  Public
export const getWorkerReviews = async (req, res) => {
    try {
        const { workerId } = req.params;
        
        const reviews = await Review.find({ worker: workerId })
            .populate("customer", "username")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error("Get Worker Reviews Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const workerId = review.worker;
        await review.deleteOne();

        // Recalculate worker stats
        const reviews = await Review.find({ worker: workerId });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;

        await Labour.findByIdAndUpdate(workerId, {
            rating: Number(averageRating.toFixed(1)),
            totalReviews: totalReviews
        });

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
