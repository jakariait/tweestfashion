import React, { lazy, Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';

const FacebookShareButton = lazy(() =>
  import('react-share').then((module) => ({
    default: module.FacebookShareButton,
  })),
);
const FacebookIcon = lazy(() =>
  import('react-share').then((module) => ({ default: module.FacebookIcon })),
);
const TwitterShareButton = lazy(() =>
  import('react-share').then((module) => ({
    default: module.TwitterShareButton,
  })),
);
const TwitterIcon = lazy(() =>
  import('react-share').then((module) => ({ default: module.TwitterIcon })),
);
const LinkedinShareButton = lazy(() =>
  import('react-share').then((module) => ({
    default: module.LinkedinShareButton,
  })),
);
const LinkedinIcon = lazy(() =>
  import('react-share').then((module) => ({ default: module.LinkedinIcon })),
);
const WhatsappShareButton = lazy(() =>
  import('react-share').then((module) => ({
    default: module.WhatsappShareButton,
  })),
);
const WhatsappIcon = lazy(() =>
  import('react-share').then((module) => ({ default: module.WhatsappIcon })),
);

const LazySocialShareButtons = ({ url, title }) => {
  return (
    <Suspense
      fallback={
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} circle={true} height={28} width={28} />
          ))}
        </div>
      }
    >
      <div className="flex gap-1">
        <FacebookShareButton
          url={url}
          quote={title}
          aria-label="Share on Facebook"
        >
          <FacebookIcon size={28} round />
        </FacebookShareButton>
        <TwitterShareButton
          url={url}
          title={title}
          aria-label="Share on Twitter"
        >
          <TwitterIcon size={28} round />
        </TwitterShareButton>
        <LinkedinShareButton url={url} aria-label="Share on LinkedIn">
          <LinkedinIcon size={28} round />
        </LinkedinShareButton>
        <WhatsappShareButton
          url={url}
          title={title}
          separator=" - "
          aria-label="Share on WhatsApp"
        >
          <WhatsappIcon size={28} round />
        </WhatsappShareButton>
      </div>
    </Suspense>
  );
};

export default LazySocialShareButtons;
