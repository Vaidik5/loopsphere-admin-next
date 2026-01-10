import { create } from 'zustand';
import { ImageInputFile } from './types';

interface UserFormState {
  // Form data
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  isdCode: string;
  countryId: string;
  role: string;
  status: string;
  clientId: string;
  businessUnitId: string;
  image: ImageInputFile | null;
  imageFiles: ImageInputFile[];

  // UI state
  countrySearch: string;
  selectIsdOpen: boolean;
  dataLoading: boolean;
  submitting: boolean;

  // Original values for edit mode
  originalValues: {
    email: string;
    isdCode: string;
    countryId: string;
    mobileNumber: string;
  };

  // Actions - Form data
  setField: <K extends keyof Omit<UserFormState, 'setField' | 'reset' | 'setOriginalValues' | 'setImageFiles' | 'setCountrySearch' | 'setSelectIsdOpen' | 'setDataLoading' | 'setSubmitting'>>(
    field: K,
    value: UserFormState[K]
  ) => void;
  reset: () => void;
  setOriginalValues: (values: Partial<UserFormState['originalValues']>) => void;

  // Actions - UI state
  setImageFiles: (files: ImageInputFile[]) => void;
  setCountrySearch: (search: string) => void;
  setSelectIsdOpen: (open: boolean) => void;
  setDataLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
}

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  mobileNumber: '',
  isdCode: '',
  countryId: '',
  role: '',
  status: 'active',
  clientId: '',
  businessUnitId: '',
  image: null,
  imageFiles: [],
  countrySearch: '',
  selectIsdOpen: false,
  dataLoading: false,
  submitting: false,
  originalValues: {
    email: '',
    isdCode: '',
    countryId: '',
    mobileNumber: '',
  },
};

export const useUserFormStore = create<UserFormState>((set) => ({
  ...initialFormState,

  setField: (field, value) => {
    set({ [field]: value } as Partial<UserFormState>);
  },

  reset: () => {
    set(initialFormState);
  },

  setOriginalValues: (values) => {
    set((state) => ({
      originalValues: { ...state.originalValues, ...values },
    }));
  },

  setImageFiles: (files) => {
    set({ imageFiles: files, image: files[0] || null });
  },

  setCountrySearch: (search) => {
    set({ countrySearch: search });
  },

  setSelectIsdOpen: (open) => {
    set({ selectIsdOpen: open });
    if (!open) {
      set({ countrySearch: '' });
    }
  },

  setDataLoading: (loading) => {
    set({ dataLoading: loading });
  },

  setSubmitting: (submitting) => {
    set({ submitting });
  },
}));
