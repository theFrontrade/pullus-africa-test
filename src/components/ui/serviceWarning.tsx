import { useEffect, useState } from 'react';

const ServiceWorkerWarning = ({ isSupported }: { isSupported: boolean }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isSupported) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg">
        Offline mode not supported in this browser
      </div>
    </div>
  );
};

export default ServiceWorkerWarning;
