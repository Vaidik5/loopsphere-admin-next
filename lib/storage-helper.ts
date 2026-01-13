// const getData = (key: string): unknown | undefined => {
//   try {
//     const data = localStorage.getItem(key);
 
//     if (data) {
//       return JSON.parse(data);
//     }
//   } catch (error) {
//     console.error('Read from local storage', error);
//   }
// };
 
// const setData = (key: string, value: unknown): void => {
//   try {
//     localStorage.setItem(key, JSON.stringify(value));
//   } catch (error) {
//     console.error('Save in local storage', error);
//   }
// };
 
// export { getData, setData };
 
 
 
/**
 * Get data from specified storage (localStorage or sessionStorage)
 */
const getData = (key: string, storage: Storage = localStorage): unknown | undefined => {
  try {
    const data = storage.getItem(key);
 
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Read from storage', error);
  }
};
 
/**
 * Set data in specified storage (localStorage or sessionStorage)
 */
const setData = (key: string, value: unknown, storage: Storage = localStorage): void => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Save in storage', error);
  }
};
 
/**
 * Remove data from specified storage
 */
const removeData = (key: string, storage: Storage = localStorage): void => {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error('Remove from storage', error);
  }
};
 
/**
 * Get data from either localStorage or sessionStorage (checks both)
 */
const getDataFromAnyStorage = (key: string): { value: unknown | undefined; storage: Storage | null } => {
  try {
    // First check localStorage
    const localData = localStorage.getItem(key);
    if (localData) {
      return { value: JSON.parse(localData), storage: localStorage };
    }
 
    // Then check sessionStorage
    const sessionData = sessionStorage.getItem(key);
    if (sessionData) {
      return { value: JSON.parse(sessionData), storage: sessionStorage };
    }
 
    return { value: undefined, storage: null };
  } catch (error) {
    console.error('Read from any storage', error);
    return { value: undefined, storage: null };
  }
};
 
export { getData, setData, removeData, getDataFromAnyStorage };
 
 