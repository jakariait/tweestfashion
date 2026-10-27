import { create } from 'zustand';

const useBreadcrumbStore = create((set) => ({
  pageDetails: '',
  title: '',
  setBreadcrumb: (pageDetails, title) => set({ pageDetails, title }),
}));

export default useBreadcrumbStore;
