'use client';

import AimList from '../../components/AimList';

export default function AimsPage() {
  return (
    <div className="min-h-screen bg-zaman-cloud flex justify-center py-10">
      <div
        className="
          max-w-5xl w-full rounded-2xl shadow-lg 
          bg-gradient-to-br 
          from-zaman-persianGreen 
          via-zaman-solar 
          to-zaman-cloud 
          p-6
        "
      >
        <AimList />
      </div>
    </div>
  );
}
