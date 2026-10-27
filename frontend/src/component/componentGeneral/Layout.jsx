import Headers from './Headers.jsx';
import Footer from './Footer.jsx';
import MarqueeModern from './MarqueeModern.jsx';
import { Toaster } from '@/components/ui/sonner';
import WhatsAppButton from '@/component/componentGeneral/WhatsAppButton.jsx';
import FreeDeliveryBar from '@/component/componentGeneral/FreeDeliveryBar.jsx';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <MarqueeModern />
      <FreeDeliveryBar />
      <Headers />
      <Toaster position="top-right" />
      <main className="flex-grow flex flex-col">{children}</main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Layout;
