import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await axios.get(`${apiUrl}/faq`);
        const publishedFaqs =
          res.data?.data?.filter((faq) => faq.status === 'published') || [];
        setFaqs(publishedFaqs);
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [apiUrl]);

  const toggleFAQ = (id) => setOpenId(openId === id ? null : id);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 xl:container xl:mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 text-sm font-medium primaryBgColor text-white rounded-full mb-4">
          Got Questions?
        </span>
        <h2 className="font-bold text-3xl md:text-5xl text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="h-1 w-20 primaryBgColor mx-auto rounded-full mt-4" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse mx-2"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq._id;
            return (
              <div
                key={faq._id}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-primaryColor/20 shadow-lg shadow-primaryColor/5'
                    : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(faq._id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-base text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isOpen
                        ? 'primaryBgColor text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FAQSection;
