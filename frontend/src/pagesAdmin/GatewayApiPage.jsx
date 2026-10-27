import React, { useEffect, useState } from 'react';
import AdminBkashConfig from '../component/componentAdmin/AdminBkashConfig.jsx';
import AdminSteadfastConfig from '../component/componentAdmin/AdminSteadfastConfig.jsx';
import AdminPathaoConfig from '../component/componentAdmin/AdminPathaoConfig.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const TABS = [
  { id: 'bkash', label: 'bKash', permission: 'bkash_api' },
  { id: 'steadfast', label: 'Steadfast', permission: 'steadfast_api' },
  { id: 'pathao', label: 'Pathao', permission: 'pathao_api' },
];

const GatewayApiPage = () => {
  const [activeTab, setActiveTab] = useState('bkash');
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'Gateway & API');
  }, []);

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {TABS.map((tab) => (
            <RequirePermission
              key={tab.id}
              permission={tab.permission}
              fallback={true}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            </RequirePermission>
          ))}
        </nav>
      </div>

      {activeTab === 'bkash' && (
        <RequirePermission permission="bkash_api">
          <AdminBkashConfig />
        </RequirePermission>
      )}
      {activeTab === 'steadfast' && (
        <RequirePermission permission="steadfast_api">
          <AdminSteadfastConfig />
        </RequirePermission>
      )}
      {activeTab === 'pathao' && (
        <RequirePermission permission="pathao_api">
          <AdminPathaoConfig />
        </RequirePermission>
      )}
    </div>
  );
};

export default GatewayApiPage;
