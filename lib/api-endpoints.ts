const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://loopsphere.io/api'; // Fallback or from env

export const API_ENDPOINTS = {
  ADMIN_LOGIN: `${API_URL}/admin/login`,
  ADMIN_REGISTER: `${API_URL}/register`,
  ADMIN_FORGOT_PASSWORD: `${API_URL}/admin/resetPassword`,
  ADMIN_RESET_PASSWORD: `${API_URL}/admin/changePassword`,
  ADMIN_GET_USER: `${API_URL}/admin/me`,
  ADMIN_REFRESH_TOKEN: `${API_URL}/admin/refreshToken`,
  ADMIN_LIST: `${API_URL}/admin/list`,
  ADMIN_ADD: `${API_URL}/admin/add`,
  ADMIN_EDIT: `${API_URL}/admin/edit`,
  ADMIN_DELETE: `${API_URL}/admin/delete`,
  
  GET_ALL_COUNTRY: `${API_URL}/location/countries/list`,
  UPDATE_PROFILE: `${API_URL}/admin/profileUpdate`,

  CLIENT_ACTIVE: `${API_URL}/client/getActive`,
  BUSINESS_BY_CLIENT: `${API_URL}/business/getByClientForDropdown`,


  //======================CATEGORY APIS =====================
  CATEGORY_LIST: `${API_URL}/category/list`,
  CATEGORY_HIERARCHY_LIST: `${API_URL}/category/hierarchy`,
  CATEGORY_DETAILS: `${API_URL}/category`,
  CATEGORY_ADD: `${API_URL}/category/add`,
  CATEGORY_EDIT: `${API_URL}/category/edit`,
  CATEGORY_DELETE: `${API_URL}/category/delete`,
  GET_ACTIVE_CATEGORY: `${API_URL}/category/getActive`,

  //======================BUSINESS-CATEGORY APIS =====================
  BUSINESS_CATEGORY_ADD: `${API_URL}/business-icon-category/add`,
  BUSINESS_CATEGORY_EDIT: `${API_URL}/business-icon-category/edit`,
  BUSINESS_CATEGORY_GET_BY_ID: `${API_URL}/business-icon-category`,
  BUSINESS_CATEGORY_DELETE: `${API_URL}/business-icon-category/delete`,
  BUSINESS_CATEGORY_LiST: `${API_URL}/business-icon-category/list`,

  //======================WATERMARK APIS =====================
  ADD_WATERMARK_SETTINGS: `${API_URL}/general-settings/add-or-edit`,
  VIEW_WATERMARK_SETTINGS: `${API_URL}/general-settings/view`,


  //======================BUSINESS-ICON APIS =====================
  BUSINESS_ICON_ADD: `${API_URL}/business-icon/add`,
  BUSINESS_ICON_EDIT: `${API_URL}/business-icon/edit`,
  BUSINESS_ICON_GET_BY_ID: `${API_URL}/business-icon`,
  BUSINESS_ICON_DELETE: `${API_URL}/business-icon/delete`,
  BUSINESS_ICON_LiST: `${API_URL}/business-icon/list`,
  ACTIVE_BUSINESS_CATEGORY_LiST: `${API_URL}/business-icon-category/getActive`,

  //======================ICON-CATEGORY APIS =====================
  CATEGORY_ICON_ADD: `${API_URL}/resource-library/add`,
  CATEGORY_ICON_DELETE: `${API_URL}/resource-library/delete`,
  CATEGORY_ICON_LiST: `${API_URL}/resource-library/list`,
  CATEGORY_ICON_UPDATE_STATUS: `${API_URL}/resource-library/update-status`,

  //======================SPHERE NODE APIS =====================
  PANORAMA_ADD: `${API_URL}/spherenode/add`,
  PANORAMA_EDIT: `${API_URL}/spherenode/edit`,
};
