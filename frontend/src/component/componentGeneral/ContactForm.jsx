import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import SocialMedia from './SocialMedia.jsx';
import GeneralInfoStore from '../../store/GeneralInfoStore.js';
import axios from 'axios';

const ContactForm = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { GeneralInfoList, GeneralInfoListLoading, GeneralInfoListError } =
    GeneralInfoStore();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');
    try {
      const res = await axios.post(`${apiUrl}/contacts`, formData);
      if (res.status >= 200 && res.status < 300) {
        setStatus('success');
        setFormData({
          fullName: '',
          phoneNumber: '',
          emailAddress: '',
          message: '',
        });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (GeneralInfoListError) {
    return (
      <div className="container mx-auto text-center py-20 px-4">
        <h1 className="text-xl text-gray-600">
          Something went wrong! Please try again later.
        </h1>
      </div>
    );
  }

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primaryColor)]/20 focus:border-[var(--primaryColor)] transition-all duration-200';

  return (
    <div>
      {/* Hero */}
      <div className="primaryBgColor relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white rounded-full" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-20 text-center">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Contact Us
          </motion.h1>
          <motion.nav
            className="flex items-center justify-center gap-2 text-white/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/90">Contact Us</span>
          </motion.nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        {GeneralInfoListLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton height={420} className="!rounded-2xl" />
            <Skeleton height={420} className="!rounded-2xl" />
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            {/* Left - Contact Info */}
            <motion.div className="md:col-span-2 space-y-6" {...fadeUp}>
              <div>
                <span className="inline-block px-3 py-1 text-xs font-medium primaryBgColor text-white rounded-full mb-3">
                  Get In Touch
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  We'd love to hear from you
                </h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Have a question, feedback, or just want to say hello? Reach
                  out and we'll get back to you promptly.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="shrink-0 w-10 h-10 primaryBgColor rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Phone
                    </p>
                    <div className="flex flex-col mt-0.5">
                      {GeneralInfoList?.PhoneNumber?.map((number, i) => (
                        <a
                          key={i}
                          href={`tel:${number}`}
                          className="text-sm text-gray-800 hover:primaryTextColor transition-colors"
                        >
                          {number}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="shrink-0 w-10 h-10 primaryBgColor rounded-lg flex items-center justify-center">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </p>
                    <div className="flex flex-col mt-0.5">
                      {GeneralInfoList?.CompanyEmail?.map((email, i) => (
                        <a
                          key={i}
                          href={`mailto:${email}`}
                          className="text-sm text-gray-800 hover:primaryTextColor transition-colors"
                        >
                          {email}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="shrink-0 w-10 h-10 primaryBgColor rounded-lg flex items-center justify-center">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Address
                    </p>
                    <p className="text-sm text-gray-800 mt-0.5">
                      {GeneralInfoList?.CompanyAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Follow Us
                </p>
                <SocialMedia />
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Send us a message
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Fill out the form below and we'll respond within 24 hours.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+880 1234 567890"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="5"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us what's on your mind..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="primaryBgColor text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Map */}
        {GeneralInfoList?.GoogleMapLink && (
          <motion.div
            className="mt-12 rounded-2xl overflow-hidden shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <iframe
              className="w-full h-72 md:h-80"
              src={GeneralInfoList.GoogleMapLink}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
              sandbox="allow-scripts allow-same-origin"
            />
          </motion.div>
        )}
      </div>

      {/* Toast */}
      {status && (
        <div className="fixed top-6 right-6 z-50">
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium border ${
              status === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
            {status === 'success'
              ? "Message sent successfully! We'll get back to you soon."
              : 'Submission failed. Please try again.'}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
