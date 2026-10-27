import { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import { ChevronLeft, ChevronRight, MapPin, Quote, Star } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiUrl = import.meta.env.VITE_API_URL;
const imageBaseUrl = `${apiUrl.replace('/api', '')}/uploads`;

const RatingStars = ({ rating }) => (
  <div
    className="flex items-center gap-0.5"
    aria-label={`${rating} out of 5 stars`}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={16}
        className={
          star <= rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-200 text-gray-200'
        }
      />
    ))}
  </div>
);

const FeedbackAvatar = ({ feedback }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = (feedback.name || '?')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!feedback.image || imgFailed) {
    return (
      <span className="primaryBgColor accentTextColor flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {initials}
      </span>
    );
  }

  return (
    <img
      src={`${imageBaseUrl}/${feedback.image}`}
      alt={feedback.name}
      loading="lazy"
      onError={() => setImgFailed(true)}
      className="size-11 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white"
    />
  );
};

const FeedbackCard = ({ feedback }) => (
  <div className="px-2">
    <figure className="flex h-full flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_-15px_rgba(0,57,93,0.25)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <RatingStars rating={feedback.rating} />
        <Quote
          size={18}
          className="shrink-0 text-[var(--tertiaryColor)]"
          aria-hidden="true"
        />
      </div>

      <blockquote className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
        &ldquo;{feedback.message}&rdquo;
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-4">
        <FeedbackAvatar feedback={feedback} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {feedback.name}
          </p>
          {feedback.location && (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin size={12} className="shrink-0" />
              {feedback.location}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  </div>
);

const arrowBtn =
  'absolute top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-[var(--primaryColor)] shadow-[0_6px_20px_-6px_rgba(0,0,0,0.25)] transition-all duration-200 hover:primaryBgColor hover:text-white hover:border-transparent active:scale-95 sm:flex';

const CustomPrevArrow = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Previous feedback"
    className={`${arrowBtn} left-2 lg:left-3`}
  >
    <ChevronLeft size={18} />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Next feedback"
    className={`${arrowBtn} right-2 lg:right-3`}
  >
    <ChevronRight size={18} />
  </button>
);

const skeletonCard = (i) => (
  <div
    key={i}
    className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
  >
    <div className="space-y-3 p-5 md:p-6">
      <Skeleton height={16} width="40%" />
      <Skeleton height={12} />
      <Skeleton height={12} width="85%" />
      <Skeleton height={12} width="60%" />
      <div className="flex items-center gap-3 pt-3">
        <Skeleton height={44} width={44} circle />
        <div className="flex-1 space-y-2">
          <Skeleton height={12} width="60%" />
          <Skeleton height={10} width="40%" />
        </div>
      </div>
    </div>
  </div>
);

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(`${apiUrl}/activecustomer-feedback`);
        if (!cancelled) {
          setFeedbacks(res.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load customer feedback:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchFeedbacks();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && feedbacks.length === 0) return null;

  const hasMoreThanOne = feedbacks.length > 1;

  const settings = {
    dots: hasMoreThanOne,
    arrows: hasMoreThanOne,
    infinite: hasMoreThanOne,
    speed: 600,
    autoplay: hasMoreThanOne,
    autoplaySpeed: 4500,
    pauseOnHover: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <section className="bg-gray-50 py-4 md:py-15">
      <div className="xl:container xl:mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="font-bold text-[24px] md:text-[32px] text-gray-900">
            What Our Customers Say
          </h2>
          <div className="h-1 w-20 primaryBgColor mx-auto rounded-full mt-4" />
        </div>

        {loading ? (
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => skeletonCard(i))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="customer-feedback"
          >
            <Slider {...settings}>
              {feedbacks.map((feedback) => (
                <FeedbackCard key={feedback._id} feedback={feedback} />
              ))}
            </Slider>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CustomerFeedback;
