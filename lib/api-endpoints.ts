const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.188:3000/api'; // Fallback or from env

export const API_ENDPOINTS = {
  ADMIN_LOGIN: `${API_URL}/admin/login`,
  ADMIN_REGISTER: `${API_URL}/register`,
  ADMIN_FORGOT_PASSWORD: `${API_URL}/admin/resetPassword`,
  ADMIN_RESET_PASSWORD: `${API_URL}/admin/changePassword`,
  ADMIN_GET_USER: `${API_URL}/admin/me`,
  ADMIN_REFRESH_TOKEN: `${API_URL}/admin/refreshToken`,
  GET_ALL_COUNTRY: `${API_URL}/location/countries/list`,
  UPDATE_PROFILE: `${API_URL}/admin/profileUpdate`,

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
  PANORAMA_DETAILS: `${API_URL}/spherenode`,
  PANORAMA_LIST: `${API_URL}/spherenode/list`,
  PANORAMA_DELETE: `${API_URL}/spherenode/delete`,
  GET_ASSOCIATE_HOTSPORT: `${API_URL}/spherenode`,
  PANORAMA_DROPDOWN: `${API_URL}/hotspot/dropdown`,
  NODE_DROPDOWN: `${API_URL}/spherenode/dropdown`,
  GET_SPHERE_NODE_LIST: `${API_URL}/spherenode/list`,
  PANAROMA_CLIENT_LIST: `${API_URL}/client/getActive`,
  BUSINESS_UNIT_LIST: `${API_URL}/business/getActive`,
  BUSINESS_TABLE_LIST: `${API_URL}/business/list`,

  //======================CATEGORY APIS =====================
  BRAND_LIST: `${API_URL}/api/brand/dropdown`,

  //======================HOTSPOT APIS =====================
  ADD_HOTSPOT: `${API_URL}/hotspot/add`,
  EDIT_HOTSPOT: `${API_URL}/hotspot/edit`,
  COPY_HOTSPOT: `${API_URL}/hotspot/duplicate`,
  DELETE_HOTSPOT: `${API_URL}/hotspot/delete`,
  HOTSPOT_DETAILS: `${API_URL}/hotspot`,
  GET_HOTSPOT_BY_NODE: `${API_URL}/spherenode/{node_id}/hotspots`,

  //======================ADMIN-USERS API =====================
  GET_ALL_ADMIN_USERS_LIST: `${API_URL}/admin/list`,
  GET_BY_ID_ADMINS: `${API_URL}/admin`,
  ADD_ADMIN_USERS: `${API_URL}/admin/add`,
  EDIT_ADMIN_USERS: `${API_URL}/admin/edit`,
  DELETE_ADMIN_USERS: `${API_URL}/admin/delete`,
  LOGIN_USER: `${API_URL}/admin/login`,

  GET_CURRENCY_LIST: `${API_URL}/admin/currency`,

  //======================BRANDLIST API =====================
  GET_DROPDOWN_BRAND: `${API_URL}/brand/dropdown`,
  GET_BY_ID_BRAND: `${API_URL}/brand`,
  ADD_BRAND: `${API_URL}/brand/add`,
  EDIT_BRAND: `${API_URL}/brand/edit`,
  DELETE_BRAND: `${API_URL}/brand/delete`,
  GET_ALL_BRAND_LIST: `${API_URL}/brand/list`,

  //======================CLIENT API =====================
  GET_BY_ID_CLIENT: `${API_URL}/client`,
  ADD_CLIENT: `${API_URL}/client/add`,
  EDIT_CLIENT: `${API_URL}/client/edit`,
  DELETE_CLIENT: `${API_URL}/client/delete`,
  GET_ALL_CLIENT_LIST: `${API_URL}/client/list`,
  CLIENT_PROFILE: `${API_URL}/client/profile`,

  GET_BY_CLIENT_BUSINESS: `${API_URL}/business/getByClientForDropdown`,
  CATEGORY_ICON_ASSIGN_CLIENT_BU: `${API_URL}/resource-library/assign`,

  //======================INQUIRYS APIS =====================
  INQUIRY_LIST: `${API_URL}/enquiry/list`,
  DELETE_INQUIRY: `${API_URL}/enquiry/delete`,
  GET_BY_INQUIRY: `${API_URL}/enquiry`,
  ADD_INQUIRY: `${API_URL}/enquiry/send`,
  EDIT_INQUIRY: `${API_URL}/enquiry/edit`,
  FILTER_PRODUCT_INQUIRY: `${API_URL}/enquiry/list`,

  //======================PRODUCTS APIS =====================
  ADD_PRODUCTS: `${API_URL}/product/add`,
  EDIT_PRODUCTS: `${API_URL}/product/edit`,
  DELETE_PRODUCTS: `${API_URL}/product/delete`,
  GET_BY_ID_PRODUCT: `${API_URL}/product/admin`,
  GET_ALL_PRODUCTS_LIST: `${API_URL}/product/list`,
  PRODUCTS_DROPDOWN: `${API_URL}/product/dropdown`,

  //======================BUSINESS APIS =====================
  BUSINESS_NODE_LIST: `${API_URL}/client/sphereNodelistByClientId`,
  ADD_BUSINESS_UNIT: `${API_URL}/business/add`,
  EDIT_BUSINESS_UNIT: `${API_URL}/business/edit`,
  GET_BY_BUSINESS_UNIT_ID: `${API_URL}/business`,
  DELETE_BUSINESS_UNIT: `${API_URL}/business/delete`,
  BUSINESS_UNIT_PROFILE: `${API_URL}/business/profile`,
  //======================PRODUCTS APIS =====================

  GET_STATE_BY_COUNTRY_LOCATION: `${API_URL}/location/states/by-country`,
  GET_CITIES_BY_STATE_LOCATION: `${API_URL}/location/cities/by-state`,
  GET_BY_COUNTRY_LOCATION: `${API_URL}/location/countries`,
  ADD_COUNTRY_LOCATION: `${API_URL}/location/countries/add`,
  EDIT_COUNTRY_LOCATION: `${API_URL}/location/countries/edit`,
  DELETE_COUNTRY_LOCATION: `${API_URL}/location/countries/delete`,
  GET_BY_STATE_LOCATION: `${API_URL}/location/states`,
  ADD_STATE_LOCATION: `${API_URL}/location/states/add`,
  EDIT_STATE_LOCATION: `${API_URL}/location/states/edit`,
  DELETE_STATE_LOCATION: `${API_URL}/location/states/delete`,
  STATE_LIST_LOCATION: `${API_URL}/location/states/list`,

//======================ROLES APIS =====================
  GET_ROLES: `${API_URL}/role/list?page=1`,
  ADD_ROLE: `${API_URL}/roles/add`,
  EDIT_ROLE: `${API_URL}/roles/edit`,
  DELETE_ROLE: `${API_URL}/roles/delete`,
  GET_BY_ID_ROLE: `${API_URL}/roles`,
  GET_ACTIVE_ROLES: `${API_URL}/roles/getActive`,
};
