import React from 'react';
import GeneralInfoStore from '../../store/GeneralInfoStore.js';
import { Link } from 'react-router-dom';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@/components/ui/accordion';
import { ChevronDown as ExpandMoreIcon } from 'lucide-react';
import NewsletterForm from './NewsletterForm.jsx';
import SocialMedia from './SocialMedia.jsx';
import Skeleton from 'react-loading-skeleton';

const Footer = () => {
  const { GeneralInfoList, GeneralInfoListLoading, GeneralInfoListError } =
    GeneralInfoStore();

  if (GeneralInfoListError) {
    return (
      <div className="primaryTextColor  container md:mx-auto text-center p-3">
        <h1 className={'p-20'}>
          Something went wrong! Please try again later.
        </h1>
      </div>
    ); // Display error message
  }
  return (
    <div>
      {GeneralInfoListLoading ? (
        <>
          <div
            className={
              'grid grid-cols-2 md:grid-cols-4 gap-3 xl:container xl:mx-auto p-3'
            }
          >
            <Skeleton height={200} width={'100%'} />
            <Skeleton height={200} width={'100%'} />
            <Skeleton height={200} width={'100%'} />
            <Skeleton height={200} width={'100%'} />
          </div>
          <Skeleton height={40} width={'100%'} />
        </>
      ) : (
        <>
          <div className={'secondaryBgColor accentTextColor  '}>
            {' '}
            {/*Mobile Footer*/}
            <div className={' lg:hidden px-0 py-3'}>
              {/* About Us */}
              <Accordion className="bg-transparent border-0 shadow-none rounded-none text-white">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className="text-white" />}
                >
                  About Us
                </AccordionSummary>
                <AccordionDetails>
                  <p>{GeneralInfoList?.ShortDescription}</p>
                  <h2 className="mb-3 mt-3">Follow Us</h2>
                  <SocialMedia />
                </AccordionDetails>
              </Accordion>

              {/* Quick Links */}
              <Accordion className="bg-transparent border-0 shadow-none rounded-none text-white">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className="text-white" />}
                >
                  Quick Links
                </AccordionSummary>
                <AccordionDetails>
                  <ul>
                    <li className="hover:text-gray-300">
                      <Link to="/about">About</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/blog">Blog</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/brands">Brands</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/contact-us">Contact</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/termofservice">Terms of Services</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/privacypolicy">Privacy Policy</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/refundpolicy">Refund Policy</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/shippinpolicy">Shipping Policy</Link>
                    </li>
                    <li className="hover:text-gray-300">
                      <Link to="/faqs">FAQ</Link>
                    </li>
                  </ul>
                </AccordionDetails>
              </Accordion>

              {/* Newsletter */}
              <Accordion className="bg-transparent border-0 shadow-none rounded-none text-white">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className="text-white" />}
                >
                  Newsletter
                </AccordionSummary>
                <AccordionDetails>
                  <h2 className="text-sm font-medium">
                    Take advantage of our special offer. Do not worry, we would
                    not spam you.
                  </h2>
                  <NewsletterForm />
                </AccordionDetails>
              </Accordion>
              {/* Track Order */}
              <Link
                to="/track-order"
                className="flex items-center gap-2 ml-4 pt-2 pb-2 "
              >
                <p>Track Your Order</p>{' '}
              </Link>
            </div>
            {/*Desktop Footer*/}
            <div
              className={
                'xl:container xl:mx-auto lg:grid grid-cols-1 lg:grid-cols-12 gap-10 justify-between py-10 px-6  hidden'
              }
            >
              <div className={'col-span-6 relative'}>
                <h2 className={'mb-3'}>
                  About Us
                  <span className="absolute left-0 top-6 w-15 border-b-2 border-gray-300 mt-1"></span>
                </h2>
                <p>{GeneralInfoList?.ShortDescription}</p>
                <h2 className={'mb-3 mt-3'}>Follow Us</h2>
                <SocialMedia />
              </div>

              <div className={'col-span-3 relative'}>
                <h2 className={'mb-3'}>
                  Quick Links
                  <span className="absolute left-0 top-6 w-15 border-b-2 border-gray-300 mt-1"></span>
                </h2>
                <ul className="text-white">
                  <li className={'hover:text-gray-300'}>
                    <Link to="/about">About</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/blog">Blog</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/brands">Brands</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/contact-us">Contact</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/termofservice">Terms of Services</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/privacypolicy">Privacy Policy</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/refundpolicy">Refund Policy</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/shippinpolicy">Shipping Policy</Link>
                  </li>
                  <li className={'hover:text-gray-300'}>
                    <Link to="/faqs">FAQ</Link>
                  </li>
                </ul>
              </div>
              {/*Newsletters*/}
              <div className={'col-span-3 relative '}>
                <h2 className={'mb-3'}>
                  Newsletters
                  <span className="absolute left-0 top-6 w-15 border-b-2 border-gray-200 mt-1"></span>
                </h2>

                <p>
                  Take advantage of our special offer. Do not worry, we would
                  not spam you
                </p>
                {/*Newsletters Form*/}
                <NewsletterForm />
              </div>
            </div>
            <div
              className={
                'text-center pb-5 pt-5 flex flex-col md:flex-row items-center justify-center gap-3'
              }
            >
              <p>
                © {new Date().getFullYear()} {GeneralInfoList?.CompanyName}. All
                Rights Reserved.
              </p>
              <p>
                Design and Developed by{' '}
                <a
                  href="https://www.digiwebdigital.com/"
                  className={'text-green-500 hover:underline'}
                >
                  DigiWeb
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Footer;
